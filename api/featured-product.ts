import { db } from "../src/db/index.js";
import { products, productSizes } from "../src/db/schema.js";
import { asc, eq, sql } from "drizzle-orm";
import { ensureSeed } from "../src/db/seed.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    try {
      await ensureSeed();
    } catch (sErr) {
      console.warn("ensureSeed warning in featured-product:", sErr);
    }

    let featured: any = null;
    try {
      const [f] = await db
        .select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .limit(1);
      featured = f;
    } catch {}

    if (!featured) {
      try {
        const [f] = await db
          .select()
          .from(products)
          .where(sql`compare_at_cents > price_cents`)
          .limit(1);
        featured = f;
      } catch {}
    }

    if (!featured) {
      try {
        const [f] = await db.select().from(products).limit(1);
        featured = f;
      } catch {}
    }

    if (!featured) {
      return res.status(200).json({ product: null });
    }

    let sizes: any[] = [];
    try {
      sizes = await db
        .select()
        .from(productSizes)
        .where(eq(productSizes.productId, featured.id))
        .orderBy(asc(productSizes.eu));
    } catch {}

    return res.status(200).json({ product: { ...featured, sizes } });
  } catch (err: any) {
    console.error("GET /api/featured-product failed", err);
    return res.status(500).json({
      error: "Could not load featured product",
      message: err?.message || String(err),
    });
  }
}
