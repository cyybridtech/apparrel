import { db } from "../../../../src/db/index.js";
import { products } from "../../../../src/db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { featured } = req.body;
    if (featured) {
      await db.update(products).set({ isFeatured: false }).where(sql`1=1`);
    }
    await db.update(products).set({ isFeatured: Boolean(featured) }).where(eq(products.id, id));
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("PATCH /api/admin/products/:id/featured failed", err);
    return res.status(500).json({ error: "Failed to update featured product", message: err?.message || String(err) });
  }
}
