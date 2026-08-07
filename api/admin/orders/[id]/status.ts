import { db } from "../../../../src/db";
import { orders } from "../../../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id/status failed", err);
    return res.status(500).json({ error: "Failed to update order status" });
  }
}
