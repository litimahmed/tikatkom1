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
    <section className="bg-brand-navy border-y border-gray-950 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {trustItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 px-6 py-2 justify-start sm:justify-center ${
                // Vertical borders separating items on desktop screens (except the last item)
                isRTL
                  ? "lg:border-l lg:border-brand-navy-light last:border-l-0"
                  : "lg:border-r lg:border-brand-navy-light last:border-r-0"
              }`}
              id={`trust-item-${index}`}
            >
              {/* Green Icon Container */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                {item.icon}
              </div>
              
              {/* Stacked Bilingual Text */}
              <div className="flex flex-col text-left">
                <span className="font-arabic text-sm font-extrabold text-white tracking-wide leading-tight sm:text-base">
                  {item.arLabel}
                </span>
                <span className="font-sans text-xs font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
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
