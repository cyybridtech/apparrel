import { db } from "../src/db";
import { products, productSizes } from "../src/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureSeed } from "../src/db/seed";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    await ensureSeed();
    const allProducts = await db.select().from(products);
    const allSizes = await db.select().from(productSizes).orderBy(asc(productSizes.eu));

    const byId = new Map<number, any>(allProducts.map((p) => [p.id, { ...p, sizes: [] }]));
    for (const s of allSizes) {
      const p = byId.get(s.productId);
      if (p) p.sizes.push(s);
    }
    return res.status(200).json({ products: [...byId.values()] });
  } catch (err) {
    console.error("GET /api/products failed", err);
    return res.status(500).json({ error: "Could not load products" });
  }
}
