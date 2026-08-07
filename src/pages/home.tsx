import { Hero } from "@/components/hero";
import { Shop } from "@/components/shop";
import { CategoryGrid } from "@/components/CategoryGrid";
import { DropSection } from "@/components/drop";
import { Brands } from "@/components/brands";
import { Testimonials } from "@/components/testimonials";
import { RecentlyViewed } from "@/components/recentlyviewed";
import { Ticker } from "@/components/ui";

const TICKER_BRANDS = [
  "AXIOM", "KOVA", "STATIC", "PLUME", "DRAFT", "HALCYON",
  "KICKS GHANA", "•", "Footwear", "Tops", "Designer Shirts", "Club Tees",
];

export default function HomePage() {
  return (
    <main>
      {/* 1. Hero — rotating featured product */}
      <Hero />

      {/* 2. Brand ticker */}
      <Ticker tone="volt" items={TICKER_BRANDS} />

      {/* 3. Category shortcut grid */}
      <CategoryGrid />

      {/* 4. Full collection wall with tabs */}
      <Shop />

      {/* 5. Recently viewed */}
      <RecentlyViewed />

      {/* 6. Brand showcase */}
      <Brands />

      {/* 7. Social proof / reviews */}
      <Testimonials />

      {/* 8. Upcoming drop section */}
      <DropSection />
    </main>
  );
}
