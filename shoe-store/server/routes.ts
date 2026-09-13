import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as storage from "./storage";
import { hashPassword, verifyPassword, requireAuth, toPublicUser } from "./auth";
import { stripe, isStripeConfigured } from "./stripe";
import {
  registerSchema,
  loginSchema,
  insertProductSchema,
  cartItemInputSchema,
  checkoutSchema,
  type ProductSizeStock,
} from "../shared/schema";

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
  const user = await storage.getUserById(req.session.userId);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}

function parseSizes(sizesJson: string): ProductSizeStock[] {
  try {
    const parsed = JSON.parse(sizesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registerRoutes(app: Express) {
  // ---- Config ----
  app.get("/api/config", (_req, res) => {
    res.json({ stripeEnabled: isStripeConfigured() });
  });

  // ---- Auth ----
  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { name, email, password } = parsed.data;

    const existing = await storage.getUserByEmail(email.toLowerCase());
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const userCount = await storage.countUsers();
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const role = userCount === 0 || (adminEmail && email.toLowerCase() === adminEmail) ? "admin" : "customer";

    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({ email: email.toLowerCase(), passwordHash, name, role });
    req.session.userId = user.id;
    res.status(201).json(toPublicUser(user));
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid email or password" });
    const { email, password } = parsed.data;

    const user = await storage.getUserByEmail(email.toLowerCase());
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    req.session.userId = user.id;
    res.json(toPublicUser(user));
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.status(204).end());
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    res.json(toPublicUser(user));
  });

  // ---- Products (public) ----
  app.get("/api/products", async (_req, res) => {
    const list = await storage.listProducts();
    res.json(list);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product || !product.active) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // ---- Products (admin) ----
  app.get("/api/admin/products", requireAdmin, async (_req, res) => {
    const list = await storage.listProducts({ includeInactive: true });
    res.json(list);
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const product = await storage.updateProduct(Number(req.params.id), parsed.data);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  // ---- Cart (auth required) ----
  app.get("/api/cart", requireAuth, async (req, res) => {
    const cart = await storage.getCart(req.session.userId!);
    res.json(cart);
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    const parsed = cartItemInputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { productId, size, quantity } = parsed.data;

    const product = await storage.getProduct(productId);
    if (!product || !product.active) return res.status(404).json({ message: "Product not found" });
    const sizes = parseSizes(product.sizes);
    const sizeEntry = sizes.find((s) => s.size === size);
    if (!sizeEntry || sizeEntry.stock < 1) return res.status(400).json({ message: "Selected size is out of stock" });

    const item = await storage.addToCart(req.session.userId!, productId, size, quantity);
    res.status(201).json(item);
  });

  app.put("/api/cart/:id", requireAuth, async (req, res) => {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Invalid quantity" });
    const item = await storage.updateCartItem(req.session.userId!, Number(req.params.id), quantity);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.json(item);
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    await storage.removeCartItem(req.session.userId!, Number(req.params.id));
    res.status(204).end();
  });

  // ---- Checkout ----
  app.post("/api/checkout", requireAuth, async (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    const { shippingName, shippingAddress, shippingPhone, paymentMethod } = parsed.data;

    const cart = await storage.getCart(req.session.userId!);
    if (cart.length === 0) return res.status(400).json({ message: "Your cart is empty" });

    if (paymentMethod === "stripe" && !isStripeConfigured()) {
      return res.status(400).json({ message: "Card payments are not configured yet. Please choose Cash on Delivery." });
    }

    // Validate stock for every item before creating the order.
    for (const item of cart) {
      const sizes = parseSizes(item.product.sizes);
      const sizeEntry = sizes.find((s) => s.size === item.size);
      if (!sizeEntry || sizeEntry.stock < item.quantity) {
        return res.status(400).json({ message: `${item.product.name} (size ${item.size}) doesn't have enough stock` });
      }
    }

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderItemsData = cart.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    let stripeClientSecret: string | undefined;
    let stripePaymentIntentId: string | undefined;

    if (paymentMethod === "stripe" && stripe) {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        automatic_payment_methods: { enabled: true },
      });
      stripeClientSecret = intent.client_secret ?? undefined;
      stripePaymentIntentId = intent.id;
    }

    const order = await storage.createOrder(
      req.session.userId!,
      {
        total,
        shippingName,
        shippingAddress,
        shippingPhone,
        paymentMethod,
        status: paymentMethod === "cod" ? "cod" : "pending_payment",
        stripePaymentIntentId,
      },
      orderItemsData,
    );

    // Decrement stock now; for card payments this reserves stock optimistically.
    for (const item of cart) {
      const product = item.product;
      const sizes = parseSizes(product.sizes);
      const updatedSizes = sizes.map((s) => (s.size === item.size ? { ...s, stock: s.stock - item.quantity } : s));
      await storage.updateProduct(product.id, { sizes: JSON.stringify(updatedSizes) });
    }

    await storage.clearCart(req.session.userId!);

    res.status(201).json({ order, stripeClientSecret });
  });

  app.post("/api/orders/:id/confirm-payment", requireAuth, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order || order.userId !== req.session.userId) return res.status(404).json({ message: "Order not found" });
    if (!stripe || !order.stripePaymentIntentId) return res.status(400).json({ message: "No payment to confirm" });

    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (intent.status === "succeeded") {
      const updated = await storage.updateOrderStatus(order.id, "paid");
      return res.json(updated);
    }
    res.status(400).json({ message: `Payment not completed yet (status: ${intent.status})` });
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const orders = await storage.getOrdersForUser(req.session.userId!);
    res.json(orders);
  });

  // ---- Admin: orders ----
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  const orderStatusSchema = z.object({
    status: z.enum(["pending_payment", "cod", "paid", "shipped", "delivered", "cancelled"]),
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const parsed = orderStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });
    const order = await storage.updateOrderStatus(Number(req.params.id), parsed.data.status);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });
}
