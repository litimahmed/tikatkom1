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
import { Product } from "./types";
import { products } from "./data";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function App() {
  // Primary Localization State: defaults to French, toggleable to Arabic
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  
  // Page Routing State: "home" or "products"
  const [view, setView] = useState<"home" | "products">("home");

  // Modals Visibility State
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Set HTML dir and lang attributes on state changes for perfect RTL/LTR layout behavior
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Handler to open order form for a selected product
  const handleOpenCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Handler when clicking categories - sets view to products page and selects category filter
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler for homepage section view all - goes to products page with category selected
  const handleViewAllClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler for hero exploratory CTA - goes to products page
  const handleExploreClick = () => {
    setSelectedCategory(null);
    setView("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler for hero direct buyout CTA - opens checkout for flagship product
  const handleBuyFlagshipClick = () => {
    handleOpenCheckout(products[0]);
  };

  // Handle Logo click - goes back home and resets filters
  const handleLogoClick = () => {
    setView("home");
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 transition-colors duration-300 selection:bg-brand-green/20 selection:text-brand-green">
      
      {/* 1. Sticky Header */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        onOpenShippingModal={() => setIsShippingOpen(true)} 
        onLogoClick={handleLogoClick}
      />

      <main>
        {view === "home" ? (
          <>
            {/* 2. Hero Section */}
            <Hero 
              lang={lang} 
              onExploreClick={handleExploreClick}
              onBuyFlagshipClick={handleBuyFlagshipClick}
            />

            {/* 3. Brand & Trust Signature Banner */}
            <BrandBanner lang={lang} />

            {/* 4. Categories Section */}
            <CategoriesGrid 
              lang={lang} 
              onCategoryClick={handleCategoryClick} 
            />

            {/* 5. Four Custom Product Line Sections */}
            <HomeSections 
              lang={lang}
              onBuyClick={handleOpenCheckout}
              onViewAllClick={handleViewAllClick}
            />
          </>
        ) : (
          <>
            {/* Elegant Breadcrumbs & Navigation Bar for Dedicated Shop Page */}
            <div className="bg-gray-50 border-b border-gray-100 py-4">
              <div 
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between"
                style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <button 
                    onClick={() => setView("home")}
                    className="hover:text-brand-green transition-colors cursor-pointer"
                  >
                    {lang === "ar" ? "الرئيسية" : "Accueil"}
                  </button>
                  <span className="text-gray-300">/</span>
                  <span className="text-brand-navy font-bold font-arabic">
                    {lang === "ar" ? "متجر تيكاتكوم" : "Boutique TIKATKOM"}
                  </span>
                </div>

                <button 
                  onClick={() => setView("home")}
                  className="flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-brand-green transition-colors cursor-pointer"
                >
                  {lang === "ar" ? (
                    <>
                      <span>العودة للرئيسية</span>
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Retour</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 6. Filterable Products Grid (Dedicated Shop View) */}
            <ProductsGrid 
              lang={lang} 
              onBuyClick={handleOpenCheckout}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
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

    </div>
  );
}
