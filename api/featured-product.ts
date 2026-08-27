import { db } from "../src/db/index.js";
import { products, productSizes } from "../src/db/schema.js";
import { asc, eq, sql } from "drizzle-orm";
import { ensureSeed, CATALOG } from "../src/db/seed.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    try {
      await ensureSeed();
    } catch {}

    let featured: any = null;

    // 1. Try selecting product explicitly set as featured (hero drop)
    try {
      const [f] = await db
        .select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .limit(1);
      featured = f;
    } catch {}

    // 2. Fallback to product with compareAtCents discount
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

    // 3. Fallback to first product in database
    if (!featured) {
      try {
        const [f] = await db.select().from(products).limit(1);
        featured = f;
      } catch {}
    }

    // 4. Fallback to first item from static CATALOG
    if (!featured && CATALOG.length > 0) {
      const p = CATALOG[0];
      featured = {
        id: 1,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        productType: p.productType,
        category: p.category,
        colorway: p.colorway,
        description: p.description,
        image: p.image,
        accent: p.accent,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        rating: p.rating,
        ratingCount: p.ratingCount,
        isNew: p.isNew ?? false,
        isFeatured: true,
        releaseYear: 2026,
        weightGrams: p.weightGrams,
        terrain: p.terrain,
      };
    }

    let sizes: any[] = [];
    if (featured?.id) {
      try {
        sizes = await db
          .select()
          .from(productSizes)
          .where(eq(productSizes.productId, featured.id))
          .orderBy(asc(productSizes.eu));
      } catch {}
    }

    if ((!sizes || sizes.length === 0) && CATALOG.length > 0) {
      sizes = CATALOG[0].sizes.map(([eu, stock, sizeLabel]) => ({
        productId: featured?.id || 1,
        eu,
        stock,
        sizeLabel,
      }));
    }

    return res.status(200).json({ product: { ...featured, sizes } });
  } catch (err: any) {
    console.error("GET /api/featured-product failed", err);
    const p = CATALOG[0];
    return res.status(200).json({
      product: {
        id: 1,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        productType: p.productType,
        category: p.category,
        colorway: p.colorway,
        description: p.description,
        image: p.image,
        accent: p.accent,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        rating: p.rating,
        ratingCount: p.ratingCount,
        isNew: true,
        isFeatured: true,
        releaseYear: 2026,
        weightGrams: p.weightGrams,
        terrain: p.terrain,
        sizes: p.sizes.map(([eu, stock, sizeLabel]) => ({
          productId: 1,
          eu,
          stock,
          sizeLabel,
        })),
      },
    });
  }
}
