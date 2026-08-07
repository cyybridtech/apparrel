import "dotenv/config";
import { db } from "../db";
import { ensureSchema } from "./setup";
import { sql } from "drizzle-orm";

async function migrate() {
  await ensureSchema();

  const queries = [
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'footwear'`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE product_sizes ADD COLUMN IF NOT EXISTS size_label VARCHAR(20) NOT NULL DEFAULT ''`,
    `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size_label VARCHAR(20) NOT NULL DEFAULT ''`,
  ];

  for (const q of queries) {
    try {
      await db.execute(sql.raw(q));
      console.log("✓ OK:", q.slice(0, 70));
    } catch (err: any) {
      console.log("⚠ SKIP:", err.message?.slice(0, 100));
    }
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
