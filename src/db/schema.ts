import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  double,
  timestamp,
  unique,
} from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  productType: varchar("product_type", { length: 50 }).notNull().default("footwear"), // "footwear" | "tops"
  colorway: varchar("colorway", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  accent: varchar("accent", { length: 50 }).notNull(),
  priceCents: int("price_cents").notNull(),
  compareAtCents: int("compare_at_cents"),
  rating: double("rating").notNull().default(4.5),
  ratingCount: int("rating_count").notNull().default(0),
  isNew: boolean("is_new").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false), // hero rotating showcase
  releaseYear: int("release_year").notNull().default(2026),
  weightGrams: int("weight_grams").notNull().default(280),
  terrain: varchar("terrain", { length: 255 }).notNull().default("Street"),
});

export const productSizes = mysqlTable(
  "product_sizes",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    // For footwear: eu = 36..46, sizeLabel = "EU36" etc.
    // For tops: eu = 1..5 (1=XS,2=S,3=M,4=L,5=XL,6=XXL), sizeLabel = "S","M","L","XL","XXL"
    eu: int("eu").notNull(),
    sizeLabel: varchar("size_label", { length: 20 }).notNull().default(""),
    stock: int("stock").notNull().default(0),
  },
  (t) => [unique("uq_product_size").on(t.productId, t.eu)]
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    eu: int("eu").notNull(),
    qty: int("qty").notNull().default(1),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [unique("uq_cart_product_size").on(t.productId, t.eu)]
);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNo: varchar("order_no", { length: 255 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  zip: varchar("zip", { length: 50 }).notNull(),
  subtotalCents: int("subtotal_cents").notNull(),
  shippingCents: int("shipping_cents").notNull(),
  totalCents: int("total_cents").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: int("product_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }).notNull(),
  colorway: varchar("colorway", { length: 255 }).notNull(),
  image: varchar("image", { length: 2048 }).notNull(),
  eu: int("eu").notNull(),
  sizeLabel: varchar("size_label", { length: 20 }).notNull().default(""),
  qty: int("qty").notNull(),
  unitPriceCents: int("unit_price_cents").notNull(),
});
