import { db } from "../../src/db";
import { products, productSizes } from "../../src/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";

// Clothing sizes: 1=XS, 2=S, 3=M, 4=L, 5=XL, 6=XXL
const clothingSizeMap: Record<number, string> = { 1: "XS", 2: "S", 3: "M", 4: "L", 5: "XL", 6: "XXL" };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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

    const [inserted] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);

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

    return res.status(200).json({ ok: true, slug });
  } catch (err) {
    console.error("POST /api/admin/products failed", err);
    return res.status(500).json({ error: "Failed to create product" });
  }
}
