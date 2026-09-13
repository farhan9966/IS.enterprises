import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["customer", "admin"] })
    .notNull()
    .default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),
  category: text("category").notNull().default("shoes"),
  imageUrl: text("image_url").notNull().default(""),
  // JSON string: [{ "size": "42", "stock": 10 }, ...]
  sizes: text("sizes").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", {
    enum: ["pending_payment", "cod", "paid", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending_payment"),
  total: real("total").notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  paymentMethod: text("payment_method", { enum: ["stripe", "cod"] })
    .notNull()
    .default("cod"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// ---- Zod schemas ----

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type ProductSizeStock = { size: string; stock: number };

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export type PublicUser = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
};

export const cartItemInputSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1),
  quantity: z.number().int().positive().max(20).default(1),
});
export type CartItemInput = z.infer<typeof cartItemInputSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type CartItemWithProduct = CartItem & { product: Product };

export const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingAddress: z.string().min(5),
  shippingPhone: z.string().min(7),
  paymentMethod: z.enum(["stripe", "cod"]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };
