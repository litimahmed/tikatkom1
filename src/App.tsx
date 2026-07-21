import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandBanner from "./components/BrandBanner";
import CategoriesGrid from "./components/CategoriesGrid";
import HomeSections from "./components/HomeSections";
import ProductsGrid from "./components/ProductsGrid";
import Footer from "./components/Footer";
import ShippingModal from "./components/ShippingModal";
import CheckoutModal from "./components/CheckoutModal";
import TrackingModal from "./components/TrackingModal";
import FloatingContact from "./components/FloatingContact";
import { Product, Category } from "./types";
import { products as staticProducts, categories as staticCategories } from "./data";
import { ChevronRight, ChevronLeft, Globe } from "lucide-react";
import { getWooCategories, getWooProducts, detectWordPressBaseUrl } from "./lib/woocommerce";
import { getUserCountryCode } from "./lib/geo";

// Clean navigation helpers for traditional page reloads (hard loading)
export function getStorePageUrl(categoryId?: string | null): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  // If in AI Studio Preview or standalone port 3000 local dev, keep same page but append params
  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    const target = new URL(window.location.pathname, window.location.origin);
    target.searchParams.set("view", "products");
    if (categoryId) {
      target.searchParams.set("category", categoryId);
    }
    return target.toString();
  }

  // In production WordPress site, hard load to /shop/ page with any selected category filter
  const cleanBase = baseUrl.replace(/\/$/, "");
  let url = `${cleanBase}/shop/`;
  if (categoryId) {
    url += `?category=${encodeURIComponent(categoryId)}`;
  }
  return url;
}

export function getHomePageUrl(): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  // In preview/dev container, go to current page path without params
  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    return new URL(window.location.pathname, window.location.origin).toString();
  }

  return baseUrl;
}

