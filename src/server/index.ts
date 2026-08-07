import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { products, productSizes, cartItems, orders, orderItems } from "../db/schema";
import { ensureSeed } from "../db/seed";
import type { CartLine, OrderWithItems, ProductWithSizes } from "../lib/types";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const FREE_SHIPPING_CENTS = 150000; // GHS 1,500
const SHIPPING_CENTS = 2500;        // GHS 25

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Health check failed", err);
    res.status(500).json({ ok: false });
  }
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    await ensureSeed();
    const allProducts = await db.select().from(products);
    const allSizes = await db.select().from(productSizes).orderBy(asc(productSizes.eu));
    
    const byId = new Map<number, ProductWithSizes>(
      allProducts.map((p) => [p.id, { ...p, sizes: [] }])
    );
    for (const s of allSizes) {
      const p = byId.get(s.productId);
      if (p) p.sizes.push(s);
    }
    res.json({ products: [...byId.values()] });
  } catch (err) {
    console.error("GET /api/products failed", err);
    res.status(500).json({ error: "Could not load products" });
  }
});

// GET featured (hero showcase) product
app.get("/api/featured-product", async (req, res) => {
  try {
    await ensureSeed();
    const [featured] = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(1);
    if (!featured) {
      // Fallback: first product with a discount
      const [disc] = await db
        .select()
        .from(products)
        .where(sql`compare_at_cents > price_cents`)
        .limit(1);
      return res.json({ product: disc ?? null });
    }
    const sizes = await db
      .select()
      .from(productSizes)
      .where(eq(productSizes.productId, featured.id))
      .orderBy(asc(productSizes.eu));
    res.json({ product: { ...featured, sizes } });
  } catch (err) {
    console.error("GET /api/featured-product failed", err);
    res.status(500).json({ error: "Could not load featured product" });
  }
});

// GET single product by slug
app.get("/api/products/:slug", async (req, res) => {
  try {
    await ensureSeed();
    const { slug } = req.params;
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

    // Related products: same category or brand, excluding self
    const allProducts = await db.select().from(products);
    const related = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category || p.brand === product.brand)
      )
      .slice(0, 4);

    const relatedWithSizes = await Promise.all(
      related.map(async (r) => {
        const rSizes = await db
          .select()
          .from(productSizes)
          .where(eq(productSizes.productId, r.id))
          .orderBy(asc(productSizes.eu));
        return { ...r, sizes: rSizes };
      })
    );

    res.json({
      product: { ...product, sizes },
      related: relatedWithSizes,
    });
  } catch (err) {
    console.error("GET /api/products/:slug failed", err);
    res.status(500).json({ error: "Could not load product" });
  }
});

// Helper to fetch cart lines
async function fetchCart(): Promise<CartLine[]> {
  const rows = await db
    .select({
      id: cartItems.id,
      qty: cartItems.qty,
      eu: cartItems.eu,
      addedAt: cartItems.addedAt,
      stock: productSizes.stock,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .innerJoin(
      productSizes,
      and(
        eq(productSizes.productId, cartItems.productId),
        eq(productSizes.eu, cartItems.eu)
      )
    )
    .orderBy(desc(cartItems.addedAt), desc(cartItems.id));

  return rows.map((r) => ({
    id: r.id,
    qty: r.qty,
    eu: r.eu,
    stock: r.stock,
    addedAt: r.addedAt ? r.addedAt.toISOString() : new Date().toISOString(),
    product: r.product,
  }));
}

// GET cart items
app.get("/api/cart", async (req, res) => {
  try {
    await ensureSeed();
    const items = await fetchCart();
    res.json({ items });
  } catch (err) {
    console.error("GET /api/cart failed", err);
    res.status(500).json({ error: "Could not load cart" });
  }
});

// POST add to cart
app.post("/api/cart", async (req, res) => {
  try {
    await ensureSeed();
    const { productId, eu } = req.body;
    const qty = Math.max(1, Math.floor(req.body.qty ?? 1));

    if (!productId || !eu) {
      return res.status(400).json({ error: "productId and eu are required" });
    }

    const [size] = await db
      .select()
      .from(productSizes)
      .where(and(eq(productSizes.productId, productId), eq(productSizes.eu, eu)))
      .limit(1);

    if (!size) {
      return res.status(400).json({ error: "Unknown size" });
    }
    if (size.stock <= 0) {
      return res.status(409).json({ error: `Sold out in EU ${eu}` });
    }

    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.productId, productId), eq(cartItems.eu, eu)))
      .limit(1);

    const newQty = Math.min(size.stock, (existing?.qty ?? 0) + qty);

    if (existing) {
      await db
        .update(cartItems)
        .set({ qty: newQty })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db
        .insert(cartItems)
        .values({ productId, eu, qty: newQty });
    }

    const items = await fetchCart();
    res.json({ items });
  } catch (err) {
    console.error("POST /api/cart failed", err);
    res.status(500).json({ error: "Could not add to cart" });
  }
});

