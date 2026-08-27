import { db } from "../../src/db/index.js";
import { products, productSizes } from "../../src/db/schema.js";
import { asc, eq, ne } from "drizzle-orm";
import { ensureSeed } from "../../src/db/seed.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    try {
      await ensureSeed();
    } catch (sErr) {
      console.warn("ensureSeed warning in products/[slug]:", sErr);
    }
    const slug = req.query.slug as string;

    let [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Not found" });
    }

    let sizes: any[] = [];
    try {
      sizes = await db
        .select()
        .from(productSizes)
        .where(eq(productSizes.productId, product.id))
        .orderBy(asc(productSizes.eu));
    } catch {}

    let relatedRaw: any[] = [];
    try {
      relatedRaw = await db
        .select()
        .from(products)
        .where(ne(products.id, product.id))
        .limit(4);
    } catch {}

    const relatedWithSizes = await Promise.all(
      relatedRaw.map(async (r) => {
        let rSizes: any[] = [];
        try {
          rSizes = await db
            .select()
            .from(productSizes)
            .where(eq(productSizes.productId, r.id))
            .orderBy(asc(productSizes.eu));
        } catch {}
        return { ...r, sizes: rSizes };
      })
    );

    return res
      .status(200)
      .json({ product: { ...product, sizes }, related: relatedWithSizes });
  } catch (err: any) {
    console.error("GET /api/products/[slug] failed", err);
    return res.status(500).json({
      error: "Could not load product",
      message: err?.message || String(err),
    });
  }
}
