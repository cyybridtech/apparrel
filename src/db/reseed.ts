/**
 * Wipes the product catalog and re-seeds everything including new clothing items.
 * Run: npx tsx --import ./src/server/preload.ts src/db/reseed.ts
 */
import "dotenv/config";
import { db } from "../db";
import { products, productSizes, cartItems, orderItems, orders } from "../db/schema";
import { sql } from "drizzle-orm";

async function reseed() {
  console.log("🗑  Clearing tables...");

  // Disable FK checks, clear all, re-enable
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE order_items`);
  await db.execute(sql`TRUNCATE TABLE orders`);
  await db.execute(sql`TRUNCATE TABLE cart_items`);
  await db.execute(sql`TRUNCATE TABLE product_sizes`);
  await db.execute(sql`TRUNCATE TABLE products`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  console.log("✓ Tables cleared. Seeding...");

  // Let ensureSeed re-run from scratch
  const { ensureSeed } = await import("../db/seed");
  await ensureSeed();

  console.log("✅ Reseed complete!");
  process.exit(0);
}

reseed().catch((e) => {
  console.error("❌ Reseed failed:", e);
  process.exit(1);
});
