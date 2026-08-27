export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db, isDbConfigured } = await import("../src/db/index.js");
    const { products, productSizes } = await import("../src/db/schema.js");
    const { asc } = await import("drizzle-orm");
    const { ensureSeed, CATALOG } = await import("../src/db/seed.js");

    if (!isDbConfigured) {
      return res.status(500).json({
        error: "DATABASE_URL environment variable is missing on Vercel.",
      });
    }

    try {
      await ensureSeed();
    } catch (seedErr) {
      console.warn("ensureSeed warning:", seedErr);
    }

    let allProducts: any[] = [];
    try {
      allProducts = await db.select().from(products);
    } catch (colErr) {
      console.warn("Full select failed, attempting fallback column select:", colErr);
      try {
        const rows = await db.select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          brand: products.brand,
          category: products.category,
          colorway: products.colorway,
          description: products.description,
          image: products.image,
          accent: products.accent,
          priceCents: products.priceCents,
          compareAtCents: products.compareAtCents,
          rating: products.rating,
          ratingCount: products.ratingCount,
          isNew: products.isNew,
          weightGrams: products.weightGrams,
          terrain: products.terrain,
        }).from(products);

        const clothingCategories = new Set(["Club T-Shirts", "Shirts", "Long Sleeves", "Designer Shirts"]);
        allProducts = rows.map((r) => ({
          ...r,
          productType: clothingCategories.has(r.category) ? "tops" : "footwear",
          isFeatured: false,
          releaseYear: 2026,
        }));
      } catch (colErr2) {
        console.warn("Fallback column query failed, using static CATALOG:", colErr2);
        allProducts = [];
      }
    }

    if (!allProducts || allProducts.length === 0) {
      allProducts = CATALOG.map((p, idx) => ({
        id: idx + 1,
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
        isFeatured: p.isFeatured ?? false,
        releaseYear: 2026,
        weightGrams: p.weightGrams,
        terrain: p.terrain,
        sizes: p.sizes.map(([eu, stock, sizeLabel]) => ({
          productId: idx + 1,
          eu,
          stock,
          sizeLabel,
        })),
      }));
      return res.status(200).json({ products: allProducts });
    }

    let allSizes: any[] = [];
    try {
      allSizes = await db.select().from(productSizes).orderBy(asc(productSizes.eu));
    } catch (sizeErr) {
      console.warn("productSizes query warning:", sizeErr);
    }

    const byId = new Map<number, any>(allProducts.map((p) => [p.id, { ...p, sizes: [] }]));
    for (const s of allSizes) {
      const p = byId.get(s.productId);
      if (p) p.sizes.push(s);
    }
    return res.status(200).json({ products: [...byId.values()] });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return res.status(500).json({
      error: "Could not load products",
      message: err?.message || String(err),
    });
  }
}
