import { db } from "../src/db";
import { orders, orderItems, cartItems, products, productSizes } from "../src/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { ensureSeed } from "../src/db/seed";

export default async function handler(req: any, res: any) {
  try {
    await ensureSeed();
    if (req.method === "GET") {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      const allItems = allOrders.length > 0 ? await db.select().from(orderItems).where(inArray(orderItems.orderId, allOrders.map((o) => o.id))) : [];
      const grouped = new Map();
      for (const o of allOrders) grouped.set(o.id, { ...o, items: [] });
      for (const it of allItems) grouped.get(it.orderId)?.items.push(it);
      return res.status(200).json({ orders: [...grouped.values()] });
    }

    if (req.method === "POST") {
      const { name, email, address, city, zip } = req.body;
      const cleanName = name?.trim() ?? "";
      const cleanEmail = email?.trim() ?? "";
      const cleanAddress = address?.trim() ?? "";
      const cleanCity = city?.trim() ?? "";
      const cleanZip = zip?.trim() ?? "";
      if (!cleanName || !cleanEmail || !cleanAddress || !cleanCity || !cleanZip) return res.status(400).json({ error: "All checkout fields are required" });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: "Enter a valid email address" });

      const lines = await db.select({ id: cartItems.id, qty: cartItems.qty, eu: cartItems.eu, stock: productSizes.stock, productId: products.id, name: products.name, brand: products.brand, colorway: products.colorway, image: products.image, unitPriceCents: products.priceCents }).from(cartItems).innerJoin(products, eq(products.id, cartItems.productId)).innerJoin(productSizes, and(eq(productSizes.productId, cartItems.productId), eq(productSizes.eu, cartItems.eu)));
      const valid = lines.filter((l: any) => l.stock > 0).map((l: any) => ({ ...l, qty: Math.min(l.qty, l.stock) }));
      if (valid.length === 0) return res.status(400).json({ error: "Your bag is empty" });

      const subtotalCents = valid.reduce((sum: number, l: any) => sum + l.unitPriceCents * l.qty, 0);
      const FREE_SHIPPING_CENTS = 150000;
      const SHIPPING_CENTS = 2500;
      const shippingCents = subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
      const totalCents = subtotalCents + shippingCents;
      const orderNo = `SH-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, "0")}`;

      await db.insert(orders).values({ orderNo, customerName: cleanName, email: cleanEmail, address: cleanAddress, city: cleanCity, zip: cleanZip, subtotalCents, shippingCents, totalCents, status: "confirmed" });
      const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
      if (!order) throw new Error("Failed to retrieve placed order");

      await db.insert(orderItems).values(valid.map((l: any) => ({ orderId: order.id, productId: l.productId, name: l.name, brand: l.brand, colorway: l.colorway, image: l.image, eu: l.eu, qty: l.qty, unitPriceCents: l.unitPriceCents })));

      for (const l of valid) {
        await db.update(productSizes).set({ stock: sql`GREATEST(CAST(stock AS SIGNED) - ${l.qty}, 0)` }).where(and(eq(productSizes.productId, l.productId), eq(productSizes.eu, l.eu)));
      }

      await db.delete(cartItems);
      return res.status(200).json({ order: { ...order, items: valid } });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("/api/orders error", err);
    return res.status(500).json({ error: "Orders error" });
  }
}
