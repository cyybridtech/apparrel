import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SearchOverlay } from "./components/shop/SearchOverlay";
import { CartDrawer } from "./components/cart/CartDrawer";
import { CheckoutModal } from "./components/cart/CheckoutModal";

// Pages
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { AdminPortalPage } from "./pages/AdminPortalPage";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
              {/* Top Announcement Bar */}
              <AnnouncementBar />

              {/* Main Minimal Luxury Navbar */}
              <Navbar onOpenSearch={() => setSearchOpen(true)} />

              {/* Page Content */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/track" element={<OrderTrackingPage />} />
                  <Route path="/admin" element={<AdminPortalPage />} />
                  <Route path="/secret-admin" element={<AdminPortalPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Modern Luxury Footer */}
              <Footer />

              {/* Global Modals & Drawers */}
              <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
              />
              <CartDrawer />
              <CheckoutModal />
            </div>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