// PATCH update cart item quantity
app.patch("/api/cart", async (req, res) => {
  try {
    await ensureSeed();
    const { id, qty } = req.body;

    if (!id || qty === undefined) {
      return res.status(400).json({ error: "id and qty are required" });
    }

    const [line] = await db
      .select({ id: cartItems.id, stock: productSizes.stock })
      .from(cartItems)
      .innerJoin(
        productSizes,
        and(
          eq(productSizes.productId, cartItems.productId),
          eq(productSizes.eu, cartItems.eu)
        )
      )
      .where(eq(cartItems.id, id))
      .limit(1);

    if (!line) {
      return res.status(404).json({ error: "Line not found" });
    }

    const targetQty = Math.floor(qty);
    if (targetQty <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, id));
    } else {
      await db
        .update(cartItems)
        .set({ qty: Math.min(line.stock, targetQty) })
        .where(eq(cartItems.id, id));
    }

    const items = await fetchCart();
    res.json({ items });
  } catch (err) {
    console.error("PATCH /api/cart failed", err);
    res.status(500).json({ error: "Could not update cart" });
  }
});

// DELETE cart item
app.delete("/api/cart", async (req, res) => {
  try {
    await ensureSeed();
    const id = Number(req.query.id);
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    await db.delete(cartItems).where(eq(cartItems.id, id));
    const items = await fetchCart();
    res.json({ items });
  } catch (err) {
    console.error("DELETE /api/cart failed", err);
    res.status(500).json({ error: "Could not remove line" });
  }
});

// GET all orders
app.get("/api/orders", async (req, res) => {
  try {
    await ensureSeed();
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allItems =
      allOrders.length > 0
          ? await db
              .select()
              .from(orderItems)
              .where(inArray(orderItems.orderId, allOrders.map((o) => o.id)))
          : [];

    const grouped = new Map<number, OrderWithItems>(
      allOrders.map((o) => [o.id, { ...o, items: [] }])
    );
    for (const item of allItems) {
      grouped.get(item.orderId)?.items.push(item);
    }
    res.json({ orders: [...grouped.values()] });
  } catch (err) {
    console.error("GET /api/orders failed", err);
    res.status(500).json({ error: "Could not load orders" });
  }
});

