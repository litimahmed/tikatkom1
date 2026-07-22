import { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, ShoppingBag } from "lucide-react";
import { translations } from "../data";

interface HeaderProps {
  lang: "fr" | "ar";
  setLang: (lang: "fr" | "ar") => void;
  onOpenShippingModal: () => void;
  onLogoClick: () => void;
  isAlgerian: boolean;
  onOpenCart?: () => void;
  cartCount?: number;
}

export default function Header({
  lang,
  onOpenShippingModal,
  onLogoClick,
  isAlgerian,
  onOpenCart,
  cartCount = 0,
}: HeaderProps) {
  const t = translations[lang];
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // 1. Track scroll state
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // 2. Listen to scroll events to toggle the state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  return (
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
          {/* Left Side: Logo */}
          <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                  e.preventDefault();
                  onLogoClick();
                }}
                className="flex items-center focus:outline-none cursor-pointer"
            >
              {/* 3. Updated Brand Logo Image with dynamic clip-path and transition */}
              <img
                  src="/src/assets/images/tikatkom.png"
                  alt="Tikatkom Logo"
                  className={`relative top-[18px] h-15 w-auto object-contain rounded-lg transition-all duration-300 ${
                      isScrolled ? "[clip-path:inset(0_0_52%_0)]" : "[clip-path:inset(0_0_0_0)]"
                  }`}
                  referrerPolicy="no-referrer"
              />
            </button>
          </div>

          {/* Right Side: Flex Container for ZR Express Courier Logo, Cart & Lang Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* ZR Express Courier Logo Placeholder - only for Algeria COD mode */}
            {isAlgerian && (
              <div className="flex items-center select-none shrink-0">
                <img
                    src="/src/assets/images/zrexpressLogo.jpg"
                    alt="ZR Express"
                    className="h-8 w-auto object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Hide the broken image icon gracefully if the file is not yet uploaded
                      e.currentTarget.style.display = "none";
                    }}
                />
              </div>
            )}

            {/* Cart Button & Language Switcher Group */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              {onOpenCart && (
                <button
                  onClick={onOpenCart}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                  title={lang === "fr" ? "Mon Panier" : "حقيبة التسوق"}
                  id="header-cart-btn"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-900 animate-scaleIn">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Language Switcher Dropdown */}
              <div className="relative inline-block" ref={langDropdownRef}>
              <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
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
                      className="absolute right-0 left-0 mt-1 rounded border border-gray-300 bg-white py-1 shadow-md focus:outline-none z-50 w-full"
                      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
                  >
                    {lang === "fr" ? (
                        <button
                            onClick={() => {
                              localStorage.setItem("lang", "ar");
                              window.location.reload();
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer font-arabic hover:bg-gray-100 text-gray-700 text-right justify-start"
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
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer font-sans hover:bg-gray-100 text-gray-700 text-left justify-start"
                        >
                          <span className="text-sm shrink-0 leading-none">🇫🇷</span>
                          <span className="truncate">Français</span>
                        </button>
                    )}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}