import { ArrowRight, ArrowLeft } from "lucide-react";
import { getProductsForSection } from "../lib/woocommerce";
import { Product, Category } from "../types";
import AutoSlider from "./AutoSlider";

interface HomeSectionsProps {
  lang: "fr" | "ar";
  onBuyClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onViewAllClick: (categoryId: string | null) => void;
  products: Product[];
  categories: Category[];
}

export default function HomeSections({ lang, onBuyClick, onAddToCart, onViewAllClick, products, categories }: HomeSectionsProps) {
  const isRTL = lang === "ar";

  // Select filtered subsets of products for each of the 4 sections
  const sectionsData = [
    {
      id: "most_requested" as const,
      titleAR: "الأكثر طلبًا هذا الأسبوع",
      subtitleAR: "منتجات مميزة",
      titleFR: "LES PLUS DEMANDÉS DE LA SEMAINE",
      targetCategory: null, // "all"
    },
    {
      id: "new_arrivals" as const,
      titleAR: "جديد وحصري في المخزون",
      subtitleAR: "وصل حديثًا",
      titleFR: "NOUVEAUTÉS & EXCLUSIVITÉS",
      targetCategory: "electronics", // can auto-filter on click
    },
    {
      id: "best_sellers" as const,
      titleAR: "أفضل مبيعاتنا",
      subtitleAR: "الأكثر مبيعًا",
      titleFR: "NOS MEILLEURES VENTES",
      targetCategory: "home",
    },
    {
      id: "flash_deals" as const,
      titleAR: "عروض فلاش سريعة",
      subtitleAR: "عرض محدود",
      titleFR: "OFFRES FLASH LIMITÉES",
      targetCategory: null,
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-16 py-8 sm:py-16">
      {sectionsData.map((sec) => {
        // Find products belonging to this section using our high-fidelity WooCommerce tags filter
        const secProducts = getProductsForSection(products, sec.id);

        if (secProducts.length === 0) return null;

        const renderProductCard = (product: Product) => {
          const title = lang === "fr" ? product.titleFR : product.titleAR;
          const badge = lang === "fr" ? product.badgeFR : product.badgeAR;
          
          return (
            <div
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-3 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full"
              id={`home-product-card-${sec.id}-${product.id}`}
            >
              {/* Image Section */}
              <div 
                onClick={() => onBuyClick(product)}
                className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-[#262626] cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Section */}
              <div className="mt-3 flex flex-1 flex-col justify-between">
                <div>
                  {/* Category Row */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider">
                      {lang === "fr" 
                        ? categories.find(c => c.id === product.category)?.nameFR 
                        : categories.find(c => c.id === product.category)?.nameAR
                      }
                    </span>
                  </div>

                  {/* Product Title */}
                  <h4 
                    onClick={() => onBuyClick(product)}
                    className="font-arabic font-extrabold text-xs text-brand-navy dark:text-zinc-100 mt-1.5 leading-snug line-clamp-2 group-hover:text-brand-green transition-colors sm:text-sm cursor-pointer"
                  >
                    {title}
                  </h4>
                </div>

                <div className="mt-4">
                  {/* Pricing Row */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-brand-green sm:text-base">
                      {product.price.toLocaleString()} {lang === "fr" ? "DA" : "دج"}
                    </span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 line-through">
                        {product.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* CTA Order Buttons */}
                  <div className="mt-3 space-y-1.5">
                    <button
                      onClick={() => onBuyClick(product)}
                      className="w-full rounded-full bg-brand-navy dark:bg-[#262626] py-2.5 px-3 text-[11px] font-extrabold text-white transition-all duration-200 hover:bg-brand-green dark:hover:bg-brand-green hover:shadow-sm active:scale-[0.98] cursor-pointer text-center"
                      id={`home-buy-btn-${sec.id}-${product.id}`}
                    >
                      {lang === "fr" ? "Acheter Maintenant" : "اشتري الآن"}
                    </button>

                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full text-center rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2 px-3 text-[10px] font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        id={`home-add-cart-btn-${sec.id}-${product.id}`}
                      >
                        {lang === "fr" ? "Ajouter au Panier" : "أضف إلى السلة"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        };

        return (
          <section 
            key={sec.id} 
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {/* Section Title Bar */}
            <div className="flex items-end justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-5 sm:pb-4 sm:mb-8">
              <div className="flex flex-col gap-y-1 sm:gap-y-2">
                {/* French or Arabic Subtitle */}
                {isRTL ? (
                  <p className="font-arabic text-xs sm:text-sm font-bold text-brand-green tracking-wide">
                    {sec.subtitleAR}
                  </p>
                ) : (
                  <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
                    {sec.titleFR}
                  </p>
                )}
                
                {/* Bold Arabic Main Heading */}
                <h3 className={`text-brand-navy dark:text-white tracking-tight text-xl sm:text-3xl ${isRTL ? "font-arabic font-black" : "font-sans font-black"}`}>
                  {isRTL ? sec.titleAR : sec.titleFR}
                </h3>
              </div>

              {/* Voir Tout Link */}
              <button
                onClick={() => onViewAllClick(sec.targetCategory)}
                className="group flex items-center gap-1.5 text-xs font-black text-brand-navy dark:text-zinc-200 hover:text-brand-green transition-colors focus:outline-none cursor-pointer"
              >
                <span>{lang === "fr" ? "Voir tout" : "عرض الكل"}</span>
                {isRTL ? (
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>

            {/* Reusable High-Performance Auto-sliding Product Carousel */}
            <AutoSlider
              items={secProducts}
              renderItem={renderProductCard}
              lang={lang}
              idPrefix={`products-slider-${sec.id}`}
              visibleDesktop={3}
              visibleTablet={2}
              visibleMobile={1}
              autoPlayInterval={3000}
            />
          </section>
        );
      })}
    </div>
  );
}
