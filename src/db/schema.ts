import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  double,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
  primaryKey,
  foreignKey,
} from "drizzle-orm/mysql-core";

// Unified Users Table (Customers, Sellers, and Platform Admins)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("customer"), // Legacy only; tenant authorization uses memberships and grants.
  sellerId: int("seller_id"), // Linked seller ID if role is 'seller'
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }).default("Greater Accra"),
  postalCode: varchar("postal_code", { length: 50 }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// SaaS tenant boundary: each customer account is an organization; locations
// and all tenant-owned commerce data are scoped to that organization.
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  organizationType: mysqlEnum("organization_type", ["retailer", "supermarket", "mall", "other"]).notNull(),
  status: mysqlEnum("status", ["provisioning", "trialing", "active", "past_due", "suspended", "closed"])
    .notNull()
    .default("provisioning"),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("GH"),
  defaultCurrency: varchar("default_currency", { length: 3 }).notNull().default("GHS"),
  timeZone: varchar("time_zone", { length: 64 }).notNull().default("Africa/Accra"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Platform staff access is deliberately separate from tenant memberships.
export const platformMemberships = mysqlTable("platform_memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  platformRole: mysqlEnum("platform_role", ["platform_owner", "platform_admin", "support_agent", "billing_admin", "read_only"])
    .notNull(),
  status: mysqlEnum("status", ["active", "suspended", "revoked"]).notNull().default("active"),
  mfaRequired: boolean("mfa_required").notNull().default(true),
  grantedByUserId: int("granted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("platform_memberships_user_uq").on(table.userId),
  index("platform_memberships_role_status_idx").on(table.platformRole, table.status),
]);

// Permission keys are global and code-reviewed; tenant roles only grant from
// this catalog, preventing arbitrary privilege names from being introduced.
export const permissionCatalog = mysqlTable("permission_catalog", {
  permissionKey: varchar("permission_key", { length: 120 }).primaryKey(),
  resource: varchar("resource", { length: 60 }).notNull(),
  action: varchar("action", { length: 60 }).notNull(),
  description: text("description").notNull(),
  highRisk: boolean("high_risk").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizationRoles = mysqlTable("organization_roles", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  roleKey: varchar("role_key", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  systemRole: boolean("system_role").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("organization_roles_org_key_uq").on(table.organizationId, table.roleKey),
  uniqueIndex("organization_roles_org_id_uq").on(table.organizationId, table.id),
  index("organization_roles_org_active_idx").on(table.organizationId, table.active),
]);

export const organizationMemberships = mysqlTable("organization_memberships", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  status: mysqlEnum("status", ["active", "suspended", "left"]).notNull().default("active"),
  branchAccessMode: mysqlEnum("branch_access_mode", ["all_branches", "assigned_branches"])
    .notNull()
    .default("assigned_branches"),
  invitedByUserId: int("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("organization_memberships_org_user_uq").on(table.organizationId, table.userId),
  uniqueIndex("organization_memberships_org_id_uq").on(table.organizationId, table.id),
  index("organization_memberships_user_status_idx").on(table.userId, table.status),
  index("organization_memberships_org_status_idx").on(table.organizationId, table.status),
]);

export const organizationRolePermissions = mysqlTable("organization_role_permissions", {
  organizationId: int("organization_id").notNull(),
  roleId: int("role_id").notNull(),
  permissionKey: varchar("permission_key", { length: 120 }).notNull()
    .references(() => permissionCatalog.permissionKey, { onDelete: "restrict" }),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.roleId, table.permissionKey] }),
  foreignKey({
    name: "organization_role_permissions_same_tenant_fk",
    columns: [table.organizationId, table.roleId],
    foreignColumns: [organizationRoles.organizationId, organizationRoles.id],
  }).onDelete("restrict"),
  index("organization_role_permissions_permission_idx").on(table.permissionKey),
]);

// A user can hold multiple roles in the same organization. Composite foreign
// keys make cross-tenant role grants invalid at the database level.
export const membershipRoleGrants = mysqlTable("membership_role_grants", {
  organizationId: int("organization_id").notNull(),
  membershipId: int("membership_id").notNull(),
  roleId: int("role_id").notNull(),
  grantedByUserId: int("granted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.membershipId, table.roleId] }),
  foreignKey({
    name: "membership_role_grants_same_membership_tenant_fk",
    columns: [table.organizationId, table.membershipId],
    foreignColumns: [organizationMemberships.organizationId, organizationMemberships.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "membership_role_grants_same_role_tenant_fk",
    columns: [table.organizationId, table.roleId],
    foreignColumns: [organizationRoles.organizationId, organizationRoles.id],
  }).onDelete("restrict"),
  index("membership_role_grants_role_idx").on(table.organizationId, table.roleId),
]);

export const organizationBranches = mysqlTable("organization_branches", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  branchCode: varchar("branch_code", { length: 40 }).notNull(),
  branchType: mysqlEnum("branch_type", ["storefront", "warehouse", "distribution_center", "kiosk", "other"])
    .notNull()
    .default("storefront"),
  status: mysqlEnum("status", ["active", "inactive", "closed"]).notNull().default("active"),
  phone: varchar("phone", { length: 50 }),
  addressLine1: varchar("address_line_1", { length: 255 }),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 120 }),
  region: varchar("region", { length: 120 }),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("GH"),
  latitude: double("latitude"),
  longitude: double("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("organization_branches_org_slug_uq").on(table.organizationId, table.slug),
  uniqueIndex("organization_branches_org_code_uq").on(table.organizationId, table.branchCode),
  uniqueIndex("organization_branches_org_id_uq").on(table.organizationId, table.id),
  index("organization_branches_org_status_idx").on(table.organizationId, table.status),
]);

export const membershipBranchAccess = mysqlTable("membership_branch_access", {
  organizationId: int("organization_id").notNull(),
  membershipId: int("membership_id").notNull(),
  branchId: int("branch_id").notNull(),
  grantedByUserId: int("granted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.membershipId, table.branchId] }),
  foreignKey({
    name: "membership_branch_access_same_membership_tenant_fk",
    columns: [table.organizationId, table.membershipId],
    foreignColumns: [organizationMemberships.organizationId, organizationMemberships.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "membership_branch_access_same_branch_tenant_fk",
    columns: [table.organizationId, table.branchId],
    foreignColumns: [organizationBranches.organizationId, organizationBranches.id],
  }).onDelete("restrict"),
]);

export const organizationInvitations = mysqlTable("organization_invitations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  roleId: int("role_id").notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "revoked"]).notNull().default("pending"),
  invitedByUserId: int("invited_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  acceptedByUserId: int("accepted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  foreignKey({
    name: "organization_invitations_role_same_tenant_fk",
    columns: [table.organizationId, table.roleId],
    foreignColumns: [organizationRoles.organizationId, organizationRoles.id],
  }).onDelete("restrict"),
  index("organization_invitations_org_email_status_idx").on(table.organizationId, table.email, table.status),
  index("organization_invitations_expiry_idx").on(table.status, table.expiresAt),
]);

export const saasPlans = mysqlTable("saas_plans", {
  id: int("id").autoincrement().primaryKey(),
  planCode: varchar("plan_code", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  monthlyPriceMinor: int("monthly_price_minor").notNull().default(0),
  annualPriceMinor: int("annual_price_minor").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
  maxMembers: int("max_members").notNull().default(5),
  maxBranches: int("max_branches").notNull().default(1),
  maxProducts: int("max_products"),
  featuresJson: text("features_json").notNull().default("[]"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizationSubscriptions = mysqlTable("organization_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  planId: int("plan_id").notNull().references(() => saasPlans.id, { onDelete: "restrict" }),
  status: mysqlEnum("status", ["trialing", "active", "past_due", "paused", "canceled", "expired"])
    .notNull()
    .default("trialing"),
  billingProvider: varchar("billing_provider", { length: 60 }),
  providerCustomerRef: varchar("provider_customer_ref", { length: 190 }),
  providerSubscriptionRef: varchar("provider_subscription_ref", { length: 190 }),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("organization_subscriptions_org_status_idx").on(table.organizationId, table.status),
  uniqueIndex("organization_subscriptions_provider_ref_uq").on(table.billingProvider, table.providerSubscriptionRef),
]);

// Tenant-scoped customer profiles avoid exposing one retailer's customer book
// to another tenant even when an optional global user account is linked.
export const organizationCustomers = mysqlTable("organization_customers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  userId: int("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("organization_customers_org_id_uq").on(table.organizationId, table.id),
  uniqueIndex("organization_customers_org_email_uq").on(table.organizationId, table.email),
  index("organization_customers_org_phone_idx").on(table.organizationId, table.phone),
]);

export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at"),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: varchar("user_agent", { length: 512 }),
}, (table) => [
  index("user_sessions_user_expiry_idx").on(table.userId, table.expiresAt),
  index("user_sessions_revoked_expiry_idx").on(table.revokedAt, table.expiresAt),
]);

export const tenantAuditLogs = mysqlTable("tenant_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  actorUserId: int("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  actorRoleSnapshot: varchar("actor_role_snapshot", { length: 80 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 120 }),
  requestId: varchar("request_id", { length: 100 }),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("tenant_audit_org_created_idx").on(table.organizationId, table.createdAt),
  index("tenant_audit_actor_created_idx").on(table.organizationId, table.actorUserId, table.createdAt),
  index("tenant_audit_request_idx").on(table.requestId),
]);

// Sellers table (The 5 Founding Cyybrid Team Members & Future Marketplace Vendors)
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
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
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("sellers_org_id_id_uq").on(table.organizationId, table.id),
]);

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
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
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  createdByUserId: int("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
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
}, (table) => [
  uniqueIndex("products_org_id_id_uq").on(table.organizationId, table.id),
  uniqueIndex("products_org_sku_uq").on(table.organizationId, table.sku),
  index("products_org_approval_idx").on(table.organizationId, table.approvalStatus),
]);

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
}, (table) => [
  uniqueIndex("product_sizes_product_id_id_uq").on(table.productId, table.id),
]);

