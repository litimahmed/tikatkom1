import { useState, useMemo } from "react";
import { Product, Category } from "../types";
import { digitalProducts as staticDigitalProducts, translations } from "../data";

interface DigitalStorePageProps {
  lang: "fr" | "ar";
  onBackHome: () => void;
  onSelectProduct: (product: Product) => void;
  onBuyClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  initialSubcategory?: string | null;
  allProducts?: Product[];
  categories?: Category[];
}

export default function DigitalStorePage({
  lang,
  onBackHome,
  onSelectProduct,
  onBuyClick,
  onAddToCart,
  initialSubcategory = null,
  allProducts = [],
  categories = []
}: DigitalStorePageProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  // Combine live WooCommerce digital products with static digital products
  const combinedDigitalProducts = useMemo(() => {
    const fromProps = allProducts.filter(p => p.isDigital || p.category === "digital" || p.category.toLowerCase().startsWith("digital"));
    if (fromProps.length > 0) {
      const propIds = new Set(fromProps.map(p => p.id));
      const remainingStatic = staticDigitalProducts.filter(p => !propIds.has(p.id));
      return [...fromProps, ...remainingStatic];
    }
    return staticDigitalProducts;
  }, [allProducts]);

  const [activeSubcat, setActiveSubcat] = useState<string>(initialSubcategory || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const defaultSubcategories = [
    { id: "all", labelFR: "Tous les produits", labelAR: "جميع المنتجات الرقمية" },
    { id: "vip_subscriptions", labelFR: "Abonnements VIP", labelAR: "اشتراكات وتطبيقات VIP" },
    { id: "activation_keys", labelFR: "Clés & Licences", labelAR: "تفعيل وتسليم تلقائي" },
    { id: "ai_tools", labelFR: "Outils IA & Web", labelAR: "أدوات وحسابات AI" },
    { id: "ebooks_courses", labelFR: "E-Books & Formations", labelAR: "مكتبة التعلم والدورات" },
    { id: "gift_cards", labelFR: "Cartes Cadeaux", labelAR: "بطاقات هدايا وشحن" },
    { id: "design_templates", labelFR: "Templates & Design", labelAR: "قوالب وتصاميم جاهزة" },
  ];

  // Dynamically include WooCommerce digital categories whose slug starts with "digital" or isDigital = true
  const subcategories = useMemo(() => {
    const wpDigitalSubcats = categories
      .filter(c => c.isDigital || c.id.toLowerCase().startsWith("digital") || (c.slug && c.slug.toLowerCase().startsWith("digital")))
      .map(c => ({
        id: c.id,
        labelFR: c.nameFR,
        labelAR: c.nameAR
      }));

    if (wpDigitalSubcats.length > 0) {
      const existingIds = new Set(wpDigitalSubcats.map(s => s.id));
      const merged = [{ id: "all", labelFR: "Tous les produits", labelAR: "جميع المنتجات الرقمية" }];
      
      wpDigitalSubcats.forEach(sc => merged.push(sc));
      
      // Also add default subcategories if they don't conflict
      defaultSubcategories.forEach(ds => {
        if (ds.id !== "all" && !existingIds.has(ds.id)) {
          merged.push(ds);
        }
      });
      return merged;
    }

    return defaultSubcategories;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return combinedDigitalProducts.filter((product) => {
      if (activeSubcat !== "all") {
        const matchesSubcat = product.digitalCategory === activeSubcat;
        const matchesCategory = product.category === activeSubcat || product.category.toLowerCase() === activeSubcat.toLowerCase();
        if (!matchesSubcat && !matchesCategory) {
          return false;
        }
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchFR = product.titleFR.toLowerCase().includes(q) || product.descriptionFR.toLowerCase().includes(q);
        const matchAR = product.titleAR.toLowerCase().includes(q) || product.descriptionAR.toLowerCase().includes(q);
        return matchFR || matchAR;
      }
      return true;
    });
  }, [combinedDigitalProducts, activeSubcat, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#121212] py-8 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className={`mb-6 sm:mb-10 text-center ${isRTL ? "rtl" : "ltr"}`} style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <h1 className="font-display text-2xl font-black tracking-tight text-brand-navy dark:text-white sm:text-4xl">
            {isRTL ? "المتجر الرقمي والاشتراكات" : "Boutique des Produits Numériques"}
          </h1>
          <div className="mx-auto mt-2 sm:mt-3 h-1 w-12 rounded-full bg-brand-green"></div>
          <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-xs sm:text-base text-gray-500 dark:text-zinc-400">
            {isRTL 
              ? "تصفح أفضل الاشتراكات الرسمية، مفاتيح البرامج، وأدوات الذكاء الاصطناعي"
              : "Abonnements VIP, clés officielles, outils IA et formations au meilleur prix"
            }
          </p>
        </div>

        {/* Categories Quick Filter Bar */}
        <div className="mb-6 sm:mb-10 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {subcategories.map((cat) => {
            const isSelected = activeSubcat === cat.id;
            const name = isRTL ? cat.labelAR : cat.labelFR;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveSubcat(cat.id)}
                className={`shrink-0 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
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
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              {isRTL ? "لا توجد منتجات رقمية متاحة حالياً" : "Aucun produit numérique disponible."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const title = isRTL ? product.titleAR : product.titleFR;
              const description = isRTL ? product.descriptionAR : product.descriptionFR;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#1e1e1e] cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Stock / Delivery Status Pill */}
                    <span
                      className={`absolute bottom-3 ${isRTL ? "left-3" : "right-3"} rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30`}
                    >
                      {isRTL ? "تسليم فوري" : "Livraison instantanée"}
                    </span>
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-1 flex-col p-4 sm:p-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                    
                    {/* Category Label */}
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-brand-green uppercase tracking-wider">
                        {isRTL ? "منتج رقمي" : "Produit Numérique"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-display text-lg font-extrabold text-brand-navy dark:text-zinc-100 tracking-tight group-hover:text-brand-green transition-colors line-clamp-2 cursor-pointer"
                    >
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
                      >
                        {t.buyNow}
                      </button>

                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full text-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 px-4 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        {lang === "fr" ? "Ajouter au Panier" : "أضف إلى السلة"}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
