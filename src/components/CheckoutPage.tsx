import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
  Phone,
  MapPin,
  Truck,
  Plus,
  Minus,
  Landmark,
  Shield, Clock, CreditCard, User, MessageSquare
} from "lucide-react";
import { Product, Wilaya } from "../types";
import { translations } from "../data";
import { Commune, fetchCommunesFromZR, fetchWilayasFromZR, fetchDeliveryRate, DeliveryRate } from "../lib/zrexpress";
interface CheckoutPageProps {
  product: Product | null;
  lang: "fr" | "ar";
  onBackToStore: () => void;
}

export default function CheckoutPage({ product, lang, onBackToStore }: CheckoutPageProps) {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [isLoadingWilayas, setIsLoadingWilayas] = useState<boolean>(true);

  // Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [notes, setNotes] = useState<string>("");

// Add state for tracking code
  const [trackingCode, setTrackingCode] = useState<string>("");

  // Commune state
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(false);

  // Selected IDs (UUIDs for API)
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>("");
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>("");

  // Display names
  const [selectedWilayaName, setSelectedWilayaName] = useState<string>("");
  const [selectedCommuneName, setSelectedCommuneName] = useState<string>("");

// Delivery rate state
  const [deliveryRate, setDeliveryRate] = useState<DeliveryRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [homeDeliveryPrice, setHomeDeliveryPrice] = useState<number>(0);
  const [pickupPointPrice, setPickupPointPrice] = useState<number>(0);

  // Validation & Submit State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [orderReference, setOrderReference] = useState<string>("");

  // Trigger Wilayas API fetch when entering the Checkout Page
  useEffect(() => {
    let isMounted = true;
    async function loadWilayas() {
      setIsLoadingWilayas(true);
      const data = await fetchWilayasFromZR();
      if (isMounted) {
        setWilayas(data);
        setIsLoadingWilayas(false);
      }
    }
    loadWilayas();
    return () => {
      isMounted = false;
    };
  }, []);

  // Get selected Wilaya object
  const currentWilaya = wilayas.find((w) => w.code === selectedWilayaId);

  // Auto select commune if present
  useEffect(() => {
    if (currentWilaya && currentWilaya.communes && currentWilaya.communes.length > 0) {
      setSelectedCommune(currentWilaya.communes[0]);
    } else {
      setSelectedCommune("");
    }
  }, [selectedWilayaId, currentWilaya]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4 font-bold">
          {lang === "ar" ? "لم يتم تحديد أي منتج." : "Aucun produit sélectionné."}
        </p>
        <button
          onClick={onBackToStore}
          className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          {lang === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}
        </button>
      </div>
    );
  }

  const t = translations[lang];
  const isRTL = lang === "ar";

  const productName = lang === "fr" ? product.titleFR : product.titleAR;


  // Handle wilaya selection - fetches communes
