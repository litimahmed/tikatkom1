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
import { Product, Category, CartItem } from "./types";
import { products as staticProducts, categories as staticCategories } from "./data";
import { ChevronRight, ChevronLeft, Globe } from "lucide-react";
import { getWooCategories, getWooProducts, detectWordPressBaseUrl } from "./lib/woocommerce";
import { getUserCountryCode } from "./lib/geo";
import CartDrawer from "./components/CartDrawer";
import InternationalCheckout from "./components/InternationalCheckout";

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
  
  // Headless Cart & Checkout States for International users
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("tikatkom_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isIntlCheckoutOpen, setIsIntlCheckoutOpen] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{ orderId: string; trackingCode: string; grandTotal: number } | null>(null);

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

  // Page Routing State: "home" | "products"
  const [view, setView] = useState<"home" | "products">((): "home" | "products" => {
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
    // Open Cart Drawer
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (isAlgerian) {
      if (cartItems.length > 0) {
        setCheckoutProduct(cartItems[0].product);
      }
      setIsCheckoutOpen(true);
    } else {
      setIsIntlCheckoutOpen(true);
    }
  };

  const handleOrderSuccess = (receipt: { orderId: string; trackingCode: string; grandTotal: number }) => {
    setCartItems([]);
    localStorage.removeItem("tikatkom_cart");
    setIsIntlCheckoutOpen(false);
    setSuccessReceipt(receipt);
  };

  // Handler to open order form for a selected product
  const handleOpenCheckout = (product: Product) => {
    setCheckoutProduct(product);
    if (isAlgerian) {
      setIsCheckoutOpen(true);
    } else {
      setCartItems((prev) => {
        if (prev.some((item) => item.product.id === product.id)) return prev;
        return [{ product, quantity: 1 }, ...prev];
      });
      setIsIntlCheckoutOpen(true);
    }
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

      {/* Headless Custom Checkout Page for International Clients */}
      <InternationalCheckout
        isOpen={isIntlCheckoutOpen}
        onClose={() => setIsIntlCheckoutOpen(false)}
        cartItems={cartItems}
        lang={lang}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Premium Order Success Receipt Modal */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-green to-emerald-500"></div>
            
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-black text-brand-navy dark:text-white mb-2 font-arabic">
              {lang === "fr" ? "Commande Confirmée !" : "تم تأكيد طلبك بنجاح !"}
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6 font-arabic">
              {lang === "fr"
                ? "Merci pour votre confiance ! Votre commande a été transmise à notre équipe."
                : "شكرًا لثقتكم بنا ! تم تسجيل طلبكم بنجاح وجاري العمل على معالجته."}
            </p>

            <div className="bg-gray-50 dark:bg-zinc-950/50 rounded-2xl p-4 text-left text-xs space-y-2.5 border border-gray-100 dark:border-zinc-800/80 mb-6 font-semibold text-gray-600 dark:text-zinc-400" style={{ direction: "ltr" }}>
              <div className="flex justify-between">
                <span>{lang === "fr" ? "ID de la Commande" : "رقم الطلب"} :</span>
                <span className="font-extrabold text-brand-navy dark:text-white">{successReceipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "fr" ? "Numéro de Suivi (DHL)" : "رقم تتبع الشحنة (DHL)"} :</span>
                <span className="font-mono font-extrabold text-brand-green">{successReceipt.trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "fr" ? "Total payé" : "المبلغ الإجمالي المدفوع"} :</span>
                <span className="font-extrabold text-brand-navy dark:text-white">{successReceipt.grandTotal.toLocaleString()} DA</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessReceipt(null)}
              className="w-full rounded-full bg-brand-green hover:bg-brand-green-dark py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {lang === "fr" ? "Continuer" : "متابعة"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
