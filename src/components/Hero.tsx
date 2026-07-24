import { translations } from "../data";
import { Product } from "../types";

interface HeroProps {
  lang: "fr" | "ar";
  onExploreClick: () => void;
  onBuyFlagshipClick: () => void;
  products: Product[];
}

export default function Hero({ lang, onExploreClick, onBuyFlagshipClick, products }: HeroProps) {
  const t = translations[lang];
  const flagshipProduct = products.find(p => 
    p.tags?.some(t => (t.slug || "").toLowerCase().includes("hero") || (t.name || "").toLowerCase().includes("hero"))
  ) || products[0];

  const isRTL = lang === "ar";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0f0f10] dark:via-zinc-900/50 dark:to-[#0f0f10] py-8 sm:py-16 lg:py-20">
      {/* Abstract Design Elements */}
      <div className="absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl"></div>
      <div className="absolute top-1/2 left-0 -z-10 h-72 w-72 rounded-full bg-brand-navy/5 blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className={`grid grid-cols-1 items-center gap-8 lg:gap-12 lg:grid-cols-12`}
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {/* Text Content */}
          <div className={`lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6 text-center items-center lg:items-start ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
            
            {/* Main Bold Arabic Heading */}
            <h1 className="font-display text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-brand-navy dark:text-white leading-tight sm:leading-tight lg:leading-[1.15] w-full">
              {isRTL ? (
                <span className="text-brand-navy dark:text-white font-arabic font-black">
                  منتجات مختارة <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent">بجودة مضمونة</span>
                </span>
              ) : (
                <span className="text-brand-navy dark:text-white font-black">
                  Sélection Premium <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent">Qualité Garantie</span>
                </span>
              )}
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-xs sm:text-base leading-relaxed text-gray-600 dark:text-zinc-300 max-w-xl">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 w-full max-w-sm sm:max-w-none">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto rounded-xl bg-brand-green px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-extrabold text-white transition-all duration-200 hover:bg-brand-green-hover active:scale-95 cursor-pointer shadow-md shadow-brand-green/20"
                id="hero-cta-explore"
              >
                {t.heroCTA}
              </button>
              
              <button
                onClick={onBuyFlagshipClick}
                className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-extrabold text-gray-800 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 active:scale-95 cursor-pointer shadow-sm"
                id="hero-cta-buy"
              >
                {lang === "fr" ? "Profiter de l'offre" : "استفد من العرض"}
              </button>
            </div>
          </div>

          {/* Showcase Image container - Simplified design: no shadow, no borders, no text display */}
          <div className="lg:col-span-5 flex justify-center pt-2 lg:pt-0">
            <div 
              onClick={onBuyFlagshipClick}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] transition-transform duration-300 hover:scale-[1.01]"
              id="hero-product-image"
              title={lang === "fr" ? "Cliquez pour commander !" : "اضغط للطلب الآن !"}
            >
              <img
                src={flagshipProduct?.image || "https://placehold.co/600x600/png?text=Tikatkom"}
                alt={isRTL ? flagshipProduct?.titleAR : flagshipProduct?.titleFR}
                className="w-full h-auto max-h-[380px] object-cover rounded-2xl sm:rounded-3xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
