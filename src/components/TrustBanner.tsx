import { Headphones, Package, Truck, ShieldCheck } from "lucide-react";

interface TrustBannerProps {
  lang: "fr" | "ar";
}

export default function TrustBanner({ lang }: TrustBannerProps) {
  const isRTL = lang === "ar";

  const trustItems = [
    {
      icon: <Headphones className="h-6 w-6 text-brand-green" />,
      arLabel: "خدمة عملاء",
      frLabel: "Service Client 7j/7",
    },
    {
      icon: <Package className="h-6 w-6 text-brand-green" />,
      arLabel: "تغليف آمن ومحمي",
      frLabel: "Emballage Sécurisé",
    },
    {
      icon: <Truck className="h-6 w-6 text-brand-green" />,
      arLabel: "توصيل سريع 58 ولاية",
      frLabel: "Livraison Rapide",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-brand-green" />,
      arLabel: "ضمان الجودة والاستبدال",
      frLabel: "Qualité Garantie",
    },
  ];

  return (
    <section className="bg-brand-navy border-y border-gray-950 py-5 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-y-0"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {trustItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2.5 sm:gap-4 px-2.5 py-2.5 sm:px-6 sm:py-2 justify-start sm:justify-center rounded-xl bg-white/5 sm:bg-transparent border border-white/5 sm:border-0 ${
                // Vertical borders separating items on desktop screens (except the last item)
                isRTL
                  ? "lg:border-l lg:border-brand-navy-light last:border-l-0"
                  : "lg:border-r lg:border-brand-navy-light last:border-r-0"
              }`}
              id={`trust-item-${index}`}
            >
              {/* Green Icon Container */}
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green">
                {item.icon}
              </div>
              
              {/* Stacked Bilingual Text */}
              <div className="flex flex-col text-left min-w-0">
                <span className="font-arabic text-xs sm:text-base font-extrabold text-white tracking-wide leading-tight truncate">
                  {item.arLabel}
                </span>
                <span className="font-sans text-[9px] sm:text-xs font-semibold text-gray-400 tracking-wider uppercase mt-0.5 truncate">
                  {item.frLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
