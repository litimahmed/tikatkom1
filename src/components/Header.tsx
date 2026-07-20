import { useState, useRef, useEffect } from "react";
import { Truck, ChevronDown, CheckCircle2, Shield } from "lucide-react";
import { translations } from "../data";

interface HeaderProps {
  lang: "fr" | "ar";
  setLang: (lang: "fr" | "ar") => void;
  onOpenShippingModal: () => void;
  onLogoClick: () => void;
}

export default function Header({ lang, setLang, onOpenShippingModal, onLogoClick }: HeaderProps) {
  const t = translations[lang];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const couriers = [
    { name: "Yalidine Express", nameAr: "ياليدين إكسبريس", status: "Actif / نشط" },
    { name: "ZR Express", nameAr: "زد آر إكسبريس", status: "Actif / نشط" },
    { name: "Maystro Delivery", nameAr: "مايسترو دليفري", status: "Actif / نشط" },
    { name: "NOEST Delivery", nameAr: "نويست دليفري", status: "Actif / نشط" },
    { name: "Ecotrack", nameAr: "إيكوتراك", status: "Actif / نشط" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              onLogoClick();
            }}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            {/* Elegant Minimalist Logo Mark */}
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green font-display text-lg font-bold text-white shadow-sm shadow-brand-green/30">
              T
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-brand-navy">
              TIKAT<span className="text-brand-green">KOM</span>
            </span>
          </button>
        </div>

        {/* Right Side: Flex Container for Shipping Pill Dropdown & Lang Switcher */}
        <div className="flex items-center gap-3">
          {/* Custom Courier Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center gap-1.5 rounded-full bg-brand-navy/5 px-3.5 py-2 text-xs font-bold text-brand-navy transition-all duration-200 hover:bg-brand-navy/10 active:scale-95"
              id="shipping-pill-btn"
            >
              <Truck className="h-3.5 w-3.5 text-brand-green" />
              <span className="font-sans tracking-tight">
                {lang === "fr" ? "Courriers" : "شركات التوصيل"}
              </span>
              <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className={`absolute ${lang === "ar" ? "left-0" : "right-0"} mt-2 w-64 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none`}
                style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
              >
                <div className="px-3 py-2 border-b border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    {lang === "fr" ? "Partenaires Officiels" : "شركاء التوصيل الرسميون"}
                  </p>
                  <p className="text-[11px] font-bold text-brand-navy mt-0.5">
                    {lang === "fr" ? "Livraison sécurisée 58 Wilayas" : "شحن موثوق لكافة الولايات الـ 58"}
                  </p>
                </div>
                
                <div className="py-1 space-y-0.5 max-h-[220px] overflow-y-auto">
                  {couriers.map((courier, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenShippingModal();
                      }}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-green shrink-0" />
                        <span className="font-bold text-gray-700 font-sans">
                          {lang === "fr" ? courier.name : courier.nameAr}
                        </span>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-50 text-brand-green px-1.5 py-0.5 rounded-md">
                        {lang === "fr" ? "Garanti" : "مضمون"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-1 border-t border-gray-50">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenShippingModal();
                    }}
                    className="w-full text-center rounded-xl bg-brand-navy py-2 text-[10px] font-black text-white hover:bg-brand-green transition-colors"
                  >
                    {lang === "fr" ? "Voir Tarifs & Détails" : "عرض الأسعار والتفاصيل"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95 sm:px-3.5 sm:py-2"
            id="lang-switcher-btn"
          >
            <span className={lang === "ar" ? "font-sans" : "font-arabic"}>
              {t.langToggle}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
