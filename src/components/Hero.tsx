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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0f0f10] dark:via-zinc-900/50 dark:to-[#0f0f10] py-12 md:py-20 lg:py-24">
      {/* Abstract Design Elements */}
      <div className="absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl"></div>
      <div className="absolute top-1/2 left-0 -z-10 h-72 w-72 rounded-full bg-brand-navy/5 blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-12`}
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {/* Text Content */}
          <div className={`lg:col-span-7 flex flex-col justify-center space-y-6 text-center items-center lg:items-start ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
            
            {/* Main Bold Arabic Heading */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-navy dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.15] w-full">
              {isRTL ? (
                <span className="text-brand-navy dark:text-white font-arabic font-black">
                  منتجات مختارة <br />
                  <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent">بجودة مضمونة</span>
                </span>
              ) : (
                <span className="text-brand-navy dark:text-white font-extrabold">
                  Sélection Premium <br />
                  <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent">Qualité Garantie</span>
                </span>
              )}
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-base leading-relaxed text-gray-600 dark:text-zinc-300 sm:text-lg max-w-2xl">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto rounded-xl bg-brand-green px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-green/30 transition-all duration-200 hover:bg-brand-green-hover hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                id="hero-cta-explore"
              >
                {t.heroCTA}
              </button>
              
              <button
                onClick={onBuyFlagshipClick}
                className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 text-base font-bold text-gray-800 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                id="hero-cta-buy"
              >
                {lang === "fr" ? "Profiter de l'offre" : "استفد من العرض"}
              </button>
            </div>

            {/* Micro Trust Indicators below CTA */}
            {isRTL ? (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-arabic font-bold text-gray-600 dark:text-zinc-400 pt-4">
                <span>الدفع عند الاستلام</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green/75"></span>
                <span>التوصيل لـ 58 ولاية عبر ياليدين</span>
              </div>
            ) : (
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-gray-500 dark:text-zinc-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>COD - الدفع عند الاستلام</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Yalidine 58 Wilayas</span>
                </div>
              </div>
            )}
          </div>

          {/* Large Showcase Image container */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Soft backdrop radial shadow */}
            <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-brand-green/10 blur-3xl"></div>
            
            <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-100 dark:border-zinc-800 transition-transform duration-500 hover:scale-[1.02]">
              {/* Product Card Container */}
              <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900">
                <img
                  src={flagshipProduct?.image || "/src/assets/images/placeholder.jpg"}
                  alt={isRTL ? flagshipProduct?.titleAR : flagshipProduct?.titleFR}
                  className="h-[320px] w-[320px] object-cover sm:h-[380px] sm:w-[380px] transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Sale Tag Badge Overlay */}
                <span className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} rounded-lg bg-red-500 px-3 py-1.5 text-xs font-black text-white uppercase tracking-wider`}>
                  {lang === "fr" ? "OFFRE LIMITÉE" : "عرض محدود"}
                </span>

                {/* Micro info bar under the image */}
                <div className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-950/80 p-4">
                  <div className="flex items-center justify-between">
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                        {lang === "fr" ? "Style de Vie Premium" : "نمط حياة متميز"}
                      </p>
                      <h4 className="text-sm font-bold text-brand-navy dark:text-white truncate max-w-[180px]">
                        {isRTL ? flagshipProduct?.titleAR : flagshipProduct?.titleFR}
                      </h4>
                    </div>
                    <div className={isRTL ? "text-left" : "text-right"}>
                      {flagshipProduct?.oldPrice && (
                        <p className="text-xs text-gray-400 dark:text-zinc-500 line-through">
                          {(flagshipProduct.oldPrice).toLocaleString()} {lang === "fr" ? "DA" : "دج"}
                        </p>
                      )}
                      <p className="text-base font-extrabold text-brand-green">
                        {flagshipProduct ? (flagshipProduct.price).toLocaleString() : 0} {lang === "fr" ? "DA" : "دج"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