// Quantity is held per branch and variant. inventory_movements is the durable
// ledger; balance rows are transactionally maintained snapshots for fast reads.
export const branchInventoryBalances = mysqlTable("branch_inventory_balances", {
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id").notNull(),
  productId: int("product_id").notNull(),
  productSizeId: int("product_size_id").notNull(),
  quantityOnHand: int("quantity_on_hand").notNull().default(0),
  quantityReserved: int("quantity_reserved").notNull().default(0),
  reorderPoint: int("reorder_point").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.branchId, table.productSizeId] }),
  foreignKey({
    name: "branch_inventory_same_tenant_branch_fk",
    columns: [table.organizationId, table.branchId],
    foreignColumns: [organizationBranches.organizationId, organizationBranches.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "branch_inventory_same_tenant_product_fk",
    columns: [table.organizationId, table.productId],
    foreignColumns: [products.organizationId, products.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "branch_inventory_product_variant_fk",
    columns: [table.productId, table.productSizeId],
    foreignColumns: [productSizes.productId, productSizes.id],
  }).onDelete("restrict"),
  index("branch_inventory_low_stock_idx").on(table.organizationId, table.branchId, table.reorderPoint),
]);

export const inventoryMovements = mysqlTable("inventory_movements", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id").notNull(),
  productId: int("product_id").notNull(),
  productSizeId: int("product_size_id").notNull(),
  movementType: mysqlEnum("movement_type", [
    "receipt", "reservation", "reservation_release", "sale", "adjustment", "transfer_in", "transfer_out", "return",
  ]).notNull(),
  quantityDelta: int("quantity_delta").notNull(),
  reason: varchar("reason", { length: 255 }),
  referenceType: varchar("reference_type", { length: 60 }),
  referenceId: varchar("reference_id", { length: 120 }),
  idempotencyKey: varchar("idempotency_key", { length: 120 }).notNull(),
  actorUserId: int("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("inventory_movements_org_idempotency_uq").on(table.organizationId, table.idempotencyKey),
  foreignKey({
    name: "inventory_movements_same_tenant_branch_fk",
    columns: [table.organizationId, table.branchId],
    foreignColumns: [organizationBranches.organizationId, organizationBranches.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "inventory_movements_same_tenant_product_fk",
    columns: [table.organizationId, table.productId],
    foreignColumns: [products.organizationId, products.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "inventory_movements_product_variant_fk",
    columns: [table.productId, table.productSizeId],
    foreignColumns: [productSizes.productId, productSizes.id],
  }).onDelete("restrict"),
  index("inventory_movements_org_variant_time_idx").on(table.organizationId, table.productSizeId, table.createdAt),
  index("inventory_movements_reference_idx").on(table.organizationId, table.referenceType, table.referenceId),
]);

// Orders table with Structured Delivery Tracking
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  branchId: int("branch_id"),
  customerId: int("customer_id"),
  createdByUserId: int("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  orderNo: varchar("order_no", { length: 100 }).notNull().unique(), // e.g. ORD-9824
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull().default("Greater Accra"),
  postalCode: varchar("postal_code", { length: 50 }),
  subtotalCents: int("subtotal_cents").notNull(),
  shippingCents: int("shipping_cents").notNull().default(0),
  discountCents: int("discount_cents").notNull().default(0),
  totalCents: int("total_cents").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("GHS"),
  status: varchar("status", { length: 50 }).notNull().default("pending_payment"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("unpaid"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("unselected"),
  paystackRef: varchar("paystack_ref", { length: 255 }),
  trackingCode: varchar("tracking_code", { length: 100 }).notNull().unique(), // e.g. TRK-481920-GH
  courierName: varchar("courier_name", { length: 100 }).notNull().default("Cyybrid Express Fleet"),
  courierPhone: varchar("courier_phone", { length: 50 }).notNull().default("+233 24 555 8901"),
  courierVehicle: varchar("courier_vehicle", { length: 100 }).notNull().default("Motorbike Courier #GH-412"),
  courierLat: double("courier_lat").default(5.6037),
  courierLng: double("courier_lng").default(-0.1870),
  destinationLat: double("destination_lat").default(5.6148),
  destinationLng: double("destination_lng").default(-0.1731),
  estimatedDelivery: varchar("estimated_delivery", { length: 100 }).notNull().default("Within 45 - 90 mins"),
  deliveryNotes: text("delivery_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("orders_org_id_id_uq").on(table.organizationId, table.id),
  foreignKey({
    name: "orders_branch_same_tenant_fk",
    columns: [table.organizationId, table.branchId],
    foreignColumns: [organizationBranches.organizationId, organizationBranches.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "orders_customer_same_tenant_fk",
    columns: [table.organizationId, table.customerId],
    foreignColumns: [organizationCustomers.organizationId, organizationCustomers.id],
  }).onDelete("restrict"),
  index("orders_org_branch_created_idx").on(table.organizationId, table.branchId, table.createdAt),
  index("orders_org_status_idx").on(table.organizationId, table.status),
]);

// Order Items table with Seller Attribution & Split Accounting
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  orderId: int("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "restrict" }),
  productId: int("product_id").notNull(),
  sellerId: int("seller_id").notNull().default(1),
  sellerStore: varchar("seller_store", { length: 255 }).notNull().default("Cyybrid Store"),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  sizeLabel: varchar("size_label", { length: 50 }).notNull(),
  image: text("image").notNull(),
  qty: int("qty").notNull(),
  unitPriceCents: int("unit_price_cents").notNull(),
  sellerShareCents: int("seller_share_cents").notNull().default(0), // 95% net to vendor
  platformShareCents: int("platform_share_cents").notNull().default(0), // 5% platform commission
}, (table) => [
  foreignKey({
    name: "order_items_order_same_tenant_fk",
    columns: [table.organizationId, table.orderId],
    foreignColumns: [orders.organizationId, orders.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "order_items_product_same_tenant_fk",
    columns: [table.organizationId, table.productId],
    foreignColumns: [products.organizationId, products.id],
  }).onDelete("restrict"),
  index("order_items_org_order_idx").on(table.organizationId, table.orderId),
]);

export const tenantPayments = mysqlTable("tenant_payments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  orderId: int("order_id").notNull(),
  provider: varchar("provider", { length: 60 }).notNull(),
  providerReference: varchar("provider_reference", { length: 190 }),
  idempotencyKey: varchar("idempotency_key", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["created", "pending", "authorized", "captured", "failed", "voided", "partially_refunded", "refunded"])
    .notNull()
    .default("created"),
  amountMinor: int("amount_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("tenant_payments_org_idempotency_uq").on(table.organizationId, table.idempotencyKey),
  uniqueIndex("tenant_payments_provider_reference_uq").on(table.provider, table.providerReference),
  foreignKey({
    name: "tenant_payments_order_same_tenant_fk",
    columns: [table.organizationId, table.orderId],
    foreignColumns: [orders.organizationId, orders.id],
  }).onDelete("restrict"),
  index("tenant_payments_org_status_time_idx").on(table.organizationId, table.status, table.createdAt),
  uniqueIndex("tenant_payments_org_id_uq").on(table.organizationId, table.id),
]);

// Store a verified digest and processing status, not raw provider payloads or
// secrets. Signature verification and idempotent processing belong in service code.
export const paymentEvents = mysqlTable("payment_events", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  paymentId: int("payment_id").notNull(),
  provider: varchar("provider", { length: 60 }).notNull(),
  providerEventId: varchar("provider_event_id", { length: 190 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payloadHash: varchar("payload_hash", { length: 128 }).notNull(),
  signatureVerified: boolean("signature_verified").notNull().default(false),
  processingStatus: mysqlEnum("processing_status", ["received", "processed", "rejected", "failed"])
    .notNull()
    .default("received"),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => [
  uniqueIndex("payment_events_provider_event_uq").on(table.provider, table.providerEventId),
  foreignKey({
    name: "payment_events_payment_same_tenant_fk",
    columns: [table.organizationId, table.paymentId],
    foreignColumns: [tenantPayments.organizationId, tenantPayments.id],
  }).onDelete("restrict"),
  index("payment_events_org_received_idx").on(table.organizationId, table.receivedAt),
]);

// Seller Payout Distribution Records
export const sellerPayouts = mysqlTable("seller_payouts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  sellerId: int("seller_id").notNull(),
  sellerName: varchar("seller_name", { length: 255 }).notNull(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  amountCents: int("amount_cents").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'completed' | 'failed'
  payoutMethod: varchar("payout_method", { length: 100 }).notNull().default("unassigned"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  foreignKey({
    name: "seller_payouts_seller_same_tenant_fk",
    columns: [table.organizationId, table.sellerId],
    foreignColumns: [sellers.organizationId, sellers.id],
  }).onDelete("restrict"),
  index("seller_payouts_org_created_idx").on(table.organizationId, table.createdAt),
]);

// Audit & Governance Logs (Security & Traceability)
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  actorUserId: int("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  actor: varchar("actor", { length: 255 }).notNull(),
  actorRole: varchar("actor_role", { length: 50 }).notNull().default("customer"), // 'admin' | 'seller' | 'customer' | 'system'
  action: varchar("action", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  details: text("details").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }).default("127.0.0.1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("audit_logs_org_created_idx").on(table.organizationId, table.createdAt),
]);

// Inventory Restock Logs
export const inventoryLogs = mysqlTable("inventory_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  branchId: int("branch_id"),
  actorUserId: int("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  productId: int("product_id").notNull(),
  sellerId: int("seller_id").notNull().default(1),
  productName: varchar("product_name", { length: 255 }).notNull(),
  sizeLabel: varchar("size_label", { length: 50 }).notNull(),
  changeQty: int("change_qty").notNull(),
  previousStock: int("previous_stock").notNull(),
  newStock: int("new_stock").notNull(),
  reason: varchar("reason", { length: 255 }).notNull().default("Stock Adjustment"),
  adminUser: varchar("admin_user", { length: 100 }).notNull().default("Operations Lead"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  foreignKey({
    name: "inventory_logs_branch_same_tenant_fk",
    columns: [table.organizationId, table.branchId],
    foreignColumns: [organizationBranches.organizationId, organizationBranches.id],
  }).onDelete("restrict"),
  foreignKey({
    name: "inventory_logs_product_same_tenant_fk",
    columns: [table.organizationId, table.productId],
    foreignColumns: [products.organizationId, products.id],
  }).onDelete("restrict"),
  index("inventory_logs_org_branch_created_idx").on(table.organizationId, table.branchId, table.createdAt),
]);
