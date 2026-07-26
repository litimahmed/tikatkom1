import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandBanner from "./components/BrandBanner";
import CategoriesGrid from "./components/CategoriesGrid";
import HomeSections from "./components/HomeSections";
import ProductsGrid from "./components/ProductsGrid";
import Footer from "./components/Footer";
import ShippingModal from "./components/ShippingModal";
import CheckoutPage from "./components/CheckoutPage";
import FloatingContact from "./components/FloatingContact";
import { Product, Category } from "./types";
import { products as staticProducts, categories as staticCategories } from "./data";
import { getWooCategories, getWooProducts, detectWordPressBaseUrl, isDigitalCategory, isDigitalProduct } from "./lib/woocommerce";
import TrackingPage from "./components/TrackingPage";
import DigitalProduct from "@/src/components/DigitalProduct.tsx";
import DigitalProductsGrid from "./components/DigitalProductsGrid";
import { digitalProducts as staticDigitalProducts, digitalCategories as staticDigitalCategories } from "./data";

// Clean navigation helpers for traditional page reloads (hard loading)
export function getDigitalStorePageUrl(categoryId?: string | null): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    const target = new URL(window.location.pathname, window.location.origin);
    target.searchParams.set("view", "digital-store");
    if (categoryId) {
      target.searchParams.set("category", categoryId);
    }
    return target.toString();
  }

  const cleanBase = baseUrl.replace(/\/$/, "");
  let url = `${cleanBase}/tikatkom/digital-shop/`;
  if (categoryId) {
    url += `?category=${encodeURIComponent(categoryId)}`;
  }
  return url;
}

export function getStorePageUrl(categoryId?: string | null): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  // In dev/preview, use query params
  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    const target = new URL(window.location.pathname, window.location.origin);
    target.searchParams.set("view", "products");
    if (categoryId) {
      target.searchParams.set("category", categoryId);
    }
    return target.toString();
  }

  // In production WordPress, use clean URL structure
  const cleanBase = baseUrl.replace(/\/$/, "");
  let url = `${cleanBase}/tikatkom/shop/`;
  if (categoryId) {
    url += `?category=${encodeURIComponent(categoryId)}`;
  }
  return url;
}

export function getHomePageUrl(): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    return new URL(window.location.pathname, window.location.origin).toString();
  }

  return `${baseUrl}/tikatkom/`;
}

// Add helper function for tracking URL
export function getTrackingPageUrl(trackingNumber?: string): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    const target = new URL(currentUrl.pathname, currentUrl.origin);
    target.searchParams.set("view", "track");
    if (trackingNumber) {
      target.searchParams.set("tracking", trackingNumber);
    }
    return target.toString();
  }

  const cleanBase = baseUrl.replace(/\/$/, "");
  let url = `${cleanBase}/tikatkom/track/`;
  if (trackingNumber) {
    url += trackingNumber;
  }
  return url;
}

export function getCheckoutPageUrl(productId?: string): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  // In dev/preview, use query params
  if (currentUrl.hostname.includes("run.app") || currentUrl.port === "3000" || currentUrl.hostname === "localhost") {
    const target = new URL(currentUrl.pathname, currentUrl.origin);
    target.searchParams.set("view", "checkout");
    if (productId) {
      target.searchParams.set("product", String(productId));
    }
    return target.toString();
  }

  // In production, use clean URL structure
  const cleanBase = baseUrl.replace(/\/$/, "");
  let url = `${cleanBase}/tikatkom/checkout/`;
  if (productId) {
    url += `?product=${encodeURIComponent(productId)}`;
  }
  return url;
}

