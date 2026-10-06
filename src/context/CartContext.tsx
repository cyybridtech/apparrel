import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  sizeLabel: string;
  image: string;
  qty: number;
  unitPriceCents: number;
  sku: string;
  sellerId?: number;
  sellerStore?: string;
  sellerName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (productId: number, sizeLabel: string) => void;
  updateQuantity: (productId: number, sizeLabel: string, qty: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  promoCode: string;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  freeShippingThresholdCents: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cyybrid_cart_v2";
const FREE_SHIPPING_THRESHOLD = 60000; // GHS 600.00
const STANDARD_SHIPPING_FEE = 3500; // GHS 35.00

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const { success, info, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "qty">, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.sizeLabel === item.sizeLabel
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + qty,
        };
        return updated;
      }

      return [...prev, { ...item, qty }];
    });

    success("Added to Bag", `${item.name} (${item.sizeLabel})`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, sizeLabel: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId && i.sizeLabel === sizeLabel);
      if (item) {
        info("Removed from Bag", item.name);
      }
      return prev.filter((i) => !(i.productId === productId && i.sizeLabel === sizeLabel));
    });
  };

  const updateQuantity = (productId: number, sizeLabel: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, sizeLabel);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.sizeLabel === sizeLabel
          ? { ...item, qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  const subtotalCents = cart.reduce(
    (total, item) => total + item.unitPriceCents * item.qty,
    0
  );

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD || subtotalCents === 0
      ? 0
      : STANDARD_SHIPPING_FEE;

  const discountCents = Math.round(subtotalCents * (discountPercent / 100));

  const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents);

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === "CYYBRID10" || clean === "VIP10") {
      setPromoCode(clean);
      setDiscountPercent(10);
      success("Promo Applied", "10% VIP Marketplace Discount Applied!");
      return true;
    } else if (clean === "FOUNDER20") {
      setPromoCode(clean);
      setDiscountPercent(20);
      success("Promo Applied", "20% Cyybrid Founder Discount Applied!");
      return true;
    } else {
      error("Invalid Code", "Please check your promo code and try again.");
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountPercent(0);
    info("Promo Removed", "Marketplace promotion was cleared.");
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotalCents,
        shippingCents,
        discountCents,
        totalCents,
        promoCode,
        applyPromoCode,
        removePromoCode,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
