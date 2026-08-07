import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QuickView } from "@/components/quickview";
import { CartDrawer } from "@/components/cartdrawer";
import { SearchOverlay } from "@/components/search";
import { SizeGuide } from "@/components/sizeguide";
import { Toasts } from "@/components/ui";
import { BackToTop } from "@/components/backtotop";
import HomePage from "@/pages/home";
import ProductPage from "@/pages/product-detail";
import OrdersPage from "@/pages/orders";
import WishlistPage from "@/pages/wishlist";
import { AdminPage } from "@/pages/admin";

export default function App() {
  return (
    <Router>
      <StoreProvider>
        <div className="min-h-screen bg-[#07090e] text-[#f3f4f6]">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
          <Footer />
          <QuickView />
          <CartDrawer />
          <SearchOverlay />
          <SizeGuide />
          <Toasts />
          <BackToTop />
        </div>
      </StoreProvider>
    </Router>
  );
}
