import { db } from "./index.js";
import { products, productSizes } from "./schema.js";
import { count, eq, sql } from "drizzle-orm";

const us = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop&auto=format&q=85`;

const CLOTHING_SIZE_MAP: Record<number, string> = {
  1: "XS",
  2: "S",
  3: "M",
  4: "L",
  5: "XL",
  6: "XXL",
};

function mkSizes(seed: number, from: number, to: number): Array<[number, number, string]> {
  const out: Array<[number, number, string]> = [];
  for (let eu = from; eu <= to; eu++) {
    const raw = (eu * 13 + seed * 31) % 12;
    const label = eu >= 36 ? `EU${eu}` : CLOTHING_SIZE_MAP[eu] ?? `${eu}`;
    out.push([eu, raw >= 10 ? 0 : raw, label]);
  }
  return out;
}

function mkClothingSizes(seed: number): Array<[number, number, string]> {
  return [1, 2, 3, 4, 5, 6].map((n) => {
    const raw = (n * 17 + seed * 23) % 15;
    return [n, raw === 0 ? 0 : raw, CLOTHING_SIZE_MAP[n]];
  });
}

type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  productType: "footwear" | "tops";
  category: string;
  colorway: string;
  description: string;
  image: string;
  accent: string;
  priceCents: number;
  compareAtCents?: number;
  rating: number;
  ratingCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  weightGrams: number;
  terrain: string;
  sizes: Array<[number, number, string]>;
};

const VOLT  = "#D8F34A";
const FLAME = "#FF6A3D";
const LILAC = "#BFAFF5";
const MINT  = "#8FE3B8";
const SKY   = "#8FCBF5";
const SAND  = "#E9C878";
const CYAN  = "#00f0ff";
const SLATE = "#64748b";

export const CATALOG: SeedProduct[] = [
  // ─── FOOTWEAR ───────────────────────────────────────────────────────
  {
    slug: "voltage-runner-2",
    name: "Voltage Runner 2",
    brand: "AXIOM",
    productType: "footwear",
    category: "Road",
    colorway: "Ink / Volt",
    description: "Our fastest daily trainer. A nitrogen-injected midsole returns 87% of your energy while the volt outsole makes sure everyone sees you coming.",
    image: us("1542291026-7eec264c27ff"),
    accent: VOLT,
    priceCents: 149000,
    compareAtCents: 189000,
    rating: 4.8,
    ratingCount: 412,
    isNew: true,
    isFeatured: true,
    weightGrams: 238,
    terrain: "Road",
    sizes: mkSizes(1, 36, 46),
  },
  {
    slug: "marathon-elite",
    name: "Marathon Elite",
    brand: "AXIOM",
    productType: "footwear",
    category: "Road",
    colorway: "Solar Red",
    description: "Carbon-plated race day weapon. Built for sub-3 marathons and personal bests, with a rocker geometry that rolls you forward whether you like it or not.",
    image: us("1606107557195-0e29a4b5b4aa"),
    accent: FLAME,
    priceCents: 189000,
    compareAtCents: 220000,
    rating: 4.9,
    ratingCount: 268,
    weightGrams: 199,
    terrain: "Road",
    sizes: mkSizes(2, 36, 46),
  },
  {
    slug: "court-ghost",
    name: "Court Ghost",
    brand: "KOVA",
    productType: "footwear",
    category: "Court",
    colorway: "Bone / Orange",
    description: "A low-cut court classic with a herringbone grip pattern and a toe box that survives even the ugliest kick serves. Quiet colorway, loud game.",
    image: us("1595950653106-6c9ebd614d3a"),
    accent: LILAC,
    priceCents: 119000,
    rating: 4.6,
    ratingCount: 531,
    weightGrams: 305,
    terrain: "Court",
    sizes: mkSizes(3, 36, 46),
  },
  {
    slug: "rim-rattler",
    name: "Rim Rattler",
    brand: "KOVA",
    productType: "footwear",
    category: "Court",
    colorway: "Navy / Gold",
    description: "High-top performance built for the paint. Lateral containment ankle collar and a pebax plate that springs your first step past any defender.",
    image: us("1608231387042-720250b22ea8"),
    accent: SAND,
    priceCents: 159000,
    rating: 4.7,
    ratingCount: 189,
    isNew: true,
    weightGrams: 345,
    terrain: "Court",
    sizes: mkSizes(4, 37, 46),
  },
  {
    slug: "static-low",
    name: "Static Low",
    brand: "STATIC",
    productType: "footwear",
    category: "Skate",
    colorway: "Black / Gum",
    description: "Stripped-back skate shoe engineered to last. Impact Zone foam in the heel absorbs 3-stair slams; the canvas upper just gets cooler with age.",
    image: us("1600185365926-3a2ce3cdb9eb"),
    accent: MINT,
    priceCents: 89000,
    rating: 4.4,
    ratingCount: 743,
    weightGrams: 310,
    terrain: "Skate",
    sizes: mkSizes(5, 36, 46),
  },
  {
    slug: "grind-mid",
    name: "Grind Mid",
    brand: "STATIC",
    productType: "footwear",
    category: "Skate",
    colorway: "Suede Brown / White",
    description: "Suede-wrapped mid-top for technical skaters who need ankle support without sacrificing board feel. The vulcanised flat sole gives you nothing but the board.",
    image: us("1491553895911-0055eca6402d"),
    accent: SAND,
    priceCents: 99000,
    compareAtCents: 119000,
    rating: 4.5,
    ratingCount: 612,
    weightGrams: 325,
    terrain: "Skate",
    sizes: mkSizes(6, 36, 45),
  },
  {
    slug: "cloud-knit",
    name: "Cloud Knit",
    brand: "PLUME",
    productType: "footwear",
    category: "Lifestyle",
    colorway: "Dove / Lilac",
    description: "One-piece featherweight knit that wraps your foot like a sock and looks better than a sneaker. Worn in and worn out.",
    image: us("1578662996442-48f60103fc96"),
    accent: LILAC,
    priceCents: 109000,
    rating: 4.3,
    ratingCount: 920,
    weightGrams: 195,
    terrain: "Street",
    sizes: mkSizes(7, 36, 46),
  },
  {
    slug: "velvet-runner",
    name: "Velvet Runner",
    brand: "PLUME",
    productType: "footwear",
    category: "Lifestyle",
    colorway: "Dusty Rose / Cream",
    description: "Plume's most polarising shoe: velvet upper, a memory-foam bed and an 80s-runner sole. Goes with dresses, joggers and absolutely nothing.",
    image: us("1516478177764-9fe5bd7e9717"),
    accent: "#F5A8C8",
    priceCents: 129000,
    rating: 4.2,
    ratingCount: 385,
    weightGrams: 222,
    terrain: "Street",
    sizes: mkSizes(8, 36, 46),
  },
  {
    slug: "trail-surge",
    name: "Trail Surge",
    brand: "DRAFT",
    productType: "footwear",
    category: "Trail",
    colorway: "Olive / Sky",
    description: "All-terrain grip outsole with 4mm lugs, a waterproof membrane and enough cushion to handle rocky ridge runs in the Volta Region.",
    image: us("1542838132-92c53300491e"),
    accent: MINT,
    priceCents: 169000,
    rating: 4.6,
    ratingCount: 204,
    weightGrams: 298,
    terrain: "Trail",
    sizes: mkSizes(9, 36, 46),
  },
  {
    slug: "wheat-field-boot",
    name: "Wheat Field Boot",
    brand: "HALCYON",
    productType: "footwear",
    category: "Boots",
    colorway: "Wheat / Honey",
    description: "Full-grain leather combat boot with a lugged commando sole. Wears in over six months of daily use until it fits like a second skin.",
    image: us("1542291026-7eec264c27ff"),
    accent: SAND,
    priceCents: 199000,
    compareAtCents: 249000,
    rating: 4.8,
    ratingCount: 167,
    weightGrams: 620,
    terrain: "Street",
    sizes: mkSizes(10, 38, 46),
  },
  {
    slug: "sandal-drift",
    name: "Drift Sandal",
    brand: "PLUME",
    productType: "footwear",
    category: "Sandals",
    colorway: "Natural / Sand",
    description: "Minimal strap sandal on a 30mm cork-EVA platform. The footbed shapes to your foot after two days of wear.",
    image: us("1603487742131-4160ec999306"),
    accent: SKY,
    priceCents: 79000,
    rating: 4.1,
    ratingCount: 288,
    weightGrams: 180,
    terrain: "Beach",
    sizes: mkSizes(11, 36, 42),
  },
  {
    slug: "foam-slide-pro",
    name: "Foam Slide Pro",
    brand: "AXIOM",
    productType: "footwear",
    category: "Sandals",
    colorway: "Ink / Volt",
    description: "Post-run recovery slide with AXIOM's nitrogen-expanded foam underfoot. You will never wear flip-flops again.",
    image: us("1556906781-9be3cefca6af"),
    accent: VOLT,
    priceCents: 59000,
    rating: 4.4,
    ratingCount: 1203,
    weightGrams: 140,
    terrain: "Recovery",
    sizes: mkSizes(12, 36, 46),
  },
  {
    slug: "turf-striker",
    name: "Turf Striker",
    brand: "AXIOM",
    productType: "footwear",
    category: "Turf",
    colorway: "Black / Electric",
    description: "Multi-stud artificial turf boot for the fast lane. Herringbone bottom for grip on astro and firm ground, lightweight for quick turns.",
    image: us("1579952363873-27f3bade9f55"),
    accent: CYAN,
    priceCents: 129000,
    compareAtCents: 159000,
    rating: 4.5,
    ratingCount: 341,
    weightGrams: 260,
    terrain: "Turf",
    sizes: mkSizes(13, 36, 46),
  },
  {
    slug: "pool-slide",
    name: "Pool Slide",
    brand: "KOVA",
    productType: "footwear",
    category: "Sandals",
    colorway: "Navy / White",
    description: "The poolside essential. Single-band EVA slide with anti-slip ridges and a waterproof logo deboss.",
    image: us("1588099872483-df4f604e5b7b"),
    accent: SKY,
    priceCents: 49000,
    rating: 4.0,
    ratingCount: 550,
    weightGrams: 110,
    terrain: "Water",
    sizes: mkSizes(14, 36, 46),
  },
  {
    slug: "retro-runner",
    name: "Retro Runner",
    brand: "HALCYON",
    productType: "footwear",
    category: "Lifestyle",
    colorway: "Cream / Green",
    description: "1970s distance runner silhouette with a modern EVA stack. The chunky waffle outsole is purely aesthetic — and purely correct.",
    image: us("1560769629-975ec94e6a86"),
    accent: MINT,
    priceCents: 139000,
    compareAtCents: 169000,
    rating: 4.6,
    ratingCount: 478,
    weightGrams: 275,
    terrain: "Street",
    sizes: mkSizes(15, 36, 46),
  },

  // ─── TOPS / APPAREL ─────────────────────────────────────────────────
  {
    slug: "kicks-ghana-club-tee",
    name: "KICKS GHANA Club Tee",
    brand: "KICKS GHANA",
    productType: "tops",
    category: "Club T-Shirts",
    colorway: "Obsidian / Cyan",
    description: "The official KICKS GHANA club tee. 100% Ghanaian cotton with a heavyweight 220gsm fabric, oversized silhouette, and an electric cyan graphic print.",
    image: us("1521572163474-6864f9cf17ab"),
    accent: CYAN,
    priceCents: 8500,
    rating: 4.9,
    ratingCount: 230,
    isNew: true,
    weightGrams: 200,
    terrain: "Lifestyle",
    sizes: mkClothingSizes(1),
  },
  {
    slug: "axiom-tech-tee",
    name: "AXIOM Tech Tee",
    brand: "AXIOM",
    productType: "tops",
    category: "Shirts",
    colorway: "White / Volt",
    description: "Moisture-wicking performance tee. DryFlex fabric + reflective AXIOM logo for early morning runs in Accra.",
    image: us("1562175091-073a551a5665"),
    accent: VOLT,
    priceCents: 7500,
    compareAtCents: 9500,
    rating: 4.7,
    ratingCount: 188,
    isNew: true,
    weightGrams: 160,
    terrain: "Road",
    sizes: mkClothingSizes(2),
  },
  {
    slug: "halcyon-linen-shirt",
    name: "HALCYON Linen Shirt",
    brand: "HALCYON",
    productType: "tops",
    category: "Designer Shirts",
    colorway: "Sand / Ecru",
    description: "Premium 100% Italian linen relaxed-fit shirt. Perfect with our Wheat Field Boot. Minimal stitching, clean collar, handmade buttons.",
    image: us("1594938298870-c12b7ae01671"),
    accent: SAND,
    priceCents: 24500,
    rating: 4.8,
    ratingCount: 95,
    weightGrams: 230,
    terrain: "Lifestyle",
    sizes: mkClothingSizes(3),
  },
  {
    slug: "static-skate-hoodie",
    name: "STATIC Skate Hoodie",
    brand: "STATIC",
    productType: "tops",
    category: "Long Sleeves",
    colorway: "Charcoal / White",
    description: "Heavyweight 350gsm French terry hoodie with a kangaroo pocket, brushed fleece inside, and the STATIC crown logo on the chest.",
    image: us("1556821840-3a63f15732ce"),
    accent: SLATE,
    priceCents: 19500,
    compareAtCents: 24000,
    rating: 4.6,
    ratingCount: 312,
    weightGrams: 500,
    terrain: "Skate",
    sizes: mkClothingSizes(4),
  },
  {
    slug: "kova-game-day-jersey",
    name: "KOVA Game Day Jersey",
    brand: "KOVA",
    productType: "tops",
    category: "Club T-Shirts",
    colorway: "Navy / Gold",
    description: "Basketball mesh jersey with KOVA side-panel branding. Sublimated print, moisture-wicking weave, available in full Ghana Premier League colourways.",
    image: us("1542296332-686e9e30e27e"),
    accent: SAND,
    priceCents: 12500,
    rating: 4.5,
    ratingCount: 410,
    weightGrams: 180,
    terrain: "Court",
    sizes: mkClothingSizes(5),
  },
  {
    slug: "plume-oversized-tee",
    name: "PLUME Oversized Tee",
    brand: "PLUME",
    productType: "tops",
    category: "Designer Shirts",
    colorway: "Lilac / Cream",
    description: "Boxy drop-shoulder tee in a featherweight slub fabric. Minimal PLUME wordmark at the hem. The kind of shirt that looks good with anything.",
    image: us("1503342217505-b0a15ec3261c"),
    accent: LILAC,
    priceCents: 13500,
    rating: 4.4,
    ratingCount: 275,
    isNew: true,
    weightGrams: 175,
    terrain: "Street",
    sizes: mkClothingSizes(6),
  },
  {
    slug: "draft-trail-longsleeve",
    name: "DRAFT Trail Long Sleeve",
    brand: "DRAFT",
    productType: "tops",
    category: "Long Sleeves",
    colorway: "Olive / Stone",
    description: "UPF 50+ sun-protection base layer. 4-way stretch nylon blend, flatlock seams, zippered chest pocket. Designed for Ghana's coastal trail runs.",
    image: us("1542291026-7eec264c27ff"),
    accent: MINT,
    priceCents: 11000,
    compareAtCents: 14000,
    rating: 4.7,
    ratingCount: 142,
    weightGrams: 210,
    terrain: "Trail",
    sizes: mkClothingSizes(7),
  },
  {
    slug: "kicks-ghana-varsity",
    name: "KICKS GHANA Varsity",
    brand: "KICKS GHANA",
    productType: "tops",
    category: "Long Sleeves",
    colorway: "Black / Cyan",
    description: "Premium varsity crewneck sweatshirt with embroidered KICKS GHANA crest on the chest and sleeve. 300gsm fleece-backed cotton.",
    image: us("1503342217505-b0a15ec3261c"),
    accent: CYAN,
    priceCents: 22000,
    rating: 4.9,
    ratingCount: 88,
    isNew: true,
    weightGrams: 450,
    terrain: "Lifestyle",
    sizes: mkClothingSizes(8),
  },
];

let seeding: Promise<void> | null = null;

async function createTablesIfNotExist() {
  const ddlStatements = [
    sql`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`name\` VARCHAR(255) NOT NULL,
        \`brand\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(255) NOT NULL,
        \`product_type\` VARCHAR(50) NOT NULL DEFAULT 'footwear',
        \`colorway\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`image\` TEXT NOT NULL,
        \`accent\` VARCHAR(50) NOT NULL,
        \`price_cents\` INT NOT NULL,
        \`compare_at_cents\` INT,
        \`rating\` DOUBLE NOT NULL DEFAULT 4.5,
        \`rating_count\` INT NOT NULL DEFAULT 0,
        \`is_new\` TINYINT(1) NOT NULL DEFAULT 0,
        \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
        \`release_year\` INT NOT NULL DEFAULT 2026,
        \`weight_grams\` INT NOT NULL DEFAULT 280,
        \`terrain\` VARCHAR(255) NOT NULL DEFAULT 'Street'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    sql`
      CREATE TABLE IF NOT EXISTS \`product_sizes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`product_id\` INT NOT NULL,
        \`eu\` INT NOT NULL,
        \`size_label\` VARCHAR(20) NOT NULL DEFAULT '',
        \`stock\` INT NOT NULL DEFAULT 0,
        UNIQUE KEY \`uq_product_size\` (\`product_id\`, \`eu\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    sql`
      CREATE TABLE IF NOT EXISTS \`cart_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`product_id\` INT NOT NULL,
        \`eu\` INT NOT NULL,
        \`qty\` INT NOT NULL DEFAULT 1,
        \`added_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_cart_product_size\` (\`product_id\`, \`eu\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    sql`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_no\` VARCHAR(255) NOT NULL UNIQUE,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`address\` VARCHAR(255) NOT NULL,
        \`city\` VARCHAR(255) NOT NULL,
        \`zip\` VARCHAR(50) NOT NULL,
        \`subtotal_cents\` INT NOT NULL,
        \`shipping_cents\` INT NOT NULL,
        \`total_cents\` INT NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
    sql`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`product_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`brand\` VARCHAR(255) NOT NULL,
        \`colorway\` VARCHAR(255) NOT NULL,
        \`image\` VARCHAR(2048) NOT NULL,
        \`eu\` INT NOT NULL,
        \`size_label\` VARCHAR(20) NOT NULL DEFAULT '',
        \`qty\` INT NOT NULL,
        \`unit_price_cents\` INT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  ];

  for (const stmt of ddlStatements) {
    try {
      await db.execute(stmt);
    } catch (e) {
      console.warn("Table DDL execution note:", e);
    }
  }

  // Ensure ALL required columns exist on existing database tables unconditionally
  const alters = [
    sql`ALTER TABLE \`products\` ADD COLUMN \`product_type\` VARCHAR(50) NOT NULL DEFAULT 'footwear'`,
    sql`ALTER TABLE \`products\` ADD COLUMN \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0`,
    sql`ALTER TABLE \`products\` ADD COLUMN \`release_year\` INT NOT NULL DEFAULT 2026`,
    sql`ALTER TABLE \`product_sizes\` ADD COLUMN \`size_label\` VARCHAR(20) NOT NULL DEFAULT ''`,
    sql`ALTER TABLE \`order_items\` ADD COLUMN \`size_label\` VARCHAR(20) NOT NULL DEFAULT ''`,
  ];

  for (const alt of alters) {
    try {
      await db.execute(alt);
    } catch {}
  }
}

