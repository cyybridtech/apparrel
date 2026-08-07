import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Order, ProductWithSizes } from "@/lib/types";

export type Toast = { id: number; msg: string; kind: "ok" | "err" };

export type CheckoutDetails = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
};

type Store = {
  products: ProductWithSizes[];
  loadingProducts: boolean;
  cart: CartLine[];
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  quickViewId: number | null;
  setQuickViewId: (id: number | null) => void;
  wishlist: number[];
  toggleWish: (id: number) => void;
  toasts: Toast[];
  toast: (msg: string, kind?: "ok" | "err") => void;
  dismissToast: (id: number) => void;
  badgePulse: number;
  addToCart: (productId: number, eu: number, qty?: number) => Promise<boolean>;
  setLineQty: (id: number, qty: number) => Promise<void>;
  removeLine: (id: number) => Promise<void>;
  placeOrder: (
    details: CheckoutDetails
  ) => Promise<{ ok: true; order: Order } | { ok: false; error: string }>;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (v: boolean) => void;
  recentlyViewed: number[];
  trackView: (id: number) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductWithSizes[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("kg_wishlist") ?? "[]"); } catch { return []; }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [badgePulse, setBadgePulse] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("kg_recent") ?? "[]"); } catch { return []; }
  });
  const toastId = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.products)) setProducts(d.products);
      })
      .catch(() => undefined)
      .finally(() => alive && setLoadingProducts(false));
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.items)) setCart(d.items);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, kind: "ok" | "err" = "ok") => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
      window.setTimeout(() => dismissToast(id), 3400);
    },
    [dismissToast]
  );

  const toggleWish = useCallback(
    (id: number) => {
      setWishlist((w) => {
        const has = w.includes(id);
        toast(
          has ? "Removed from wishlist" : "Saved to wishlist ❤️",
          has ? "err" : "ok"
        );
        const next = has ? w.filter((x) => x !== id) : [...w, id];
        localStorage.setItem("kg_wishlist", JSON.stringify(next));
        return next;
      });
    },
    [toast]
  );

  const addToCart = useCallback(
    async (productId: number, eu: number, qty = 1) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, eu, qty }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error ?? "Could not add to bag", "err");
          return false;
        }
        setCart(data.items);
        setBadgePulse((n) => n + 1);
        const sizeLabel = data.items?.find((l: any) => l.product?.id === productId)?.sizeLabel;
        toast(`Added to bag${sizeLabel ? ` — ${sizeLabel}` : eu >= 36 ? ` — EU ${eu}` : ""}`);
        return true;
      } catch {
        toast("Network error", "err");
        return false;
      }
    },
    [toast]
  );

  const setLineQty = useCallback(async (id: number, qty: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qty }),
      });
      const data = await res.json();
      if (res.ok) setCart(data.items);
    } catch {
      /* keep current state */
    }
  }, []);

  const removeLine = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          setCart(data.items);
          toast("Removed from bag", "err");
        }
      } catch {
        /* keep current state */
      }
    },
    [toast]
  );

  const placeOrder = useCallback(
    async (details: CheckoutDetails) => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false as const, error: data.error ?? "Failed" };
        setCart([]);
        toast(`Order ${data.order.orderNo} confirmed`);
        return { ok: true as const, order: data.order as Order };
      } catch {
        return { ok: false as const, error: "Network error" };
      }
    },
    [toast]
  );

  const trackView = useCallback((id: number) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((x) => x !== id);
      const next = [id, ...filtered].slice(0, 8);
      localStorage.setItem("kg_recent", JSON.stringify(next));
      return next;
    });
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((n, l) => n + l.qty, 0),
    [cart]
  );

  const value: Store = {
    products,
    loadingProducts,
    cart,
    cartCount,
    cartOpen,
    setCartOpen,
    quickViewId,
    setQuickViewId,
    wishlist,
    toggleWish,
    toasts,
    toast,
    dismissToast,
    badgePulse,
    addToCart,
    setLineQty,
    removeLine,
    placeOrder,
    searchOpen,
    setSearchOpen,
    sizeGuideOpen,
    setSizeGuideOpen,
    recentlyViewed,
    trackView,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
