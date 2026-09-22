import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/utils";

export function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (item: any) => {
    addToCart({
      productId: item.id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      category: item.category,
      sizeLabel: "Standard",
      image: item.image,
      unitPriceCents: item.priceCents,
      sku: `WSH-${item.id}`,
    });
    removeFromWishlist(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Saved Essentials</span>
          </div>
          <h1 className="text-3xl font-black font-heading text-slate-950">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of items you love and move them directly to your bag when ready.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors self-start sm:self-center"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-500 hover:text-rose-600 shadow-sm transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.brand}
                  </span>
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:underline">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-black text-slate-950 font-heading mt-1">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>

                <button
                  onClick={() => handleMoveToBag(item)}
                  className="w-full btn-primary text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Save your favorite tops, sneakers, fragrances, and watches by clicking the heart icon on any product.
            </p>
          </div>
          <Link to="/shop" className="btn-primary text-xs py-2.5 px-6 rounded-full inline-block">
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
