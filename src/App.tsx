import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthModal } from "./components/auth/AuthModal";

import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SearchOverlay } from "./components/shop/SearchOverlay";
import { CartDrawer } from "./components/cart/CartDrawer";
import { CheckoutModal } from "./components/cart/CheckoutModal";

// Luxury Pages
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { AdminPortalPage } from "./pages/AdminPortalPage";
import { AccountPage } from "./pages/AccountPage";
import { DropsPage } from "./pages/DropsPage";
import { EditorialPage } from "./pages/EditorialPage";
import { FAQPage } from "./pages/FAQPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
                  {/* Top Announcement & Currency Bar */}
                  <AnnouncementBar />

                  {/* Main Minimal Luxury Atelier Navbar */}
                  <Navbar onOpenSearch={() => setSearchOpen(true)} />

                  {/* Dynamic Page Content */}
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/drops" element={<DropsPage />} />
                      <Route path="/editorial" element={<EditorialPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/track" element={<OrderTrackingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/admin" element={<AdminPortalPage />} />
                      <Route path="/secret-admin" element={<AdminPortalPage />} />
                      <Route path="*" element={<HomePage />} />
                    </Routes>
                  </main>

                  {/* Modern Luxury Atelier Footer */}
                  <Footer />

                  {/* Global Modals & Drawers */}
                  <SearchOverlay
                    isOpen={searchOpen}
                    onClose={() => setSearchOpen(false)}
                  />
                  <CartDrawer />
                  <CheckoutModal />
                  <AuthModal />
                </div>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
