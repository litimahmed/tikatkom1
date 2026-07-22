import { useState, useRef, useEffect } from "react";
import { ChevronDown, ShoppingBag, Menu, X } from "lucide-react";
import { translations } from "../data";

interface HeaderProps {
  lang: "fr" | "ar";
  setLang?: (lang: "fr" | "ar") => void;
  onOpenShippingModal: () => void;
  onLogoClick: () => void;
  isAlgerian: boolean;
  onOpenCart?: () => void;
  cartCount?: number;
  onOpenTracking?: () => void;
}

export default function Header({
  lang,
  onOpenShippingModal,
  onLogoClick,
  isAlgerian,
  onOpenCart,
  cartCount = 0,
  onOpenTracking,
}: HeaderProps) {
  const t = translations[lang];
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isRTL = lang === "ar";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-xs">
      <div 
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" 
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onLogoClick();
            }}
            className="flex items-center focus:outline-none cursor-pointer shrink-0"
            id="header-logo-btn"
          >
            <img
              src="/src/assets/images/tikatkom.png"
              alt="Tikatkom Logo"
              className="h-9 lg:h-12 w-auto object-contain transition-transform hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

        {/* Right Side: ZR Express Courier Logo (desktop only), Cart & Lang Switcher & Mobile Hamburger */}
        <div className="flex items-center gap-2.5 lg:gap-3">
          {/* ZR Express Courier Logo Placeholder - ONLY visible on desktop screens (hidden on mobile & tablet) */}
          {isAlgerian && (
            <div className="hidden lg:flex items-center select-none shrink-0">
              <img
                src="/src/assets/images/zrexpressLogo.jpg"
                alt="ZR Express"
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Cart Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
              title={lang === "fr" ? "Mon Panier" : "حقيبة التسوق"}
              id="header-cart-btn"
            >
              <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-900 animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile & Tablet Modern Left-to-Right Language Switcher Toggle */}
          <button
            type="button"
            dir="ltr"
            onClick={() => {
              const newLang = lang === "fr" ? "ar" : "fr";
              localStorage.setItem("lang", newLang);
              window.location.reload();
            }}
            className="lg:hidden relative inline-flex h-9 w-[68px] items-center justify-between rounded-full bg-white dark:bg-zinc-900 p-1 border border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer select-none shrink-0 shadow-2xs"
            title={lang === "fr" ? "Changer la langue (العربية)" : "تغيير اللغة (Français)"}
            id="mobile-lang-toggle-btn"
          >
            {/* Sliding Active Indicator */}
            <span
              className={`absolute top-[3px] left-[3px] h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-brand-green/30 transition-transform duration-300 ease-in-out z-0 ${
                lang === "ar" ? "translate-x-[32px]" : "translate-x-0"
              }`}
            />

            {/* Left Circular French Flag Fill */}
            <div
              className={`z-10 h-7 w-7 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${
                lang === "fr" ? "opacity-100 scale-100" : "opacity-35 scale-90"
              }`}
            >
              <svg viewBox="0 0 30 30" className="w-full h-full object-cover">
                <rect x="0" y="0" width="10" height="30" fill="#002395" />
                <rect x="10" y="0" width="10" height="30" fill="#FFFFFF" />
                <rect x="20" y="0" width="10" height="30" fill="#ED2939" />
              </svg>
            </div>

            {/* Right Circular Saudi Flag Fill */}
            <div
              className={`z-10 h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-[#006C35] transition-all duration-300 ${
                lang === "ar" ? "opacity-100 scale-100" : "opacity-35 scale-90"
              }`}
            >
              <span className="text-xs text-white font-bold select-none leading-none">🇸🇦</span>
            </div>
          </button>

          {/* Desktop Language Switcher Dropdown (lg screens only) */}
          <div className="relative hidden lg:inline-block" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-200 shadow-xs hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              id="lang-dropdown-btn"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0 leading-none" role="img" aria-label="flag">
                  {lang === "fr" ? "🇫🇷" : "🇸🇦"}
                </span>
                <span className={`${lang === "ar" ? "font-arabic" : "font-sans"} truncate`}>
                  {lang === "fr" ? "Français" : "العربية"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </button>

            {isLangDropdownOpen && (
              <div
                className="absolute right-0 left-0 mt-1 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1 shadow-md focus:outline-none z-50 w-full"
                style={{ direction: isRTL ? "rtl" : "ltr" }}
              >
                {lang === "fr" ? (
                  <button
                    onClick={() => {
                      localStorage.setItem("lang", "ar");
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer font-arabic hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-right justify-start"
                    style={{ direction: "rtl" }}
                  >
                    <span className="text-sm shrink-0 leading-none">🇸🇦</span>
                    <span className="truncate">العربية</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      localStorage.setItem("lang", "fr");
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer font-sans hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-left justify-start"
                  >
                    <span className="text-sm shrink-0 leading-none">🇫🇷</span>
                    <span className="truncate">Français</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 lg:hidden transition-colors cursor-pointer shrink-0"
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Slide-down Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 lg:hidden animate-fadeIn space-y-1"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {/* Main Navigation Links */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogoClick();
            }}
            className="w-full text-start py-2.5 px-3 text-sm font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {lang === "fr" ? "Page Officielle" : "الصفحة الرسمية"}
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogoClick();
            }}
            className="w-full text-start py-2.5 px-3 text-sm font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {lang === "fr" ? "Boutique" : "المتجر"}
          </button>
        </div>
      )}
    </header>
  );
}