import { db } from "../../../src/db";
import { products, productSizes } from "../../../src/db/schema";
import { and, asc, eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  try {
    if (req.method === "PUT") {
      const {
        name,
        brand,
        category,
        colorway,
        description,
        image,
        accent,
        priceCents,
        compareAtCents,
        weightGrams,
        terrain,
        stockMap,
      } = req.body;

      await db.update(products).set({
        name,
        brand,
        category,
        colorway,
        description,
        image,
        accent,
        priceCents: Number(priceCents),
        compareAtCents: compareAtCents ? Number(compareAtCents) : null,
        weightGrams: Number(weightGrams),
        terrain,
      }).where(eq(products.id, id));

      if (stockMap && typeof stockMap === "object") {
        for (const [euStr, stockQty] of Object.entries(stockMap)) {
          const eu = Number(euStr);
          const stock = Number(stockQty);
          const existing = await db.select().from(productSizes).where(and(eq(productSizes.productId, id), eq(productSizes.eu, eu))).limit(1);

          if (existing.length > 0) {
            await db.update(productSizes).set({ stock }).where(and(eq(productSizes.productId, id), eq(productSizes.eu, eu)));
          } else {
            await db.insert(productSizes).values({ productId: id, eu, stock });
          }
        }
      }

      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await db.delete(products).where(eq(products.id, id));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("/api/admin/products/[id] error", err);
    return res.status(500).json({ error: "Product admin error" });
  }
}
