import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  try {
    await db.execute(sql`select 1`);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Health check failed", err);
    return res.status(500).json({ ok: false, message: err?.message || String(err) });
  }
}