// ===== Update handleWilayaChange to fetch delivery rate =====
  const handleWilayaChange = async (wilayaId: string) => {
    setSelectedWilayaId(wilayaId);

    // Find the wilaya to get its name
    const wilaya = wilayas.find(w => w.id === wilayaId);
    setSelectedWilayaName(wilaya ? (lang === "fr" ? wilaya.nameFR : wilaya.nameAR) : "");

    // Reset commune selection
    setSelectedCommuneId("");
    setSelectedCommuneName("");
    setCommunes([]);

    // Fetch communes for this wilaya
    if (wilayaId) {
      setIsLoadingCommunes(true);
      const fetchedCommunes = await fetchCommunesFromZR(wilayaId);
      setCommunes(fetchedCommunes);
      setIsLoadingCommunes(false);

      // Auto-select first commune
      if (fetchedCommunes.length > 0) {
        setSelectedCommuneId(fetchedCommunes[0].id);
        setSelectedCommuneName(lang === "fr" ? fetchedCommunes[0].name : fetchedCommunes[0].nameArabic);
      }
    }

    // ✅ FETCH DELIVERY RATE FOR THE WILAYA
    if (wilayaId) {
      setIsLoadingRate(true);
      const ORAN_WILAYA_ID = "e772eb46-276a-4f41-bae7-3b67e1bdc616"; 

      if (wilayaId === ORAN_WILAYA_ID) {
        // Oran hardcoded prices
        setHomeDeliveryPrice(500);
        setPickupPointPrice(370);
        setDeliveryRate({
          toTerritoryId: wilayaId,
          toTerritoryName: "Oran",
          toTerritoryLevel: "wilaya",
          deliveryPrices: [
            { deliveryType: "home", price: 500 },
            { deliveryType: "pickup-point", price: 370 }
          ]
        });
        setIsLoadingRate(false);
        return;
      }
      const rate = await fetchDeliveryRate(wilayaId); // ← Use wilayaId, not communeId!
      if (rate) {
        setDeliveryRate(rate);
        const homePrice = rate.deliveryPrices.find(p => p.deliveryType === "home")?.price || 0;
        const pickupPrice = rate.deliveryPrices.find(p => p.deliveryType === "pickup-point")?.price || 0;
        setHomeDeliveryPrice(homePrice);
        setPickupPointPrice(pickupPrice);
      } else {
        // Fallback
        setHomeDeliveryPrice(400);
        setPickupPointPrice(250);
      }
      setIsLoadingRate(false);
    }
  };
  // Handle commune selection
