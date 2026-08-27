export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db, isDbConfigured } = await import("../src/db");
    const { products, productSizes } = await import("../src/db/schema");
    const { asc } = await import("drizzle-orm");
    const { ensureSeed } = await import("../src/db/seed");

    if (!isDbConfigured) {
      return res.status(500).json({
        error: "DATABASE_URL environment variable is missing on Vercel.",
      });
    }

    await ensureSeed();
    const allProducts = await db.select().from(products);
    const allSizes = await db.select().from(productSizes).orderBy(asc(productSizes.eu));

    const byId = new Map<number, any>(allProducts.map((p) => [p.id, { ...p, sizes: [] }]));
    for (const s of allSizes) {
      const p = byId.get(s.productId);
      if (p) p.sizes.push(s);
    }
    return res.status(200).json({ products: [...byId.values()] });
  } catch (err: any) {
    console.error("GET /api/products failed", err);
    return res.status(500).json({
      error: "Could not load products",
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}
