import { db } from "../../src/db/index.js";
import { orders, products, productSizes } from "../../src/db/schema.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allSizes = await db.select().from(productSizes);

    const totalRevenueCents = allOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const totalOrders = allOrders.length;
    const totalProducts = allProducts.length;
    const lowStockSizes = allSizes.filter((s) => s.stock < 3).length;

    return res.status(200).json({ totalRevenueCents, totalOrders, totalProducts, lowStockSizes });
  } catch (err: any) {
    console.error("GET /api/admin/analytics failed", err);
    return res.status(500).json({ error: "Could not fetch analytics", message: err?.message || String(err) });
  }
}
