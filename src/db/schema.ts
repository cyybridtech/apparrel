import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  double,
  timestamp,
} from "drizzle-orm/mysql-core";

// Sellers table (The 5 Initial Cyybrid Team Members & Future External Vendors)
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  memberNumber: int("member_number").notNull().default(1),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull().default("+233 24 000 0000"),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeSlug: varchar("store_slug", { length: 100 }).notNull().unique(),
  categorySpecialty: varchar("category_specialty", { length: 100 }).notNull(),
  memberRole: varchar("member_role", { length: 255 }).notNull(),
  paystackSubaccount: varchar("paystack_subaccount", { length: 100 }).notNull(),
  commissionRate: double("commission_rate").notNull().default(0.05), // 5% platform share
  payoutBank: varchar("payout_bank", { length: 100 }).notNull().default("MTN Mobile Money"),
  payoutAccount: varchar("payout_account", { length: 100 }).notNull().default("0244000000"),
  balanceCents: int("balance_cents").notNull().default(0), // Available earnings
  totalPaidCents: int("total_paid_cents").notNull().default(0), // Total historical payouts
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'suspended' | 'pending'
  passcode: varchar("passcode", { length: 100 }).notNull().default("seller123"),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull().default("Sparkles"),
  itemCount: int("item_count").notNull().default(0),
  bannerImage: text("banner_image"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("seller_id").notNull().default(1),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'tops' | 'sneakers' | 'perfumes' | 'watches' | 'tech' | 'bags'
  subCategory: varchar("sub_category", { length: 100 }).notNull().default("General"),
  description: text("description").notNull(),
  featuresJson: text("features_json").notNull().default("[]"), // JSON string of bullet points / specs
  priceCents: int("price_cents").notNull(),
  compareAtCents: int("compare_at_cents"),
  imagesJson: text("images_json").notNull().default("[]"), // JSON array of image URLs
  primaryImage: text("primary_image").notNull(),
  secondaryImage: text("secondary_image"),
  colorway: varchar("colorway", { length: 150 }).notNull().default("Standard"),
  rating: double("rating").notNull().default(4.8),
  ratingCount: int("rating_count").notNull().default(12),
  isNew: boolean("is_new").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  badge: varchar("badge", { length: 50 }), // 'BESTSELLER' | 'NEW DROP' | 'LIMITED' | '20% OFF'
  gender: varchar("gender", { length: 50 }).notNull().default("Unisex"),
  sku: varchar("sku", { length: 100 }).notNull(),
  totalStock: int("total_stock").notNull().default(50),
  approvalStatus: varchar("approval_status", { length: 50 }).notNull().default("approved"), // 'approved' | 'pending_review' | 'draft' | 'rejected'
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product Sizes / Variants table
export const productSizes = mysqlTable("product_sizes", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sizeLabel: varchar("size_label", { length: 50 }).notNull(), // 'S', 'M', 'L', 'XL', 'EU 42', '50ml', '100ml', 'One Size'
  color: varchar("color", { length: 100 }),
  stock: int("stock").notNull().default(10),
  lowStockThreshold: int("low_stock_threshold").notNull().default(3),
});

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNo: varchar("order_no", { length: 100 }).notNull().unique(), // e.g. ORD-9824
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull().default("Accra"),
  postalCode: varchar("postal_code", { length: 50 }),
  subtotalCents: int("subtotal_cents").notNull(),
  shippingCents: int("shipping_cents").notNull().default(0),
  discountCents: int("discount_cents").notNull().default(0),
  totalCents: int("total_cents").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("GHS"),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"), // 'confirmed' | 'processing' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("paid"), // 'unpaid' | 'paid' | 'refunded'
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("paystack"),
  paystackRef: varchar("paystack_ref", { length: 255 }),
  trackingCode: varchar("tracking_code", { length: 100 }).notNull().unique(), // e.g. TRK-481920
  courierName: varchar("courier_name", { length: 100 }).notNull().default("Cyybrid Express Dispatch"),
  courierPhone: varchar("courier_phone", { length: 50 }).notNull().default("+233 24 555 8901"),
  courierLat: double("courier_lat").default(5.6037),
  courierLng: double("courier_lng").default(-0.1870),
  destinationLat: double("destination_lat").default(5.6148),
  destinationLng: double("destination_lng").default(-0.1731),
  estimatedDelivery: varchar("estimated_delivery", { length: 100 }).notNull().default("Within 45 - 90 mins"),
  deliveryNotes: text("delivery_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Items table with Seller Attribution & Revenue Split
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: int("product_id").notNull(),
  sellerId: int("seller_id").notNull().default(1),
  sellerStore: varchar("seller_store", { length: 255 }).notNull().default("Cyybrid Official"),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  sizeLabel: varchar("size_label", { length: 50 }).notNull(),
  image: text("image").notNull(),
  qty: int("qty").notNull(),
  unitPriceCents: int("unit_price_cents").notNull(),
  sellerShareCents: int("seller_share_cents").notNull().default(0), // 95% net to vendor
  platformShareCents: int("platform_share_cents").notNull().default(0), // 5% platform commission
});

// Seller Payout Distribution Records
export const sellerPayouts = mysqlTable("seller_payouts", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("seller_id").notNull(),
  sellerName: varchar("seller_name", { length: 255 }).notNull(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  amountCents: int("amount_cents").notNull(),
  reference: varchar("100", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("completed"), // 'pending' | 'completed' | 'failed'
  payoutMethod: varchar("payout_method", { length: 100 }).notNull().default("Paystack Split Subaccount"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit & Governance Logs (For Team Transparency & Security)
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actor: varchar("actor", { length: 255 }).notNull(),
  actorRole: varchar("actor_role", { length: 50 }).notNull().default("seller"), // 'super_admin' | 'seller' | 'system'
  action: varchar("action", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  details: text("details").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }).default("127.0.0.1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Inventory Restock Logs
export const inventoryLogs = mysqlTable("inventory_logs", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull(),
  sellerId: int("seller_id").notNull().default(1),
  productName: varchar("product_name", { length: 255 }).notNull(),
  sizeLabel: varchar("size_label", { length: 50 }).notNull(),
  changeQty: int("change_qty").notNull(),
  previousStock: int("previous_stock").notNull(),
  newStock: int("new_stock").notNull(),
  reason: varchar("reason", { length: 255 }).notNull().default("Seller Restock"),
  adminUser: varchar("admin_user", { length: 100 }).notNull().default("Seller Admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