export default function App() {
  // Primary Localization State: read from localStorage for persistent traditional hard reload behavior
  const [lang, setLang] = useState<"fr" | "ar">(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "ar" || saved === "fr") ? saved : "fr";
  });

  // Ensure dark mode is completely removed from document element and localStorage
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  // Page Routing State: "home" | "products" | "digital-store" | "checkout" | "tracking"
  const [view, setView] = useState<"home" | "products" | "digital-store" | "checkout" | "tracking">((): "home" | "products" | "digital-store" | "checkout" | "tracking" => {
    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (currentPath.includes("/checkout") || currentPath.includes("/tikatkom/checkout") || params.get("view") === "checkout") {
      return "checkout";
    }
    if (currentPath.includes("/track") || params.get("view") === "track") {
      return "tracking";
    }
    if (
      currentPath.includes("/digital-shop") ||
      currentPath.includes("/tikatkom/digital-shop") ||
      params.get("view") === "digital-store" ||
      params.get("view") === "digital-products"
    ) {
      return "digital-store";
    }
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
  const [digitalCategories, setDigitalCategories] = useState<Category[]>(staticDigitalCategories);
  const [digitalProducts, setDigitalProducts] = useState<Product[]>(staticDigitalProducts);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Navigation State
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [initialTrackingNumber, setInitialTrackingNumber] = useState<string>("");

  // ✅ Extract tracking number from URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Extract tracking number from URL path or query param
    if (currentPath.includes("/track")) {
      const parts = currentPath.split("/track/");
      if (parts.length > 1 && parts[1]) {
        setInitialTrackingNumber(parts[1]);
      }
    } else if (params.get("tracking")) {
      setInitialTrackingNumber(params.get("tracking") || "");
    }
  }, []);

  // Select checkout product from query parameters when products load
  useEffect(() => {
    const allProds = [...products, ...digitalProducts];
    if (allProds.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("product") || params.get("id");
      if (productId) {
        const found = allProds.find((p) => String(p.id) === String(productId));
        if (found) {
          setCheckoutProduct(found);
          return;
        }
      }
      if (!checkoutProduct) {
        setCheckoutProduct(allProds[0]);
      }
    }
  }, [products, digitalProducts]);

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
  });

  // Active Digital Category Filter
  const [selectedDigitalCategory, setSelectedDigitalCategory] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
  });

  // Fetch from live WooCommerce backend on mount
  useEffect(() => {
    async function loadWooCommerceData() {
      setIsLoading(true);
      try {
        const wpBaseUrl = detectWordPressBaseUrl();
        const [wooCats, wooProds] = await Promise.all([
          getWooCategories(),
          getWooProducts()
        ]);

        if (wpBaseUrl) {
          // When WordPress is connected, strictly use live WooCommerce data (no forced static fallbacks if empty)
          const liveCats = wooCats || [];
          const liveProds = wooProds || [];

          const normCats = liveCats.filter(c => !isDigitalCategory(c));
          const digiCats = liveCats.filter(c => isDigitalCategory(c));
          setCategories(normCats);
          setDigitalCategories(digiCats);

          const digiCatSlugs = digiCats.map(c => c.id);
          const normProds = liveProds.filter(p => !isDigitalProduct(p, digiCatSlugs));
          const digiProds = liveProds.filter(p => isDigitalProduct(p, digiCatSlugs));
          setProducts(normProds);
          setDigitalProducts(digiProds);
        } else {
          // Demo mode: fallback to static sample data if no WP backend URL
          if (wooCats && wooCats.length > 0) {
            setCategories(wooCats.filter(c => !isDigitalCategory(c)));
            setDigitalCategories(wooCats.filter(c => isDigitalCategory(c)));
          } else {
            setCategories(staticCategories);
            setDigitalCategories(staticDigitalCategories);
          }

          if (wooProds && wooProds.length > 0) {
            const digiCatSlugs = wooCats ? wooCats.filter(c => isDigitalCategory(c)).map(c => c.id) : [];
            setProducts(wooProds.filter(p => !isDigitalProduct(p, digiCatSlugs)));
            setDigitalProducts(wooProds.filter(p => isDigitalProduct(p, digiCatSlugs)));
          } else {
            setProducts(staticProducts);
            setDigitalProducts(staticDigitalProducts);
          }
        }
      } catch (error) {
        console.warn("Could not load live WooCommerce data, using static mock data as fallback.", error);
        setCategories(staticCategories);
        setDigitalCategories(staticDigitalCategories);
        setProducts(staticProducts);
        setDigitalProducts(staticDigitalProducts);
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

  // Handler to open order page for a selected product via hard reload navigation
  const handleOpenCheckout = (product: Product) => {
    window.location.href = getCheckoutPageUrl(product.id);
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
          ) : view === "tracking" ? (
              <TrackingPage
                  lang={lang}
                  onBackToHome={handleLogoClick}
                  initialTrackingNumber={initialTrackingNumber}
              />
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
                <DigitalProduct
                    lang={lang}
                    onCategoryClick={(catId) => {
                      window.location.href = getDigitalStorePageUrl(catId);
                    }}
                    onViewAllClick={() => {
                      window.location.href = getDigitalStorePageUrl(null);
                    }}
                    categories={digitalCategories}
                />
              </>
          ) : view === "digital-store" ? (
              <>
                {/* Elegant Breadcrumbs & Navigation Bar for Dedicated Digital Shop Page */}
                <div className="mt-4 sm:mt-6 bg-gray-50 dark:bg-[#1a1a1a] border-y border-gray-100 dark:border-[#2a2a2a] py-4">
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
                        {lang === "ar" ? "متجر المنتجات الرقمية" : "Boutique Produits Numériques"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Standalone Digital Products Grid View */}
                <DigitalProductsGrid
                    lang={lang}
                    onBuyClick={handleOpenCheckout}
                    selectedCategory={selectedDigitalCategory}
                    setSelectedCategory={setSelectedDigitalCategory}
                    products={digitalProducts}
                    categories={digitalCategories}
                />
              </>
          ) : view === "checkout" ? (
              <CheckoutPage
                  product={checkoutProduct}
                  lang={lang}
                  onBackToStore={() => {
                    window.location.href = getStorePageUrl();
                  }}
              />
          ) : (
              <>
                {/* Elegant Breadcrumbs & Navigation Bar for Dedicated Shop Page */}
                <div className="mt-4 sm:mt-6 bg-gray-50 dark:bg-[#1a1a1a] border-y border-gray-100 dark:border-[#2a2a2a] py-4">
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

        {/* Floating Modern Contact Elements (WhatsApp & Email) */}
        <FloatingContact lang={lang} />

      </div>
  );
}