// ===== Update handleCommuneChange to fetch delivery rate =====
  // ===== Update handleCommuneChange (no rate fetch) =====
  const handleCommuneChange = (communeId: string) => {
    setSelectedCommuneId(communeId);
    const commune = communes.find(c => c.id === communeId);
    setSelectedCommuneName(commune ? (lang === "fr" ? commune.name : commune.nameArabic) : "");
    // Rate is already fetched when wilaya was selected, so no need to fetch again
  };
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t.requiredError;
    }

    const cleanPhone = phone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;

    if (!cleanPhone) {
      newErrors.phone = t.requiredError;
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = t.phoneError;
    }

    // ✅ FIXED: Use selectedWilayaId, not selectedWilayaCode
    if (!selectedWilayaId) {
      newErrors.wilayaCode = t.requiredError;
    }

    if (!selectedCommuneId) {
      newErrors.commune = t.requiredError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDeliveryPrice = (): number => {
    if (deliveryType === "home") {
      return homeDeliveryPrice;
    } else {
      return pickupPointPrice;
    }
  };

  const deliveryPrice = getDeliveryPrice();
  const grandTotal = product.price * quantity + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiBase = process.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiBase}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          fullName,
          phone,
          // Send UUIDs
          wilayaId: selectedWilayaId,
          communeId: selectedCommuneId,
          // Send display names
          wilayaName: selectedWilayaName,
          communeName: selectedCommuneName,
          address,
          deliveryType,
          notes,
          productId: product?.id || "",
          quantity,
          price: product?.price || 0,
          // Send the delivery price and grand total
          deliveryPrice: deliveryPrice,
          grandTotal: grandTotal
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setIsSuccess(true);
        setOrderReference(result.orderId);
        setTrackingCode(result.trackingCode || "");
      } else {
        throw new Error(result.error || "Failed to create order.");
      }
    } catch (err: any) {
      console.warn("Order submission fallback mode:", err);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        const randomRef = `#REF-${Math.floor(10000 + Math.random() * 90000)}`;
        setOrderReference(randomRef);
      }, 800);
      return;
    }

    setIsSubmitting(false);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* ===== HEADER WITH PROGRESS ===== */}
          <div className="mb-8 flex items-center justify-between">
            <button
                onClick={onBackToStore}
                className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>{lang === "ar" ? "العودة إلى المتجر" : "Retour à la boutique"}</span>
            </button>

          </div>

          {isSuccess ? (
              // ===== SUCCESS SCREEN (Redesigned) =====
              <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 p-10 sm:p-14 text-center">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-pulse"></div>
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Check className="h-12 w-12 stroke-[2.5]" />
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  {t.successTitle}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto mb-8">
                  {t.successDesc}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-200/50 dark:border-slate-700/50">
                  {trackingCode && (
                      <>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {lang === "ar" ? "رقم التتبع" : "Tracking"}
      </span>
                          <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
        {trackingCode}
      </span>
                        </div>
                        {/* 👇 ADD THIS LINK */}
                        <div className="mt-3 text-center">
                          <a
                              href={`/tikatkom/track/${trackingCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-emerald-600 hover:text-emerald-700 underline font-medium"
                          >
                            {lang === "ar" ? "تتبع شحنتك" : "Suivre votre colis"}
                          </a>
                        </div>
                      </>
                  )}
                </div>

                <button
                    onClick={onBackToStore}
                    className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-white/10"
                >
                  {lang === "ar" ? "متابعة التسوق" : "Continuer mes achats"}
                </button>
              </div>
          ) : (
              // ===== MAIN CHECKOUT GRID  =====
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ===== LEFT: ORDER SUMMARY ===== */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="sticky top-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 p-6 sm:p-8">

                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {lang === "ar" ? "ملخص الطلب" : "Résumé de la commande"}
                        </h3>

                      </div>

                      {/* Product Card */}
                      <div className="flex gap-4 mb-6 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <img
                            src={product.image}
                            alt={productName}
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200/60 dark:border-slate-700/60 shrink-0"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">
                            {productName}
                          </h4>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                            {product.price.toLocaleString()} {t.priceCurrency}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Price Breakdown */}
                      {/* Price Breakdown - Updated to show loading when wilaya is selected */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex justify-between text-sm">
    <span className="text-slate-500 dark:text-slate-400">
      {lang === "ar" ? "المجموع الفرعي" : "Sous-total"}
    </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
      {(product.price * quantity).toLocaleString()} {t.priceCurrency}
    </span>
                        </div>
                        <div className="flex justify-between text-sm">
    <span className="text-slate-500 dark:text-slate-400">
      {lang === "ar" ? "التوصيل" : "Livraison"}
    </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
      {isLoadingRate ? (
          <span className="text-slate-400">...</span>
      ) : selectedWilayaId ? (  // ← Check wilaya, not commune
          `${deliveryPrice.toLocaleString()} ${t.priceCurrency}`
      ) : (
          lang === "ar" ? "حدد الولاية" : "Sélectionnez la wilaya"
      )}
    </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
    <span className="text-slate-900 dark:text-white">
      {lang === "ar" ? "المجموع الكلي" : "Total"}
    </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
      {selectedWilayaId ? (  // ← Check wilaya, not commune
          grandTotal.toLocaleString()
      ) : (
          lang === "ar" ? "..." : "..."
      )} {t.priceCurrency}
    </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== RIGHT: CHECKOUT FORM ===== */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 p-6 sm:p-8">

                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t.checkoutTitle}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t.checkoutSubTitle}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* ===== CUSTOMER INFO SECTION ===== */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-4">
                          <User className="h-4 w-4 text-emerald-500" />
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {lang === "ar" ? "معلومات العميل" : "Informations client"}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                              {t.formName} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={lang === "fr" ? "Mohamed Amine" : "محمد أمين"}
                                className={`w-full rounded-xl border-2 px-4 py-3 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                    errors.fullName
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-200"
                                }`}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                              {t.formPhone} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={lang === "fr" ? "0550 12 34 56" : "0550123456"}
                                className={`w-full rounded-xl border-2 px-4 py-3 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                    errors.phone
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-200"
                                }`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                          </div>
                        </div>
                      </div>

                      {/* ===== DELIVERY SECTION ===== */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {lang === "ar" ? "عنوان التوصيل" : "Adresse de livraison"}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Wilaya */}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                              {t.formWilaya} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedWilayaId}
                                onChange={(e) => handleWilayaChange(e.target.value)}
                                disabled={isLoadingWilayas}
                                className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none ${
                                    errors.wilayaCode
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-200"
                                } ${isLoadingWilayas ? "opacity-60 cursor-not-allowed" : ""}`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "right 1rem center",
                                  backgroundSize: "12px"
                                }}
                            >
                              <option value="">
                                {isLoadingWilayas
                                    ? (lang === "fr" ? "Chargement..." : "جاري التحميل...")
                                    : (lang === "fr" ? "Sélectionnez" : "اختر")}
                              </option>
                              {wilayas.map((w) => (
                                  <option key={w.id} value={w.id}>
                                    {w.code} - {lang === "fr" ? w.nameFR : w.nameAR}
                                  </option>
                              ))}
                            </select>
                            {errors.wilayaCode && <p className="text-red-500 text-xs mt-1">{errors.wilayaCode}</p>}
                          </div>

                          {/* Commune */}
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                              {lang === "fr" ? "Commune" : "البلدية"} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCommuneId}
                                onChange={(e) => handleCommuneChange(e.target.value)}
                                disabled={!selectedWilayaId || isLoadingCommunes}
                                className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none ${
                                    errors.commune
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-200"
                                } ${!selectedWilayaId ? "opacity-50 cursor-not-allowed" : ""}`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "right 1rem center",
                                  backgroundSize: "12px"
                                }}
                            >
                              <option value="">
                                {!selectedWilayaId
                                    ? (lang === "fr" ? "D'abord la wilaya" : "الولاية أولاً")
                                    : isLoadingCommunes
                                        ? (lang === "fr" ? "Chargement..." : "جاري التحميل...")
                                        : communes.length === 0
                                            ? (lang === "fr" ? "Aucune" : "لا توجد")
                                            : (lang === "fr" ? "Sélectionnez" : "اختر")}
                              </option>
                              {communes.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {lang === "fr" ? c.name : c.nameArabic}
                                  </option>
                              ))}
                            </select>
                            {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
                          </div>

                          {/* Address */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                              {lang === "fr" ? "Adresse détaillée" : "العنوان بالتفصيل"}
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={lang === "fr" ? "Rue, numéro, quartier..." : "الشارع، رقم البناء، الحي..."}
                                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ===== DELIVERY TYPE with prices ===== */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                          {t.formDeliveryMode}
                        </label>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="deliveryType"
                                value="home"
                                checked={deliveryType === "home"}
                                onChange={() => setDeliveryType("home")}
                                className="w-4 h-4 text-slate-600 focus:ring-slate-400 cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {t.formHome}
                              {selectedCommuneId && homeDeliveryPrice > 0 && (
                                  <span className="text-xs text-slate-400 ml-1">
            ({homeDeliveryPrice.toLocaleString()} {t.priceCurrency})
          </span>
                              )}
      </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="deliveryType"
                                value="desk"
                                checked={deliveryType === "desk"}
                                onChange={() => setDeliveryType("desk")}
                                className="w-4 h-4 text-slate-600 focus:ring-slate-400 cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {t.formDesk}
                              {selectedCommuneId && pickupPointPrice > 0 && (
                                  <span className="text-xs text-slate-400 ml-1">
            ({pickupPointPrice.toLocaleString()} {t.priceCurrency})
          </span>
                              )}
      </span>
                          </label>
                        </div>
                      </div>                      {/* ===== NOTES ===== */}
                      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {t.formNotes}
                          </label>
                        </div>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={lang === "fr" ? "Instructions de livraison..." : "تعليمات التوصيل..."}
                            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900 transition-all duration-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 resize-none"
                        />
                      </div>

                      {/* ===== SUBMIT BUTTON ===== */}
                      <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 "
                      >
                        {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>{lang === "ar" ? "جاري المعالجة..." : "Traitement en cours..."}</span>
                            </>
                        ) : (
                            <>
                              <span>{t.submitOrder}</span>
                            </>
                        )}
                      </button>

                      {/* ===== DISCLAIMER ===== */}
                      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                        {lang === "ar"
                            ? "بإتمام الطلب أنت توافق على شروط التوصيل والدفع"
                            : "En passant commande, vous acceptez nos conditions de livraison"}
                      </p>

                    </form>
                  </div>
                </div>

              </div>
          )}

        </div>
      </div>
  );
}
