import React, { useState, useEffect } from "react";
import { X, Check, ShoppingBag, Phone, MapPin, Truck, AlertCircle, Plus, Minus, Landmark } from "lucide-react";
import { Product, OrderForm, Wilaya } from "../types";
import { AlgerianWilayas, translations } from "../data";
import { syncProductToCoCart, syncCustomerToCoCart, submitWooCommerceOrder, initWooCommerceStoreSession } from "../lib/wordpressSync";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  lang: "fr" | "ar";
}

export default function CheckoutModal({ isOpen, onClose, product, lang }: CheckoutModalProps) {
  if (!isOpen || !product) return null;

  const t = translations[lang];
  const isRTL = lang === "ar";

  // State managers
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedCourier, setSelectedCourier] = useState<string>("yalidine");
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [notes, setNotes] = useState<string>("");

  const couriersList = [
    { id: "yalidine", nameFR: "Yalidine Express", nameAR: "ياليدين إكسبريس", badge: "Populaire" },
    { id: "zrexpress", nameFR: "ZR Express", nameAR: "زد آر إكسبريس", badge: "Rapide" },
    { id: "maystro", nameFR: "Maystro Delivery", nameAR: "مايسترو دليفري", badge: "Sécurisé" },
    { id: "noest", nameFR: "NOEST Delivery", nameAR: "نويست دليفري", badge: "Fiable" },
    { id: "ecotrack", nameFR: "Ecotrack", nameAR: "إيكوتراك", badge: "Éco" },
  ];

  // Validation & Loading
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [orderReference, setOrderReference] = useState<string>("");

  // Get selected Wilaya object
  const currentWilaya = AlgerianWilayas.find((w) => w.code === selectedWilayaCode);

  // Auto-select first commune when Wilaya changes
  useEffect(() => {
    if (currentWilaya && currentWilaya.communes.length > 0) {
      setSelectedCommune(currentWilaya.communes[0]);
    } else {
      setSelectedCommune("");
    }
  }, [selectedWilayaCode]);

  // Shipping Fee calculation
  const getShippingFee = (): number => {
    if (!currentWilaya) return 0;
    return deliveryType === "home" ? currentWilaya.homePrice : currentWilaya.deskPrice;
  };

  const subtotal = product.price * quantity;
  const shippingFee = getShippingFee();
  const grandTotal = subtotal + shippingFee;

  // Validation Handler
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t.requiredError;
    }

    // Algerian Mobile Validation
    // Algerian numbers start with 05, 06, or 07 and have 10 digits
    const cleanPhone = phone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    
    if (!cleanPhone) {
      newErrors.phone = t.requiredError;
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = t.phoneError;
    }

    if (!selectedWilayaCode) {
      newErrors.wilayaCode = t.requiredError;
    }

    if (currentWilaya && currentWilaya.communes.length > 0 && !selectedCommune) {
      newErrors.commune = t.requiredError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sync selected product and quantity to WooCommerce/CoCart session
  useEffect(() => {
    if (isOpen && product) {
      syncProductToCoCart(product.id, quantity);
    }
  }, [isOpen, product?.id, quantity]);

  // Real-time Lead capture for CartBounty and CoCart (Debounced)
  useEffect(() => {
    if (!isOpen || !fullName.trim() || !phone.trim() || !product) return;

    const timer = setTimeout(() => {
      syncCustomerToCoCart({
        fullName,
        phone,
        wilayaCode: selectedWilayaCode,
        commune: selectedCommune,
        address,
        notes
      });
    }, 1200); // 1.2-second debounce to capture leads without stressing the server

    return () => clearTimeout(timer);
  }, [fullName, phone, selectedWilayaCode, selectedCommune, address, notes, isOpen, product]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const customerData = {
      fullName,
      phone,
      wilayaCode: selectedWilayaCode,
      commune: selectedCommune,
      address,
      notes
    };

    // Place the order directly in WooCommerce
    const wooOrderId = await submitWooCommerceOrder(
      product.id,
      quantity,
      customerData,
      deliveryType,
      shippingFee
    );

    setIsSubmitting(false);
    setIsSuccess(true);

    if (wooOrderId) {
      // Use the actual WooCommerce order reference
      setOrderReference(wooOrderId);
    } else {
      // Offline fallback reference
      const randomRef = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderReference(randomRef);
    }
  };

  // Reset Form states on close or reopen
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setFullName("");
      setPhone("");
      setSelectedWilayaCode("");
      setSelectedCommune("");
      setAddress("");
      setSelectedCourier("yalidine");
      setDeliveryType("home");
      setNotes("");
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen]);

  const productName = lang === "fr" ? product.titleFR : product.titleAR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative my-auto w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1a1a1a] border border-transparent dark:border-[#2a2a2a] shadow-2xl transition-all duration-300 max-h-[96vh] flex flex-col"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
        id="checkout-modal-container"
      >

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-10 rounded-full p-2 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-[#262626] hover:text-gray-700 dark:hover:text-zinc-300 transition-colors cursor-pointer`}
          aria-label="Close"
          id="close-checkout-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Inner Scrollable Container */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Header Title */}
              <div className="text-center">
                <h3 className="font-display text-2xl font-black text-brand-navy dark:text-white">
                  {t.checkoutTitle}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                  {t.checkoutSubTitle}
                </p>
              </div>

              {/* Product Brief Row */}
              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#262626]/30 p-4">
                <img
                  src={product.image}
                  alt={productName}
                  className="h-16 w-16 rounded-xl object-cover border border-gray-100 dark:border-[#2a2a2a] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-green">
                    {lang === "fr" ? "Votre produit sélectionné" : "المنتج المحدد حالياً"}
                  </span>
                  <h4 className="font-display text-sm font-extrabold text-brand-navy dark:text-white truncate">
                    {productName}
                  </h4>
                  <p className="text-xs font-black text-brand-green mt-0.5">
                    {product.price.toLocaleString()} {t.priceCurrency}
                  </p>
                </div>

                {/* Quantity Manager */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-gray-500 dark:text-zinc-400 hover:text-brand-green rounded-lg transition-colors active:scale-90 cursor-pointer"
                    aria-label="Decrease quantity"
                    id="quantity-minus-btn"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-brand-navy dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-gray-500 dark:text-zinc-400 hover:text-brand-green rounded-lg transition-colors active:scale-90 cursor-pointer"
                    aria-label="Increase quantity"
                    id="quantity-plus-btn"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid: 2 Columns for fields on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Col: Customer Information */}
                <div className="space-y-4">
                  <h5 className={`text-xs font-black uppercase tracking-wider text-brand-navy dark:text-zinc-200 border-b border-gray-100 dark:border-[#2a2a2a] pb-2 ${isRTL ? "text-right" : "text-left"}`}>
                    <span>{lang === "fr" ? "Coordonnées de livraison" : "معلومات المشتري والاتصال"}</span>
                  </h5>

                  {/* Name field */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={lang === "fr" ? "Ex: Mohamed Amine" : "مثال: محمد أمين"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"} ${
                        errors.fullName 
                          ? "border-red-300 dark:border-red-900/30 focus:ring-red-100 dark:focus:ring-red-900/10" 
                          : "border-gray-200 dark:border-[#2a2a2a] focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      id="input-fullname"
                    />
                    {errors.fullName && (
                      <p className={`mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium ${isRTL ? "justify-end text-right" : "justify-start text-left"}`}>
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formPhone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={lang === "fr" ? "Ex: 0550 12 34 56" : "مثال: 0550123456"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"} ${
                        errors.phone 
                          ? "border-red-300 dark:border-red-900/30 focus:ring-red-100 dark:focus:ring-red-900/10" 
                          : "border-gray-200 dark:border-[#2a2a2a] focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      id="input-phone"
                    />
                    {errors.phone && (
                      <p className={`mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium ${isRTL ? "justify-end text-right" : "justify-start text-left"}`}>
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formNotes}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.formNotesPlaceholder}
                      rows={2}
                      className={`w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] px-4 py-3 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/10 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}`}
                      id="input-notes"
                    />
                  </div>
                </div>

                {/* Right Col: Location & Delivery Details */}
                <div className="space-y-4">
                  <h5 className={`text-xs font-black uppercase tracking-wider text-brand-navy dark:text-zinc-200 border-b border-gray-100 dark:border-[#2a2a2a] pb-2 ${isRTL ? "text-right" : "text-left"}`}>
                    <span>{lang === "fr" ? "Détails d'adresse" : "تفاصيل التوصيل والموقع"}</span>
                  </h5>

                  {/* Wilaya Selection */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formWilaya} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right" : "text-left"} ${
                        errors.wilayaCode 
                          ? "border-red-300 dark:border-red-900/30 focus:ring-red-100 dark:focus:ring-red-900/10" 
                          : "border-gray-200 dark:border-[#2a2a2a] focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      id="input-wilaya"
                    >
                      <option value="" className="dark:bg-[#1a1a1a] dark:text-zinc-300">{lang === "fr" ? "-- Choisir votre Wilaya --" : "-- اختر الولاية --"}</option>
                      {AlgerianWilayas.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya.code} className="dark:bg-[#1a1a1a] dark:text-zinc-300">
                          {wilaya.code} - {lang === "fr" ? wilaya.nameFR : wilaya.nameAR}
                        </option>
                      ))}
                    </select>
                    {errors.wilayaCode && (
                      <p className={`mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium ${isRTL ? "justify-end text-right" : "justify-start text-left"}`}>
                        <span>{errors.wilayaCode}</span>
                      </p>
                    )}
                  </div>

                  {/* Commune Selection (depends on Wilaya) */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formCommune} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      disabled={!selectedWilayaCode}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right" : "text-left"} ${
                        errors.commune 
                          ? "border-red-300 dark:border-red-900/30 focus:ring-red-100 dark:focus:ring-red-900/10" 
                          : "border-gray-200 dark:border-[#2a2a2a] focus:border-brand-green focus:ring-brand-green/10"
                      } ${!selectedWilayaCode ? "bg-gray-50 dark:bg-[#121212] cursor-not-allowed text-gray-400 dark:text-zinc-650" : ""}`}
                      id="input-commune"
                    >
                      {!selectedWilayaCode ? (
                        <option value="" className="dark:bg-[#1a1a1a] dark:text-zinc-300">{lang === "fr" ? "Veuillez d'abord choisir la Wilaya" : "يرجى اختيار الولاية أولاً"}</option>
                      ) : (
                        currentWilaya?.communes.map((commune, idx) => (
                          <option key={idx} value={commune} className="dark:bg-[#1a1a1a] dark:text-zinc-300">
                            {commune}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.commune && (
                      <p className={`mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium ${isRTL ? "justify-end text-right" : "justify-start text-left"}`}>
                        <span>{errors.commune}</span>
                      </p>
                    )}
                  </div>

                  {/* Detailed Address field */}
                  <div>
                    <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {t.formAddress}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={lang === "fr" ? "Nom de rue, numéro de maison, quartier..." : "اسم الشارع، رقم المنزل، الحي..."}
                      className={`w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] px-4 py-3 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/10 dark:bg-[#262626] dark:text-white ${isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}`}
                      id="input-address"
                    />
                  </div>
                </div>

              </div>

              {/* Delivery Type Switcher (Simple Radio Options) */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold text-gray-700 dark:text-zinc-300 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.formDeliveryMode}
                </label>
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  {/* Home Delivery Radio */}
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-zinc-300 ${isRTL ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="home"
                      checked={deliveryType === "home"}
                      onChange={() => setDeliveryType("home")}
                      className="h-4 w-4 accent-brand-green cursor-pointer"
                    />
                    <span>
                      {t.formHome}
                      <span className="text-gray-400 font-normal ml-1.5 mr-1.5">
                        ({selectedWilayaCode 
                          ? `${currentWilaya?.homePrice} DA` 
                          : (lang === "fr" ? "Tarif à domicile selon Wilaya" : "حسب الولاية")
                        })
                      </span>
                    </span>
                  </label>

                  {/* Desk Delivery Radio */}
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-zinc-300 ${isRTL ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="desk"
                      checked={deliveryType === "desk"}
                      onChange={() => setDeliveryType("desk")}
                      className="h-4 w-4 accent-brand-green cursor-pointer"
                    />
                    <span>
                      {t.formDesk}
                      <span className="text-gray-400 font-normal ml-1.5 mr-1.5">
                        ({selectedWilayaCode 
                          ? `${currentWilaya?.deskPrice} DA` 
                          : (lang === "fr" ? "Tarif bureau selon Wilaya" : "حسب الولاية")
                        })
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Order Invoice/Total summary box */}
              <div className="rounded-2xl border border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#262626]/30 p-5 space-y-3">
                <h5 className={`text-xs font-black uppercase tracking-wider text-brand-navy dark:text-zinc-100 pb-2 border-b border-gray-200/50 dark:border-[#2a2a2a]/80 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.orderSummary}
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                    <span>{t.formQty} :</span>
                    <span className="font-bold text-brand-navy dark:text-zinc-100">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                    <span>{t.subtotal} :</span>
                    <span className="font-bold text-brand-navy dark:text-zinc-100">{subtotal.toLocaleString()} {t.priceCurrency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                    <span>{t.shippingFee} :</span>
                    <span className="font-bold text-brand-navy dark:text-zinc-100">
                      {selectedWilayaCode ? `${shippingFee.toLocaleString()} ${t.priceCurrency}` : "0 DA"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-brand-navy dark:text-white pt-2 border-t border-gray-200/50 dark:border-[#2a2a2a]">
                    <span>{t.grandTotal} :</span>
                    <span className="text-base text-brand-green font-extrabold">
                      {grandTotal.toLocaleString()} {t.priceCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust disclaimer */}
              <p className="text-[10px] text-center text-gray-400 dark:text-zinc-500 font-semibold">
                <span>{t.orderSecure}</span>
              </p>

              {/* Pulsing high conversion checkout button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`relative w-full rounded-2xl bg-brand-green py-4 px-6 text-sm font-black text-white shadow-xl shadow-brand-green/30 transition-all duration-200 hover:bg-brand-green-hover active:scale-[0.98] ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : "animate-pulse-subtle"
                }`}
                id="submit-checkout-order-btn"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    {/* Native loading ring */}
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t.submitting}</span>
                  </span>
                ) : (
                  <span>{t.submitOrder}</span>
                )}
              </button>

            </form>
          ) : (
            
            /* Success confirmation screen */
            <div className="text-center py-8 space-y-6">
              
              {/* Giant elegant checklist animation circle */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/10 text-brand-green animate-bounce">
                <Check className="h-10 w-10 stroke-[3.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-black text-brand-navy dark:text-white">
                  {t.successTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {t.successDesc}
                </p>
              </div>

              {/* Order Reference details */}
              <div className="mx-auto max-w-sm rounded-xl border border-dashed border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#262626]/30 p-4 space-y-1">
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  {t.successCode}
                </p>
                <p className="font-mono text-lg font-black text-brand-green tracking-widest">
                  {orderReference}
                </p>
              </div>

              {/* Customer summary */}
              <div className="mx-auto max-w-md border border-gray-100 dark:border-zinc-800 rounded-xl p-4 text-left text-xs space-y-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-1.5 font-bold text-brand-navy dark:text-white">
                  <span>{lang === "fr" ? "Détails de facturation" : "معلومات الفاتورة"}</span>
                  <span className="text-brand-green font-extrabold">{lang === "fr" ? "Paiement à la livraison" : "الدفع عند الاستلام"}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>{t.formName} :</span>
                  <span className="font-semibold text-brand-navy dark:text-zinc-100">{fullName}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>{t.formPhone} :</span>
                  <span className="font-mono text-brand-navy dark:text-zinc-100">{phone}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>{lang === "fr" ? "Destination" : "جهة التوصيل"} :</span>
                  <span className="font-semibold text-brand-navy dark:text-zinc-100">
                    {currentWilaya ? (lang === "fr" ? currentWilaya.nameFR : currentWilaya.nameAR) : ""} - {selectedCommune}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>{t.formDeliveryMode} :</span>
                  <span className="font-semibold text-brand-navy dark:text-zinc-100">
                    {deliveryType === "home" ? t.formHome : t.formDesk}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>{lang === "fr" ? "Transporteur" : "شركة التوصيل"} :</span>
                  <span className="font-semibold text-brand-navy dark:text-zinc-100 font-sans">
                    {couriersList.find(c => c.id === selectedCourier)?.[lang === "fr" ? "nameFR" : "nameAR"]}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-brand-navy dark:text-white pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span>{t.grandTotal} :</span>
                  <span className="text-brand-green text-base font-extrabold">{grandTotal.toLocaleString()} {t.priceCurrency}</span>
                </div>
              </div>

              {/* Close CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                {/* Whatsapp instant speed-up order helper (High conversion feature in Algeria) */}
                <a
                  href={`https://wa.me/${((import.meta as any).env?.VITE_MERCHANT_WHATSAPP || "+213781913776").replace(/\s+/g, "")}?text=${encodeURIComponent(
                    lang === "fr"
                      ? `Bonjour, je viens de passer commande pour le produit ${productName} (Réf: ${orderReference}). Transporteur: ${couriersList.find(c => c.id === selectedCourier)?.nameFR}, Mode: ${deliveryType === "home" ? "Domicile" : "Bureau"}. Merci de valider.`
                      : `مرحباً، لقد قمت للتو بطلب المنتج ${productName} (المرجع: ${orderReference}). شركة التوصيل: ${couriersList.find(c => c.id === selectedCourier)?.nameAR}، طريقة الاستلام: ${deliveryType === "home" ? "باب المنزل" : "مكتب التوصيل"}. يرجى تأكيد الطلب.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white py-3 px-4 text-xs font-bold shadow-md shadow-[#25D366]/20 hover:opacity-95 transition-opacity cursor-pointer"
                  id="whatsapp-confirm-btn"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.117 1.05 11.487 1.05c-5.43 0-9.85 4.37-9.854 9.799 0 1.834.49 3.626 1.419 5.212l-.93 3.393 3.493-.916z"/>
                  </svg>
                  <span>{lang === "fr" ? "Accélérer via WhatsApp" : "تأكيد فوري عبر واتساب"}</span>
                </a>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 py-3 px-6 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  id="close-success-btn"
                >
                  {t.successClose}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
