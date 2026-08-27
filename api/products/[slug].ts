import { db } from "../../src/db/index.js";
import { products, productSizes } from "../../src/db/schema.js";
import { asc, eq, sql } from "drizzle-orm";
import { ensureSeed } from "../../src/db/seed.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await ensureSeed();
    const slug = req.query.slug as string;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Not found" });
    }

    const sizes = await db
      .select()
      .from(productSizes)
      .where(eq(productSizes.productId, product.id))
      .orderBy(asc(productSizes.eu));

    const relatedRaw = await db
      .select()
      .from(products)
      .where(
        sql`id != ${product.id} AND (category = ${product.category} OR brand = ${product.brand})`
      )
      .limit(4);

    const relatedWithSizes = await Promise.all(
      relatedRaw.map(async (r) => {
        const rSizes = await db
          .select()
          .from(productSizes)
          .where(eq(productSizes.productId, r.id))
          .orderBy(asc(productSizes.eu));
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
