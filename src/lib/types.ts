import type {
  products,
  productSizes,
  orders,
  orderItems,
} from "@/db/schema";

export type Product = typeof products.$inferSelect;
export type ProductSize = typeof productSizes.$inferSelect;
export type ProductWithSizes = Product & { sizes: ProductSize[] };

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
