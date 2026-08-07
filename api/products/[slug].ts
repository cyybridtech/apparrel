import { db } from "../../src/db";
import { products, productSizes } from "../../src/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureSeed } from "../../src/db/seed";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    await ensureSeed();
    const { slug } = req.query;
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) return res.status(404).json({ error: "Not found" });
    const sizes = await db.select().from(productSizes).where(eq(productSizes.productId, product.id)).orderBy(asc(productSizes.eu));

    // Related products
    const allProducts = await db.select().from(products);
    const related = allProducts
      .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, 4);

    const relatedWithSizes = await Promise.all(
      related.map(async (r) => {
        const rSizes = await db.select().from(productSizes).where(eq(productSizes.productId, r.id)).orderBy(asc(productSizes.eu));
        return { ...r, sizes: rSizes };
      })
    );

    return res.status(200).json({ product: { ...product, sizes }, related: relatedWithSizes });
  } catch (err) {
    console.error("GET /api/products/:slug failed", err);
    return res.status(500).json({ error: "Could not load product" });
  }
}
