import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  products,
  cartItems,
  orders,
  orderItems,
  type InsertProduct,
  type Product,
  type CartItemWithProduct,
  type OrderWithItems,
} from "../shared/schema";

// ---- Users ----

export async function createUser(data: { email: string; passwordHash: string; name: string; role?: "customer" | "admin" }) {
  const [user] = await db
    .insert(users)
    .values({ email: data.email, passwordHash: data.passwordHash, name: data.name, role: data.role ?? "customer" })
    .returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function countUsers() {
  const rows = await db.select().from(users);
  return rows.length;
}

// ---- Products ----

export async function listProducts(opts: { includeInactive?: boolean } = {}) {
  const rows = await db.select().from(products);
  return opts.includeInactive ? rows : rows.filter((p) => p.active);
}

export async function getProduct(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function createProduct(data: InsertProduct): Promise<Product> {
  const [product] = await db.insert(products).values(data).returning();
  return product;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
  return product;
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

// ---- Cart ----

export async function getCart(userId: number): Promise<CartItemWithProduct[]> {
  const rows = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  const result: CartItemWithProduct[] = [];
  for (const row of rows) {
    const product = await getProduct(row.productId);
    if (product) result.push({ ...row, product });
  }
  return result;
}

export async function addToCart(userId: number, productId: number, size: string, quantity: number) {
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId), eq(cartItems.size, size)));

  if (existing) {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(cartItems).values({ userId, productId, size, quantity }).returning();
  return created;
}

export async function updateCartItem(userId: number, itemId: number, quantity: number) {
  const [updated] = await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
    .returning();
  return updated;
}

export async function removeCartItem(userId: number, itemId: number) {
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ---- Orders ----

export async function createOrder(
  userId: number,
  data: {
    total: number;
    shippingName: string;
    shippingAddress: string;
    shippingPhone: string;
    paymentMethod: "stripe" | "cod";
    status: "pending_payment" | "cod" | "paid";
    stripePaymentIntentId?: string;
  },
  items: { productId: number; productName: string; size: string; quantity: number; price: number }[],
): Promise<OrderWithItems> {
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      total: data.total,
      shippingName: data.shippingName,
      shippingAddress: data.shippingAddress,
      shippingPhone: data.shippingPhone,
      paymentMethod: data.paymentMethod,
      status: data.status,
      stripePaymentIntentId: data.stripePaymentIntentId,
    })
    .returning();

  const insertedItems = [];
  for (const item of items) {
    const [oi] = await db
      .insert(orderItems)
      .values({ orderId: order.id, ...item })
      .returning();
    insertedItems.push(oi);
  }

  return { ...order, items: insertedItems };
}

export async function getOrdersForUser(userId: number): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId));
  const result: OrderWithItems[] = [];
  for (const order of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    result.push({ ...order, items });
  }
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders);
  const result: OrderWithItems[] = [];
  for (const order of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    result.push({ ...order, items });
  }
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateOrderStatus(id: number, status: string) {
  const [order] = await db.update(orders).set({ status: status as any }).where(eq(orders.id, id)).returning();
  return order;
}

export async function getOrder(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order;
}
