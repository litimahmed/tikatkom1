import { ShieldCheck, Truck, Package, Headphones } from "lucide-react";
import { translations } from "../data";

interface BrandBannerProps {
  lang: "fr" | "ar";
}

export default function BrandBanner({ lang }: BrandBannerProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  return (
    <section className="bg-white dark:bg-[#1a1b1e]/40 py-12 sm:py-16 my-8 border-y border-gray-100 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 justify-between"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {/* Left Side: Elegant Logo Frame (Tikatkom logo) */}
          <div className="flex shrink-0 items-center justify-center bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-md border border-gray-100 dark:border-zinc-800 max-w-[240px] sm:max-w-[280px] hover:shadow-lg transition-shadow duration-300">
            <img 
              src="/src/assets/images/tikatkom_brand_logo_1784439572660.jpg" 
              alt="Tikatkom Logo" 
              className="w-full h-auto object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right Side: Signature Wording and Pillars */}
          <div className={`flex-1 flex flex-col justify-center text-center ${isRTL ? "lg:text-right" : "lg:text-left"} space-y-6`}>
            
            {/* Signature text hierarchy */}
            <div className="space-y-3">
              {/* TIKATKOM.COM Brand Link */}
              <h4 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-navy dark:text-white font-sans">
                TIKATKOM<span className="text-brand-green">.COM</span>
              </h4>

              {/* Slogan with decorative side-lines (ثقتكم) */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="h-[2px] w-8 sm:w-12 bg-brand-green"></div>
                <span className="text-2xl sm:text-3xl font-black text-brand-green font-arabic tracking-wide">
                  {lang === "fr" ? "Votre Confiance" : "ثقتكم"}
                </span>
                <div className="h-[2px] w-8 sm:w-12 bg-brand-green"></div>
              </div>

              {/* Wording "منتجات مختارة... جودة مضمونة" */}
              <p className={`text-gray-500 dark:text-zinc-400 text-sm sm:text-base font-bold tracking-wide ${isRTL ? "font-arabic" : "font-sans uppercase"}`}>
                {lang === "fr" ? "PRODUITS SÉLECTIONNÉS... QUALITÉ GARANTIE" : "منتجات مختارة... جودة مضمونة"}
              </p>
            </div>

            {/* Row of 4 beautiful boxes styled EXACTLY like the signature image green-border row */}
            <div className="pt-2 w-full max-w-3xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 rounded-2xl sm:rounded-full border border-brand-green/30 bg-emerald-50/15 dark:bg-emerald-950/10 p-2 text-brand-navy dark:text-zinc-100">
                {/* Pillar 1: Quality */}
                <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 sm:border-r border-brand-green/20 last:border-r-0 ${isRTL ? "sm:border-r-0 sm:border-l" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black ${isRTL ? "font-arabic" : "font-sans uppercase"}`}>
                    {lang === "fr" ? "Qualité Garantie" : "جودة مضمونة"}
                  </span>
                </div>

                {/* Pillar 2: Fast Delivery */}
                <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 sm:border-r border-brand-green/20 last:border-r-0 ${isRTL ? "sm:border-r-0 sm:border-l" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black ${isRTL ? "font-arabic" : "font-sans uppercase"}`}>
                    {lang === "fr" ? "Livraison Rapide" : "توصيل سريع"}
                  </span>
                </div>

                {/* Pillar 3: Secure Pack */}
                <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 sm:border-r border-brand-green/20 last:border-r-0 ${isRTL ? "sm:border-r-0 sm:border-l" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black ${isRTL ? "font-arabic" : "font-sans uppercase"}`}>
                    {lang === "fr" ? "Emballage Sûr" : "تغليف آمن"}
                  </span>
                </div>

                {/* Pillar 4: Support */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                    <Headphones className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black ${isRTL ? "font-arabic" : "font-sans uppercase"}`}>
                    {lang === "fr" ? "Service Client" : "خدمة عملاء"}
                  </span>
                </div>
              </div>
            </div>

            {/* Extra reassurance text */}
            <p className={`text-xs text-gray-400 dark:text-zinc-500 font-semibold max-w-2xl ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
              {isRTL 
                ? "جميع منتجاتنا مستوردة وتخضع لرقابة جودة صارمة لضمان حصولكم على الأفضل دائمًا. ثقتكم هي رأسمالنا."
                : "Tous nos articles sont importés et subissent un contrôle de qualité strict. Votre confiance est notre plus grande réussite."
              }
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
