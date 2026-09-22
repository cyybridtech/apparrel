import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./ToastContext";

export interface WishlistItem {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  image: string;
  rating: number;
  badge?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  totalWishlistCount: number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "apparrel_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to persist wishlist", e);
    }
  }, [wishlist]);

  const addToWishlist = (item: WishlistItem) => {
    if (!wishlist.some((w) => w.id === item.id)) {
      setWishlist((prev) => [...prev, item]);
      success("Saved to Wishlist", `${item.name} added to your favorites.`);
    }
  };

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => {
      const item = prev.find((w) => w.id === id);
      if (item) {
        info("Removed from Wishlist", `${item.name} removed.`);
      }
      return prev.filter((w) => w.id !== id);
    });
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (wishlist.some((w) => w.id === item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (id: number) => wishlist.some((w) => w.id === id);

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        totalWishlistCount: wishlist.length,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