export function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      await createTablesIfNotExist();

      let needsSeed = false;
      try {
        const prods = await db.select().from(products).limit(1);
        if (prods.length === 0) needsSeed = true;
      } catch (err) {
        console.warn("Full products column select warning, attempting auto-seed:", err);
        needsSeed = true;
      }

      if (!needsSeed) return;

      for (const p of CATALOG) {
        try {
          await db.execute(sql`
            INSERT INTO \`products\` (
              \`slug\`, \`name\`, \`brand\`, \`product_type\`, \`category\`, \`colorway\`,
              \`description\`, \`image\`, \`accent\`, \`price_cents\`, \`compare_at_cents\`,
              \`rating\`, \`rating_count\`, \`is_new\`, \`is_featured\`, \`release_year\`,
              \`weight_grams\`, \`terrain\`
            ) VALUES (
              ${p.slug}, ${p.name}, ${p.brand}, ${p.productType}, ${p.category}, ${p.colorway},
              ${p.description}, ${p.image}, ${p.accent}, ${p.priceCents}, ${p.compareAtCents ?? null},
              ${p.rating}, ${p.ratingCount}, ${p.isNew ? 1 : 0}, ${p.isFeatured ? 1 : 0}, 2026,
              ${p.weightGrams}, ${p.terrain}
            )
            ON DUPLICATE KEY UPDATE
              \`name\` = VALUES(\`name\`),
              \`price_cents\` = VALUES(\`price_cents\`),
              \`is_featured\` = VALUES(\`is_featured\`)
          `);
        } catch (insertErr: any) {
          console.warn(`Product insert warning for ${p.slug}:`, insertErr?.message || insertErr);
        }

        try {
          const [insertedProd] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.slug, p.slug))
            .limit(1);

          if (insertedProd) {
            for (const [eu, stock, sizeLabel] of p.sizes) {
              try {
                await db.execute(sql`
                  INSERT INTO \`product_sizes\` (\`product_id\`, \`eu\`, \`size_label\`, \`stock\`)
                  VALUES (${insertedProd.id}, ${eu}, ${sizeLabel}, ${stock})
                  ON DUPLICATE KEY UPDATE \`stock\` = VALUES(\`stock\`), \`size_label\` = VALUES(\`size_label\`)
                `);
              } catch {}
            }
          }
        } catch {}
      }
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}
