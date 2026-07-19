import { translations } from "../data";

interface HeaderProps {
  lang: "fr" | "ar";
  setLang: (lang: "fr" | "ar") => void;
  onOpenShippingModal: () => void;
  onLogoClick: () => void;
}

export default function Header({ lang, setLang, onOpenShippingModal, onLogoClick }: HeaderProps) {
  const t = translations[lang];

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

        {/* Right Side: Flex Container for Shipping Pill & Lang Switcher */}
        <div className="flex items-center gap-3">
          {/* Shipping Pill: hyper-minimalist modern pill */}
          <button
            onClick={onOpenShippingModal}
            className="group flex items-center gap-1.5 rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-semibold text-brand-navy transition-all duration-200 hover:bg-brand-navy/10 active:scale-95 sm:px-3.5 sm:py-2"
            id="shipping-pill-btn"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green"></span>
            </span>
            <span className="font-mono tracking-tight group-hover:text-brand-green transition-colors">
              {t.shippingPill}
            </span>
          </button>

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
