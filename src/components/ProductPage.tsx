import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus,
  Sparkles
} from "lucide-react";
import { Product } from "../types";
import { translations } from "../data";

interface ProductPageProps {
  product: Product;
  lang: "fr" | "ar";
  onBack: () => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  isFromCheckout?: boolean;
}

export default function ProductPage({
  product,
  lang,
  onBack,
  onAddToCart,
  onBuyNow,
  isFromCheckout = false,
}: ProductPageProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  // Gallery images setup
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [product]);

  const title = lang === "fr" ? product.titleFR : product.titleAR;
  const rawDescription = lang === "fr" ? product.descriptionFR : product.descriptionAR;
  const rawFeatures = lang === "fr" ? product.featuresFR : product.featuresAR;

  // Process angle-bracket bullet syntax: <Great product for summer usage>
  const processDescriptionAndBullets = (rawDesc: string = "", existingFeatures: string[] = []) => {
    if (!rawDesc) return { cleanDesc: "", allFeatures: existingFeatures };

    const htmlTagRegex = /^(?:p|br|hr|b|i|strong|em|u|span|div|ul|ol|li|a|img|h[1-6]|table|tr|td|th|\/(?:p|br|hr|b|i|strong|em|u|span|div|ul|ol|li|a|img|h[1-6]|table|tr|td|th))$/i;
    const customBullets: string[] = [];

    const cleanDesc = rawDesc.replace(/<([^<>]+)>/g, (match, inner) => {
      const trimmed = inner.trim();
      if (trimmed && !htmlTagRegex.test(trimmed)) {
        customBullets.push(trimmed);
        return "";
      }
      return match;
    }).replace(/\n\s*\n\s*\n/g, "\n\n").trim();

    const combinedFeatures = [...(existingFeatures || [])];
    customBullets.forEach((bullet) => {
      if (!combinedFeatures.includes(bullet)) {
        combinedFeatures.push(bullet);
      }
    });

    return { cleanDesc, allFeatures: combinedFeatures };
  };

  const { cleanDesc: description, allFeatures: features } = processDescriptionAndBullets(rawDescription, rawFeatures);

  const handleAddCartClick = () => {
    if (onAddToCart) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow(product);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="bg-gray-50/50 dark:bg-[#121212] min-h-screen py-6 sm:py-12" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP BAR / BACK NAVIGATION */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] px-4 py-2.5 text-xs font-bold text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-[#262626] transition-all shadow-2xs cursor-pointer active:scale-95"
            id="product-page-back-btn"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>
              {isFromCheckout 
                ? (lang === "fr" ? "Retour à la commande" : "العودة إلى إتمام الطلب")
                : (lang === "fr" ? "Retour au catalogue" : "العودة للمتجر")}
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            <span>{lang === "fr" ? "Produit Authentique & Garanti" : "منتج أصلي ومضمون"}</span>
          </div>
        </div>

        {/* SINGLE COLUMN PRODUCT DETAILS CONTAINER */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200/80 dark:border-[#2a2a2a] p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Header & Title */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-brand-green">
              {product.category || "Tikatkom Store"}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-navy dark:text-white leading-tight">
              {title}
            </h1>
          </div>

          {/* Gallery Image Display */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-4">
              <img
                src={activeImage}
                alt={title}
                className="max-h-full max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Subimages / Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activeImage === img
                        ? "border-brand-green ring-2 ring-brand-green/20"
                        : "border-gray-200 dark:border-[#2a2a2a] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & CTA Action Section */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-gray-50/70 dark:bg-[#262626]/30 p-6 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-gray-400 dark:text-zinc-400">
                  {lang === "fr" ? "Prix du produit" : "سعر المنتج"}
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-brand-navy dark:text-white">
                    {product.price.toLocaleString()} {t.priceCurrency}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-lg font-bold text-gray-400 line-through">
                      {product.oldPrice.toLocaleString()} {t.priceCurrency}
                    </span>
                  )}
                </div>
              </div>

              {product.oldPrice && product.oldPrice > product.price && (
                <span className="rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-4 py-1.5 text-xs font-black text-red-600 dark:text-red-400">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% {lang === "fr" ? "DE RÉDUCTION" : "تخفيض"}
                </span>
              )}
            </div>

            {/* Quantity Controller & Buy Buttons */}
            <div className="pt-4 border-t border-gray-200/60 dark:border-[#2a2a2a] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-500 hover:text-brand-green rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-black text-brand-navy dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-gray-500 hover:text-brand-green rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={handleAddCartClick}
                    className="flex-1 rounded-2xl border-2 border-brand-navy dark:border-white bg-transparent py-3.5 px-5 text-sm font-extrabold text-brand-navy dark:text-white hover:bg-brand-navy hover:text-white dark:hover:bg-white dark:hover:text-brand-navy transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{addedNotice ? (lang === "fr" ? "Ajouté au panier ✓" : "تمت الإضافة للسلة ✓") : (lang === "fr" ? "Ajouter au panier" : "إضافة إلى السلة")}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="flex-1 rounded-2xl bg-brand-green hover:bg-emerald-600 py-3.5 px-5 text-sm font-black text-white dark:text-brand-navy shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{isFromCheckout ? (lang === "fr" ? "Retourner à la commande" : "العودة للطلب") : (lang === "fr" ? "Commander maintenant" : "اطلب الآن")}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Description Block */}
          {description && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {lang === "fr" ? "Description détaillée" : "وصف المنتج التفصيلي"}
              </h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
                {description}
              </p>
            </div>
          )}

          {/* Features / Bullet Points */}
          {features && features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#2a2a2a]">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {lang === "fr" ? "Caractéristiques & Avantages" : "مميزات وخصائص المنتج"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-gray-50 dark:bg-[#262626]/40 p-3 rounded-2xl border border-gray-100 dark:border-[#2a2a2a]">
                    <Check className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
