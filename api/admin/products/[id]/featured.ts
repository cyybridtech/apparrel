import { db } from "../../../../src/db/index.js";
import { products } from "../../../../src/db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  let id = Number(req.query.id);
  if (!id || isNaN(id)) {
    const parts = (req.url || "").split("?")[0].split("/");
    const idIdx = parts.indexOf("products") + 1;
    if (idIdx > 0 && parts[idIdx]) {
      id = Number(parts[idIdx]);
    }
  }

  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { featured, slug } = req.body;

    // Ensure is_featured column exists in TiDB Cloud
    try {
      await db.execute(sql`ALTER TABLE \`products\` ADD COLUMN \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0`);
    } catch {}

    // Unset ALL existing featured products first
    try {
      await db.execute(sql`UPDATE \`products\` SET \`is_featured\` = 0`);
    } catch {}

    // Set target product featured status
    if (featured) {
      if (slug) {
        try {
          await db.execute(sql`UPDATE \`products\` SET \`is_featured\` = 1 WHERE \`slug\` = ${slug} OR \`id\` = ${id}`);
        } catch {
          if (id) {
            try { await db.update(products).set({ isFeatured: true }).where(eq(products.id, id)); } catch {}
          }
        }
      } else if (id) {
        try {
          await db.execute(sql`UPDATE \`products\` SET \`is_featured\` = 1 WHERE \`id\` = ${id}`);
        } catch {
          try { await db.update(products).set({ isFeatured: true }).where(eq(products.id, id)); } catch {}
        }
      }
    }

    return res.status(200).json({ ok: true, id, slug, featured: Boolean(featured) });
  } catch (err: any) {
    console.error("PATCH /api/admin/products/:id/featured failed", err);
    return res.status(500).json({ error: "Failed to update featured product", message: err?.message || String(err) });
  }
}
