import { useState } from "react";
import { translations } from "../data";
import { Product, Category } from "../types";
import { Star } from "lucide-react";

interface ProductsGridProps {
  lang: "fr" | "ar";
  onBuyClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  products: Product[];
  categories: Category[];
}

export default function ProductsGrid({
  lang,
  onBuyClick,
  onAddToCart,
  selectedCategory,
  setSelectedCategory,
  products,
  categories,
}: ProductsGridProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  // Filter products based on category selection
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <section className="bg-gray-50/50 dark:bg-[#121212] py-16 sm:py-20 lg:py-24" id="products-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mb-10 text-center ${isRTL ? "rtl" : "ltr"}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white sm:text-4xl">
            {t.featHeader}
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-brand-green"></div>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500 dark:text-zinc-400 sm:text-base">
            {t.featSub}
          </p>
        </div>

        {/* Categories Quick Filter Bar */}
        <div className="mb-12 flex flex-wrap justify-center gap-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
              selectedCategory === null
                ? "bg-brand-navy dark:bg-[#262626] text-white shadow-md shadow-brand-navy/10"
                : "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#262626] hover:border-gray-300 dark:hover:border-[#333333]"
            }`}
            id="filter-all-btn"
          >
            {lang === "fr" ? "Tous les produits" : "جميع المنتجات"}
          </button>
          
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const name = lang === "fr" ? cat.nameFR : cat.nameAR;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-brand-navy dark:bg-[#262626] text-white shadow-md shadow-brand-navy/10"
                    : "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#262626] hover:border-gray-300 dark:hover:border-[#333333]"
                }`}
                id={`filter-btn-${cat.id}`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const title = lang === "fr" ? product.titleFR : product.titleAR;
            const description = lang === "fr" ? product.descriptionFR : product.descriptionAR;
            const badge = lang === "fr" ? product.badgeFR : product.badgeAR;

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                id={`product-card-${product.id}`}
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#1e1e1e]">
                  <img
                    src={product.image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge */}
                  {badge && (
                    <span className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} rounded-lg bg-brand-green px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider`}>
                      {badge}
                    </span>
                  )}

                  {/* Stock Status Pill */}
                  <span
                    className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"} rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      product.stockStatus === "in_stock"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                    }`}
                  >
                    {product.stockStatus === "in_stock" ? t.stockIn : t.stockLow}
                  </span>
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col p-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                  {/* Category Name & Rating Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-brand-green uppercase tracking-wider">
                      {lang === "fr" 
                        ? categories.find(c => c.id === product.category)?.nameFR 
                        : categories.find(c => c.id === product.category)?.nameAR
                      }
                    </span>
                    
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{product.rating}</span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-extrabold text-brand-navy dark:text-zinc-100 tracking-tight group-hover:text-brand-green transition-colors line-clamp-2">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 line-clamp-3">
                    {description}
                  </p>

                  {/* Pricing Row */}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-green">
                      {product.price.toLocaleString()} {t.priceCurrency}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">
                        {product.oldPrice.toLocaleString()} {t.priceCurrency}
                      </span>
                    )}
                  </div>

                  {/* Button Actions */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => onBuyClick(product)}
                      className="w-full rounded-xl bg-brand-navy dark:bg-[#262626] py-3 px-4 text-xs font-extrabold text-white transition-all duration-200 hover:bg-brand-green hover:shadow-md hover:shadow-brand-green/20 active:scale-[0.98] cursor-pointer text-center"
                      id={`buy-btn-${product.id}`}
                    >
                      {t.buyNow}
                    </button>

                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full text-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 px-4 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        id={`add-cart-btn-${product.id}`}
                      >
                        {lang === "fr" ? "Ajouter au Panier" : "أضف إلى السلة"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
