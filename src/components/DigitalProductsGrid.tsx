import { translations, digitalProducts as defaultDigitalProducts, digitalCategories as defaultDigitalCategories } from "../data";
import { Product, Category } from "../types";

interface DigitalProductsGridProps {
  lang: "fr" | "ar";
  onBuyClick: (product: Product) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  products?: Product[];
  categories?: Category[];
}

export default function DigitalProductsGrid({
  lang,
  onBuyClick,
  selectedCategory,
  setSelectedCategory,
  products = defaultDigitalProducts,
  categories = defaultDigitalCategories,
}: DigitalProductsGridProps) {
  if (!products || products.length === 0) return null;

  const t = translations[lang];
  const isRTL = lang === "ar";

  // Filter products based on category selection
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <section className="bg-gray-50/50 dark:bg-[#121212] py-16 sm:py-20 lg:py-24" id="digital-products-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`mb-10 text-center ${isRTL ? "rtl" : "ltr"}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white sm:text-4xl">
            {lang === "fr" ? "Boutique des Produits Numériques" : "متجر المنتجات والخدمات الرقمية"}
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-brand-green"></div>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500 dark:text-zinc-400 sm:text-base">
            {lang === "fr" 
              ? "Découvrez nos abonnements, licences et produits numériques" 
              : "تصفح جميع الاشتراكات والمفاتيح والمنتجات الرقمية المتوفرة"}
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
            id="digital-filter-all-btn"
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
                id={`digital-filter-btn-${cat.id}`}
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

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                id={`digital-product-card-${product.id}`}
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#1e1e1e]">
                  <img
                    src={product.image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col p-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                  {/* Category Name Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-brand-green uppercase tracking-wider">
                      {lang === "fr" 
                        ? categories.find(c => c.id === product.category)?.nameFR 
                        : categories.find(c => c.id === product.category)?.nameAR
                      }
                    </span>
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

                  {/* Button Action */}
                  <button
                    onClick={() => onBuyClick(product)}
                    className="mt-6 w-full rounded-xl bg-brand-navy dark:bg-[#262626] py-3 px-4 text-xs font-bold text-white transition-all duration-200 hover:bg-brand-green hover:shadow-md hover:shadow-brand-green/20 active:scale-[0.98] cursor-pointer"
                    id={`digital-buy-btn-${product.id}`}
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