// POST checkout place order
app.post("/api/orders", async (req, res) => {
  try {
    await ensureSeed();
    const { name, email, address, city, zip } = req.body;
    
    const cleanName = name?.trim() ?? "";
    const cleanEmail = email?.trim() ?? "";
    const cleanAddress = address?.trim() ?? "";
    const cleanCity = city?.trim() ?? "";
    const cleanZip = zip?.trim() ?? "";

    if (!cleanName || !cleanEmail || !cleanAddress || !cleanCity || !cleanZip) {
      return res.status(400).json({ error: "All checkout fields are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }

    const lines = await db
      .select({
        id: cartItems.id,
        qty: cartItems.qty,
        eu: cartItems.eu,
        stock: productSizes.stock,
        productId: products.id,
        name: products.name,
        brand: products.brand,
        colorway: products.colorway,
        image: products.image,
        unitPriceCents: products.priceCents,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .innerJoin(
        productSizes,
        and(
          eq(productSizes.productId, cartItems.productId),
          eq(productSizes.eu, cartItems.eu)
        )
      );

    const valid = lines
      .filter((l) => l.stock > 0)
      .map((l) => ({ ...l, qty: Math.min(l.qty, l.stock) }));

    if (valid.length === 0) {
      return res.status(400).json({ error: "Your bag is empty" });
    }

    const subtotalCents = valid.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0);
    const shippingCents = subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
    const totalCents = subtotalCents + shippingCents;
    const orderNo = `SH-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 36 ** 2
    )
      .toString(36)
      .toUpperCase()
      .padStart(2, "0")}`;

    await db
      .insert(orders)
      .values({
        orderNo,
        customerName: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        city: cleanCity,
        zip: cleanZip,
        subtotalCents,
        shippingCents,
        totalCents,
        status: "confirmed",
      });

    // Query back the order by its unique order number
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNo, orderNo))
      .limit(1);

    if (!order) {
      throw new Error("Failed to retrieve placed order");
    }

    await db.insert(orderItems).values(
      valid.map((l) => ({
        orderId: order.id,
        productId: l.productId,
        name: l.name,
        brand: l.brand,
        colorway: l.colorway,
        image: l.image,
        eu: l.eu,
        qty: l.qty,
        unitPriceCents: l.unitPriceCents,
      }))
    );

    // Update stock for sizes
    for (const l of valid) {
      // MySQL GREATEST syntax: GREATEST(stock - qty, 0)
      await db
        .update(productSizes)
        .set({ stock: sql`GREATEST(CAST(stock AS SIGNED) - ${l.qty}, 0)` })
        .where(
          and(
            eq(productSizes.productId, l.productId),
            eq(productSizes.eu, l.eu)
          )
        );
    }

    // Clear cart
    await db.delete(cartItems);

    res.json({ order: { ...order, items: valid } });
  } catch (err) {
    console.error("POST /api/orders failed", err);
    res.status(500).json({ error: "Could not place order" });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin: Analytics Summary
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allSizes = await db.select().from(productSizes);

    const totalRevenueCents = allOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const totalOrders = allOrders.length;
    const totalProducts = allProducts.length;
    const lowStockSizes = allSizes.filter((s) => s.stock < 3).length;

    res.json({
      totalRevenueCents,
      totalOrders,
      totalProducts,
      lowStockSizes,
    });
  } catch (err) {
    console.error("GET /api/admin/analytics failed", err);
    res.status(500).json({ error: "Could not fetch analytics" });
  }
});

// Admin: Create Product
app.post("/api/admin/products", async (req, res) => {
  try {
    const {
      name,
      brand,
      productType = "footwear",
      category,
      colorway,
      description,
      image,
      accent = "#00f0ff",
      priceCents,
      compareAtCents,
      weightGrams = 280,
      terrain = "Street",
      stockMap = {},
    } = req.body;

    if (!name || !brand || !category || !priceCents || !image) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const isTops = productType === "tops";

    // Size label maps
    const clothingSizeMap: Record<number, string> = { 1:"XS",2:"S",3:"M",4:"L",5:"XL",6:"XXL" };

    await db.insert(products).values({
      slug,
      name,
      brand,
      productType,
      category,
      colorway: colorway || brand,
      description: description || `${brand} ${name}`,
      image,
      accent,
      priceCents: Number(priceCents),
      compareAtCents: compareAtCents ? Number(compareAtCents) : null,
      rating: 4.8,
      ratingCount: 1,
      isNew: true,
      weightGrams: Number(weightGrams),
      terrain,
    });

    const [inserted] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (inserted) {
      const sizesToInsert: { productId: number; eu: number; sizeLabel: string; stock: number }[] = [];
      if (isTops) {
        for (let n = 1; n <= 6; n++) {
          const stock = stockMap[n] !== undefined ? Number(stockMap[n]) : 5;
          sizesToInsert.push({ productId: inserted.id, eu: n, sizeLabel: clothingSizeMap[n], stock });
        }
      } else {
        for (let eu = 36; eu <= 46; eu++) {
          const stock = stockMap[eu] !== undefined ? Number(stockMap[eu]) : 5;
          sizesToInsert.push({ productId: inserted.id, eu, sizeLabel: `EU${eu}`, stock });
        }
      }
      await db.insert(productSizes).values(sizesToInsert);
    }

    res.json({ ok: true, slug });
  } catch (err) {
    console.error("POST /api/admin/products failed", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Admin: Update Product
app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
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

    await db
      .update(products)
      .set({
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
      })
      .where(eq(products.id, productId));

    if (stockMap && typeof stockMap === "object") {
      for (const [euStr, stockQty] of Object.entries(stockMap)) {
        const eu = Number(euStr);
        const stock = Number(stockQty);
        const existing = await db
          .select()
          .from(productSizes)
          .where(and(eq(productSizes.productId, productId), eq(productSizes.eu, eu)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(productSizes)
            .set({ stock })
            .where(and(eq(productSizes.productId, productId), eq(productSizes.eu, eu)));
        } else {
          await db.insert(productSizes).values({ productId, eu, stock });
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/admin/products/:id failed", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Admin: Delete Product
app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    await db.delete(products).where(eq(products.id, productId));
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/products/:id failed", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Admin: Update Order Status
app.patch("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId));
    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id/status failed", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Admin: Toggle Featured Hero Product
app.patch("/api/admin/products/:id/featured", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { featured } = req.body;
    // Unset any existing featured first
    if (featured) {
      await db.update(products).set({ isFeatured: false }).where(sql`1=1`);
    }
    await db
      .update(products)
      .set({ isFeatured: Boolean(featured) })
      .where(eq(products.id, productId));
    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/products/:id/featured failed", err);
    res.status(500).json({ error: "Failed to update featured product" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

