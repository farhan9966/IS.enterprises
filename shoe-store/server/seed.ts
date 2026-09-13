import "dotenv/config";
import { migrate } from "./db";
import * as storage from "./storage";
import { hashPassword } from "./auth";

const SAMPLE_PRODUCTS = [
  {
    name: "Classic White Sneakers",
    description: "Everyday comfort sneakers with a clean white leather look. Goes with everything.",
    price: 59.99,
    category: "sneakers",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
    sizes: JSON.stringify([
      { size: "39", stock: 8 },
      { size: "40", stock: 12 },
      { size: "41", stock: 10 },
      { size: "42", stock: 6 },
      { size: "43", stock: 4 },
    ]),
  },
  {
    name: "Runner Pro Trainers",
    description: "Lightweight running shoes with breathable mesh and cushioned sole for daily training.",
    price: 79.99,
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    sizes: JSON.stringify([
      { size: "40", stock: 5 },
      { size: "41", stock: 9 },
      { size: "42", stock: 11 },
      { size: "44", stock: 3 },
    ]),
  },
  {
    name: "Brown Leather Loafers",
    description: "Handcrafted leather loafers, perfect for office wear or a smart-casual look.",
    price: 89.99,
    category: "formal",
    imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800",
    sizes: JSON.stringify([
      { size: "40", stock: 6 },
      { size: "41", stock: 6 },
      { size: "42", stock: 8 },
      { size: "43", stock: 5 },
    ]),
  },
  {
    name: "Black High-Top Sneakers",
    description: "Bold high-top sneakers with a padded ankle collar for extra street style.",
    price: 69.99,
    category: "sneakers",
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800",
    sizes: JSON.stringify([
      { size: "39", stock: 4 },
      { size: "40", stock: 7 },
      { size: "42", stock: 9 },
      { size: "43", stock: 2 },
    ]),
  },
  {
    name: "Kids Velcro Sports Shoes",
    description: "Easy velcro-strap sports shoes built for active kids, durable and machine washable.",
    price: 34.99,
    category: "kids",
    imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
    sizes: JSON.stringify([
      { size: "28", stock: 10 },
      { size: "30", stock: 10 },
      { size: "32", stock: 8 },
    ]),
  },
  {
    name: "Women's Casual Flats",
    description: "Soft, flexible flats designed for all-day comfort without sacrificing style.",
    price: 44.99,
    category: "casual",
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
    sizes: JSON.stringify([
      { size: "36", stock: 7 },
      { size: "37", stock: 9 },
      { size: "38", stock: 9 },
      { size: "39", stock: 5 },
    ]),
  },
];

async function seed() {
  migrate();

  const existingProducts = await storage.listProducts({ includeInactive: true });
  if (existingProducts.length === 0) {
    for (const p of SAMPLE_PRODUCTS) {
      await storage.createProduct({ ...p, active: true });
    }
    console.log(`Seeded ${SAMPLE_PRODUCTS.length} sample products.`);
  } else {
    console.log("Products already exist, skipping product seed.");
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";

  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await storage.createUser({ email: adminEmail, passwordHash, name: "Store Admin", role: "admin" });
    console.log(`Created admin account: ${adminEmail} / ${adminPassword}`);
    console.log("IMPORTANT: change this password after first login.");
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