export default function App() {
  // Primary Localization State: read from localStorage for persistent traditional hard reload behavior
  const [lang, setLang] = useState<"fr" | "ar">(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "ar" || saved === "fr") ? saved : "fr";
  });

  // Geolocation & Mode state: DZ (Algeria COD Mode) or International (Traditional Checkout/Cart)
  const [isAlgerian, setIsAlgerian] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "intl") {
      localStorage.setItem("tikatkom_force_mode", "intl");
      return false;
    } else if (modeParam === "dz") {
      localStorage.setItem("tikatkom_force_mode", "dz");
      return true;
    }

    const savedMode = localStorage.getItem("tikatkom_force_mode");
    if (savedMode === "intl") return false;
    if (savedMode === "dz") return true;

    // Default to true (Algeria) while loading to avoid flash
    return true;
  });

  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [redirectProduct, setRedirectProduct] = useState<Product | null>(null);
  
  // Ensure dark mode is completely removed from document element and localStorage
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  // Detect Country on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("tikatkom_force_mode");
    const params = new URLSearchParams(window.location.search);
    if (savedMode || params.get("mode")) {
      setDetectedCountry(savedMode === "intl" ? "International Mode" : "Algeria Mode");
      return;
    }

    async function detectGeo() {
      try {
        const country = await getUserCountryCode();
        setDetectedCountry(country);
        if (country !== "DZ") {
          setIsAlgerian(false);
        } else {
          setIsAlgerian(true);
        }
      } catch (err) {
        console.error("Failed to detect user country, keeping default (Algeria).", err);
      }
    }
    detectGeo();
  }, []);

  // Toggle mode manually for store owners to preview both
  const handleToggleMode = () => {
    const nextMode = isAlgerian ? "intl" : "dz";
    localStorage.setItem("tikatkom_force_mode", nextMode);
    setIsAlgerian(!isAlgerian);
    // Reload page to apply clean filters
    window.location.reload();
  };

  // Page Routing State: "home" or "products"
  const [view, setView] = useState<"home" | "products">(() => {
    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (
      currentPath.includes("/shop") || 
      currentPath.includes("/catalog") || 
      params.get("view") === "products" ||
      params.get("category") !== null
    ) {
      return "products";
    }
    return "home";
  });

  // Dynamic Catalog States: initialized empty to prevent flashing of hardcoded data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals Visibility State
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
  });

  // Fetch from live WooCommerce backend on mount
  useEffect(() => {
    async function loadWooCommerceData() {
      setIsLoading(true);
      try {
        const [wooCats, wooProds] = await Promise.all([
          getWooCategories(),
          getWooProducts()
        ]);
        
        if (wooCats && wooCats.length > 0) {
          setCategories(wooCats);
        } else {
          setCategories(staticCategories);
        }

        if (wooProds && wooProds.length > 0) {
          setProducts(wooProds);
        } else {
          setProducts(staticProducts);
        }
      } catch (error) {
        console.warn("Could not load live WooCommerce data, keeping local high-fidelity mock data.", error);
        setCategories(staticCategories);
        setProducts(staticProducts);
      } finally {
        setIsLoading(false);
      }
    }
    loadWooCommerceData();
  }, []);

  // Set HTML dir and lang attributes on state changes for perfect RTL/LTR layout behavior
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Handler to open order form for a selected product
  const handleOpenCheckout = (product: Product) => {
    if (!isAlgerian) {
      // International Mode: Redirect directly to the WooCommerce checkout page
      const baseUrl = detectWordPressBaseUrl();
      const redirectUrl = `${baseUrl}/checkout/?add-to-cart=${product.id}&quantity=1`;
      console.log(`[Geo Router] Redirecting international visitor to WooCommerce: ${redirectUrl}`);
      
      setRedirectProduct(product);
      setIsRedirecting(true);
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500); // 1.5s professional delay with high-end overlay transition
      return;
    }

    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Handler when clicking categories - sets view to products page and selects category filter
  const handleCategoryClick = (categoryId: string) => {
    window.location.href = getStorePageUrl(categoryId);
  };

  // Handler for homepage section view all - goes to products page with category selected
  const handleViewAllClick = (categoryId: string | null) => {
    window.location.href = getStorePageUrl(categoryId);
  };

  // Handler for hero exploratory CTA - goes to products page
  const handleExploreClick = () => {
    window.location.href = getStorePageUrl(null);
  };

  // Handler for hero direct buyout CTA - opens checkout for flagship product
  const handleBuyFlagshipClick = () => {
    if (products.length > 0) {
      const flagshipProduct = products.find(p => 
        p.tags?.some(t => (t.slug || "").toLowerCase().includes("hero") || (t.name || "").toLowerCase().includes("hero"))
      ) || products[0];
      handleOpenCheckout(flagshipProduct);
    }
  };

  // Handle Logo click - goes back home and resets filters
  const handleLogoClick = () => {
    window.location.href = getHomePageUrl();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-brand-green/20 selection:text-brand-green">
      
      {/* 1. Sticky Header */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        onOpenShippingModal={() => setIsShippingOpen(true)} 
        onLogoClick={handleLogoClick}
      />

      <main>
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/10 border-t-emerald-500"></div>
              <div className="absolute font-black text-emerald-600 text-xs uppercase tracking-widest font-sans animate-pulse">
                T
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-4 animate-pulse">
              {lang === "ar" ? "جاري تحميل المتجر..." : "Chargement de la boutique..."}
            </p>
          </div>
        ) : view === "home" ? (
          <>
            {/* 2. Hero Section */}
            <Hero 
              lang={lang} 
              onExploreClick={handleExploreClick}
              onBuyFlagshipClick={handleBuyFlagshipClick}
              products={products}
            />

            {/* 3. Brand & Trust Signature Banner */}
            <BrandBanner lang={lang} />

            {/* 4. Categories Section */}
            <CategoriesGrid 
              lang={lang} 
              onCategoryClick={handleCategoryClick} 
              categories={categories}
            />

            {/* 5. Four Custom Product Line Sections */}
            <HomeSections 
              lang={lang}
              onBuyClick={handleOpenCheckout}
              onViewAllClick={handleViewAllClick}
              products={products}
              categories={categories}
            />
          </>
        ) : (
          <>
            {/* Elegant Breadcrumbs & Navigation Bar for Dedicated Shop Page */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-[#2a2a2a] py-4">
              <div 
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between"
                style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <button 
                    onClick={handleLogoClick}
                    className="hover:text-brand-green transition-colors cursor-pointer dark:text-zinc-400 dark:hover:text-brand-green"
                  >
                    {lang === "ar" ? "الرئيسية" : "Accueil"}
                  </button>
                  <span className="text-gray-300">/</span>
                  <span className="text-brand-navy dark:text-white font-bold font-arabic">
                    {lang === "ar" ? "متجر تيكاتكوم" : "Boutique TIKATKOM"}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Filterable Products Grid (Dedicated Shop View) */}
            <ProductsGrid 
              lang={lang} 
              onBuyClick={handleOpenCheckout}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              products={products}
              categories={categories}
            />
          </>
        )}
      </main>

      {/* 7. Simple Footer */}
      <Footer lang={lang} />

      {/* Interactive Shipping Information Modal */}
      <ShippingModal 
        isOpen={isShippingOpen} 
        onClose={() => setIsShippingOpen(false)} 
        lang={lang} 
      />

      {/* High-conversion Cash-On-Delivery Order Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={checkoutProduct} 
        lang={lang} 
      />

      {/* Floating Modern Contact Elements (WhatsApp & Email) */}
      <FloatingContact lang={lang} onTrackingClick={() => setIsTrackingOpen(true)} />

      {/* Realtime Express Parcel Tracking Status Modal */}
      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        lang={lang} 
      />

      {/* Premium Redirecting Overlay for International Customers */}
      {isRedirecting && redirectProduct && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
          <div className="max-w-md p-6 text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/10">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-green/10 border-t-brand-green"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-6 w-6 text-brand-green animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-2">
              {lang === "fr" ? "Redirection Sécurisée..." : "جاري توجيهك بأمان..."}
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              {lang === "fr" 
                ? `Nous vous redirigeons vers notre passerelle de paiement internationale pour finaliser l'achat de : ${redirectProduct.titleFR}`
                : `نقوم بتوجيهك الآن إلى بوابة الدفع الدولية الآمنة لإتمام شراء: ${redirectProduct.titleAR}`
              }
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-zinc-900 px-3 py-1 text-xs text-gray-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
              <span>Visa, MasterCard, PayPal, Amex</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
