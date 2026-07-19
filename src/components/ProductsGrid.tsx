import { useState } from "react";
import { products, categories, translations } from "../data";
import { Product } from "../types";
import { Star } from "lucide-react";

interface ProductsGridProps {
  lang: "fr" | "ar";
  onBuyClick: (product: Product) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
}

export default function ProductsGrid({
  lang,
  onBuyClick,
  selectedCategory,
  setSelectedCategory,
}: ProductsGridProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  // Filter products based on category selection
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <section className="bg-gray-50/50 py-16 sm:py-20 lg:py-24" id="products-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mb-10 text-center ${isRTL ? "rtl" : "ltr"}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
            {t.featHeader}
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-brand-green"></div>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500 sm:text-base">
            {t.featSub}
          </p>
        </div>

        {/* Categories Quick Filter Bar */}
        <div className="mb-12 flex flex-wrap justify-center gap-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
              selectedCategory === null
                ? "bg-brand-navy text-white shadow-md shadow-brand-navy/10"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
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
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-brand-navy text-white shadow-md shadow-brand-navy/10"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
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
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                id={`product-card-${product.id}`}
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
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
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
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
                      <span className="text-xs font-bold text-gray-700">{product.rating}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-extrabold text-brand-navy tracking-tight group-hover:text-brand-green transition-colors line-clamp-2">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-3">
                    {description}
                  </p>

                  {/* Pricing Row */}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-green">
                      {product.price.toLocaleString()} {t.priceCurrency}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.oldPrice.toLocaleString()} {t.priceCurrency}
                      </span>
                    )}
                  </div>

                  {/* Button Action */}
                  <button
                    onClick={() => onBuyClick(product)}
                    className="mt-6 w-full rounded-xl bg-brand-navy py-3 px-4 text-xs font-bold text-white transition-all duration-200 hover:bg-brand-green hover:shadow-md hover:shadow-brand-green/20 active:scale-[0.98]"
                    id={`buy-btn-${product.id}`}
                  >
                    {t.buyNow}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
