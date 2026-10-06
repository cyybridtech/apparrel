import type {
  sellers,
  products,
  productSizes,
  orders,
  orderItems,
  sellerPayouts,
  auditLogs,
  inventoryLogs,
} from "@/db/schema";

export type Seller = typeof sellers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductSize = typeof productSizes.$inferSelect;
export type ProductWithSizes = Product & {
  sizes: ProductSize[];
  sellerName?: string;
  sellerStore?: string;
  sellerSlug?: string;
};

export type CartLine = {
  id: number;
  qty: number;
  eu: number;
  stock: number;
  addedAt: string;
  product: Product;
};

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };
export type SellerPayout = typeof sellerPayouts.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
