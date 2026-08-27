export default async function handler(req: any, res: any) {
  try {
    const { db, isDbConfigured } = await import("../src/db/index.js");
    const { cartItems, products, productSizes } = await import("../src/db/schema.js");
    const { and, desc, eq } = await import("drizzle-orm");
    const { ensureSeed } = await import("../src/db/seed.js");

    if (!isDbConfigured) {
      return res.status(500).json({
        error: "DATABASE_URL environment variable is missing on Vercel.",
      });
    }

    await ensureSeed();

    async function fetchCart() {
      const rows = await db
        .select({ id: cartItems.id, qty: cartItems.qty, eu: cartItems.eu, addedAt: cartItems.addedAt, stock: productSizes.stock, product: products })
        .from(cartItems)
        .innerJoin(products, eq(products.id, cartItems.productId))
        .innerJoin(productSizes, and(eq(productSizes.productId, cartItems.productId), eq(productSizes.eu, cartItems.eu)))
        .orderBy(desc(cartItems.addedAt), desc(cartItems.id));

      return rows.map((r: any) => ({ id: r.id, qty: r.qty, eu: r.eu, stock: r.stock, addedAt: r.addedAt ? r.addedAt.toISOString() : new Date().toISOString(), product: r.product }));
    }

    if (req.method === "GET") {
      const items = await fetchCart();
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const { productId, eu } = req.body;
      const qty = Math.max(1, Math.floor(req.body.qty ?? 1));
      if (!productId || !eu) return res.status(400).json({ error: "productId and eu are required" });

      const [size] = await db.select().from(productSizes).where(and(eq(productSizes.productId, productId), eq(productSizes.eu, eu))).limit(1);
      if (!size) return res.status(400).json({ error: "Unknown size" });
      if (size.stock <= 0) return res.status(409).json({ error: `Sold out in EU ${eu}` });

      const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.productId, productId), eq(cartItems.eu, eu))).limit(1);
      const newQty = Math.min(size.stock, (existing?.qty ?? 0) + qty);
      if (existing) {
        await db.update(cartItems).set({ qty: newQty }).where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({ productId, eu, qty: newQty });
      }
      const items = await fetchCart();
      return res.status(200).json({ items });
    }

    if (req.method === "PATCH") {
      const { id, qty } = req.body;
      if (!id || qty === undefined) return res.status(400).json({ error: "id and qty are required" });
      const [line] = await db.select({ id: cartItems.id, stock: productSizes.stock }).from(cartItems).innerJoin(productSizes, and(eq(productSizes.productId, cartItems.productId), eq(productSizes.eu, cartItems.eu))).where(eq(cartItems.id, id)).limit(1);
      if (!line) return res.status(404).json({ error: "Line not found" });
      const targetQty = Math.floor(qty);
      if (targetQty <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, id));
      } else {
        await db.update(cartItems).set({ qty: Math.min(line.stock, targetQty) }).where(eq(cartItems.id, id));
      }
      const items = await fetchCart();
      return res.status(200).json({ items });
    }

    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!id) return res.status(400).json({ error: "id is required" });
      await db.delete(cartItems).where(eq(cartItems.id, id));
      const items = await fetchCart();
      return res.status(200).json({ items });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("/api/cart error", err);
    return res.status(500).json({
      error: "Cart error",
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}
