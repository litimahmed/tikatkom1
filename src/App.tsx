import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BrandBanner from "./components/BrandBanner";
import CategoriesGrid from "./components/CategoriesGrid";
import HomeSections from "./components/HomeSections";
import ProductsGrid from "./components/ProductsGrid";
import ProductPage from "./components/ProductPage";
import Footer from "./components/Footer";
import ShippingModal from "./components/ShippingModal";
import CheckoutModal from "./components/CheckoutModal";
import TrackingModal from "./components/TrackingModal";
import FloatingContact from "./components/FloatingContact";
import { Product, Category, CartItem } from "./types";
import { products as staticProducts, categories as staticCategories } from "./data";
import { ChevronRight, ChevronLeft, Globe } from "lucide-react";
import { getWooCategories, getWooProducts, detectWordPressBaseUrl, isUncategorizedCategory } from "./lib/woocommerce";
import { getUserCountryCode } from "./lib/geo";
import CartDrawer from "./components/CartDrawer";

// Clean navigation helpers for traditional page reloads (hard loading)
export function getStorePageUrl(categoryId?: string | null): string {
  const baseUrl = detectWordPressBaseUrl();
  const currentUrl = new URL(window.location.href);

  // If in AI Studio Preview or standalone port 3000 local dev, keep same page but append params
  const isDevPreview =
    currentUrl.port === "3000" ||
    currentUrl.hostname.includes("run.app") ||
    currentUrl.hostname.includes("ais-dev") ||
    currentUrl.hostname.includes("ais-pre");

  if (isDevPreview) {
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

  const isDevPreview =
    currentUrl.port === "3000" ||
    currentUrl.hostname.includes("run.app") ||
    currentUrl.hostname.includes("ais-dev") ||
    currentUrl.hostname.includes("ais-pre");

  if (isDevPreview) {
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
    // Clear any stale local storage locks from previous runs
    try {
      localStorage.removeItem("tikatkom_force_mode");
      localStorage.removeItem("tikatkom_user_country");
      localStorage.removeItem("tikatkom_user_country_timestamp");
    } catch {
      // ignore
    }

    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "intl") return false;
    if (modeParam === "dz") return true;

    // Default to true (Algeria) while live IP check finishes to avoid layout flash
    return true;
  });

  const [detectedCountry, setDetectedCountry] = useState<string>("");
  
  // Headless Cart States for International users
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("tikatkom_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Synchronize cart state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem("tikatkom_cart", JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Ensure dark mode is completely removed from document element and localStorage
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  // Detect Country on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");

    if (modeParam === "intl") {
      setIsAlgerian(false);
      setDetectedCountry("International Mode (?mode=intl)");
      return;
    } else if (modeParam === "dz") {
      setIsAlgerian(true);
      setDetectedCountry("Algeria Mode (?mode=dz)");
      return;
    }

    async function detectGeo() {
      try {
        const country = await getUserCountryCode();
        setDetectedCountry(country);
        setIsAlgerian(country === "DZ");
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

  // Page Routing State: "home" | "products" | "product"
  const [view, setView] = useState<"home" | "products" | "product">((): "home" | "products" | "product" => {
    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (params.get("product") || params.get("id")) {
      return "product";
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

  // Selected Product State for dedicated product page view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamic Catalog States: initialized empty to prevent flashing of hardcoded data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals Visibility State
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
  });

  // Check URL params for direct product linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product") || params.get("id");
    if (productId && products.length > 0) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        setSelectedProduct(found);
        setView("product");
      }
    }
  }, [products]);

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
          setCategories(wooCats.filter(c => !isUncategorizedCategory(c)));
        } else {
          setCategories(staticCategories.filter(c => !isUncategorizedCategory(c)));
        }

        if (wooProds && wooProds.length > 0) {
          setProducts(wooProds);
        } else {
          setProducts(staticProducts);
        }
      } catch (error) {
        console.warn("Could not load live WooCommerce data, keeping local high-fidelity mock data.", error);
        setCategories(staticCategories.filter(c => !isUncategorizedCategory(c)));
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
  // Helper to add item to Cart
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + 1,
        };
        return nextCart;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = async () => {
    setIsCartOpen(false);
    if (isAlgerian) {
      if (cartItems.length > 0) {
        setCheckoutItems([...cartItems]);
        setCheckoutProduct(cartItems[0].product);
        setIsCheckoutOpen(true);
      }
    } else {
      // International Lemon Squeezy Hosted Checkout Redirect
      const env = (import.meta as any).env || {};
      const fallbackUrl =
        (cartItems.length > 0 && cartItems[0].product.lemonSqueezyUrl) ||
        env.VITE_LEMON_SQUEEZY_CHECKOUT_URL ||
        "https://lemonsqueezy.com";

      try {
        const payload = {
          items: cartItems.map((item) => ({
            id: item.product.id,
            title: lang === "fr" ? item.product.titleFR : item.product.titleAR,
            price: item.product.price,
            quantity: item.quantity,
            lemonSqueezyUrl: item.product.lemonSqueezyUrl,
          })),
        };

        const res = await fetch("/api/lemonsqueezy/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.error("[Lemon Squeezy] API checkout call failed, using direct URL", err);
      }

      window.location.href = fallbackUrl;
    }
  };

  // Handler to open order form for a selected product
  const handleOpenCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCheckoutProduct(product);
    setCheckoutItems([{ product, quantity: 1 }]);
    if (isAlgerian) {
      // Open the custom tailored Algerian Cash-On-Delivery popup modal
      setIsCheckoutOpen(true);
    } else {
      // Direct international buyer to product Lemon Squeezy hosted checkout page
      const env = (import.meta as any).env || {};
      const lemonUrl = product.lemonSqueezyUrl || env.VITE_LEMON_SQUEEZY_CHECKOUT_URL || "https://lemonsqueezy.com";
      console.log(`[Lemon Squeezy] Redirecting for product ${product.id} to Lemon Squeezy checkout: ${lemonUrl}`);
      window.location.href = lemonUrl;
    }
  };

  const handleBackFromProductPage = () => {
    window.location.href = getHomePageUrl();
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
        isAlgerian={isAlgerian}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenTracking={() => setIsTrackingOpen(true)}
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
        ) : view === "product" && selectedProduct ? (
          <ProductPage
            product={selectedProduct}
            lang={lang}
            onBack={handleBackFromProductPage}
            onAddToCart={handleAddToCart}
            isAlgerian={isAlgerian}
          />
        ) : view === "home" ? (
          <>
            {/* 2. Hero Section (Hidden on Mobile and Tablet) */}
            <div className="hidden lg:block">
              <Hero 
                lang={lang} 
                onExploreClick={handleExploreClick}
                onBuyFlagshipClick={handleBuyFlagshipClick}
                products={products}
              />
            </div>

            {/* 3. Brand & Trust Signature Banner (Second Section - Hidden on Mobile and Tablet) */}
            <div className="hidden lg:block">
              <BrandBanner lang={lang} />
            </div>

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
              onAddToCart={handleAddToCart}
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
              onAddToCart={handleAddToCart}
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
        items={checkoutItems}
        lang={lang} 
      />

      {/* Floating Modern Contact Elements (WhatsApp, Email & Algeria Parcel Tracking) */}
      <FloatingContact lang={lang} isAlgerian={isAlgerian} onTrackingClick={() => setIsTrackingOpen(true)} />

      {/* Realtime Express Parcel Tracking Status Modal */}
      <TrackingModal 
        isOpen={isTrackingOpen} 
        onClose={() => setIsTrackingOpen(false)} 
        lang={lang} 
      />

      {/* Modern, Headless Cart Drawer for International Clients */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        lang={lang}
      />

    </div>
  );
}
