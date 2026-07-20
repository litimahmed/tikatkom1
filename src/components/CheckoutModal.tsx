import React, { useState, useEffect } from "react";
import { X, Check, ShoppingBag, Phone, MapPin, Truck, AlertCircle, Plus, Minus, Landmark } from "lucide-react";
import { Product, OrderForm, Wilaya } from "../types";
import { AlgerianWilayas, translations } from "../data";

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

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error or shake form
      return;
    }

    setIsSubmitting(true);

    // Simulate WordPress/WooCommerce REST API response delay (1.5 seconds)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Generate random high-conversion order number (e.g., TKT-18492)
      const randomRef = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderReference(randomRef);
    }, 1500);
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
        className="relative my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl transition-all duration-300 max-h-[96vh] flex flex-col"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
        id="checkout-modal-container"
      >
        {/* Top brand indicator */}
        <div className="bg-gradient-to-r from-brand-green to-emerald-600 h-2 w-full shrink-0"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors`}
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
                <h3 className="font-display text-2xl font-black text-brand-navy">
                  {t.checkoutTitle}
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                  {t.checkoutSubTitle}
                </p>
              </div>

              {/* Product Brief Row */}
              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <img
                  src={product.image}
                  alt={productName}
                  className="h-16 w-16 rounded-xl object-cover border border-gray-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-green">
                    {lang === "fr" ? "Votre produit sélectionné" : "المنتج المحدد حالياً"}
                  </span>
                  <h4 className="font-display text-sm font-extrabold text-brand-navy truncate">
                    {productName}
                  </h4>
                  <p className="text-xs font-black text-brand-green mt-0.5">
                    {product.price.toLocaleString()} {t.priceCurrency}
                  </p>
                </div>

                {/* Quantity Manager */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-gray-500 hover:text-brand-green rounded-lg transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                    id="quantity-minus-btn"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-brand-navy">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-gray-500 hover:text-brand-green rounded-lg transition-colors active:scale-90"
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
                  <h5 className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Phone className="h-3.5 w-3.5 text-brand-green" />
                    <span>{lang === "fr" ? "Coordonnées de livraison" : "معلومات المشتري والاتصال"}</span>
                  </h5>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={lang === "fr" ? "Ex: Mohamed Amine" : "مثال: محمد أمين"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                        errors.fullName 
                          ? "border-red-300 focus:ring-red-100" 
                          : "border-gray-200 focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      id="input-fullname"
                    />
                    {errors.fullName && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formPhone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={lang === "fr" ? "Ex: 0550 12 34 56" : "مثال: 0550123456"}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 ${
                        errors.phone 
                          ? "border-red-300 focus:ring-red-100" 
                          : "border-gray-200 focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      style={{ direction: "ltr" }}
                      id="input-phone"
                    />
                    {errors.phone && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formNotes}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.formNotesPlaceholder}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/10"
                      id="input-notes"
                    />
                  </div>
                </div>

                {/* Right Col: Location & Delivery Details */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <MapPin className="h-3.5 w-3.5 text-brand-green" />
                    <span>{lang === "fr" ? "Détails d'adresse" : "تفاصيل التوصيل والموقع"}</span>
                  </h5>

                  {/* Wilaya Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formWilaya} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                        errors.wilayaCode 
                          ? "border-red-300 focus:ring-red-100" 
                          : "border-gray-200 focus:border-brand-green focus:ring-brand-green/10"
                      }`}
                      id="input-wilaya"
                    >
                      <option value="">{lang === "fr" ? "-- Choisir votre Wilaya --" : "-- اختر الولاية --"}</option>
                      {AlgerianWilayas.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya.code}>
                          {wilaya.code} - {lang === "fr" ? wilaya.nameFR : wilaya.nameAR}
                        </option>
                      ))}
                    </select>
                    {errors.wilayaCode && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.wilayaCode}</span>
                      </p>
                    )}
                  </div>

                  {/* Commune Selection (depends on Wilaya) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formCommune} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      disabled={!selectedWilayaCode}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                        errors.commune 
                          ? "border-red-300 focus:ring-red-100" 
                          : "border-gray-200 focus:border-brand-green focus:ring-brand-green/10"
                      } ${!selectedWilayaCode ? "bg-gray-50 cursor-not-allowed text-gray-400" : ""}`}
                      id="input-commune"
                    >
                      {!selectedWilayaCode ? (
                        <option value="">{lang === "fr" ? "Veuillez d'abord choisir la Wilaya" : "يرجى اختيار الولاية أولاً"}</option>
                      ) : (
                        currentWilaya?.communes.map((commune, idx) => (
                          <option key={idx} value={commune}>
                            {commune}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.commune && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.commune}</span>
                      </p>
                    )}
                  </div>

                  {/* Detailed Address field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t.formAddress}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={lang === "fr" ? "Nom de rue, numéro de maison, quartier..." : "اسم الشارع، رقم المنزل، الحي..."}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/10"
                      id="input-address"
                    />
                  </div>
                </div>

              </div>

              {/* Courier Service Selection Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-brand-navy">
                  {lang === "fr" ? "Service de Courrier" : "شركة التوصيل المفضلة"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {couriersList.map((c) => {
                    const isSelected = selectedCourier === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCourier(c.id)}
                        className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all duration-200 flex flex-col items-center justify-between gap-1.5 min-h-[72px] ${
                          isSelected
                            ? "border-brand-green bg-brand-green/5 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-brand-navy leading-tight">
                          {lang === "fr" ? c.nameFR : c.nameAR}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          isSelected 
                            ? "bg-brand-green text-white" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {c.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Type Switcher (Card styling for beautiful UI) */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-brand-navy">
                  {t.formDeliveryMode}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Home Delivery Card */}
                  <div
                    onClick={() => setDeliveryType("home")}
                    className={`relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      deliveryType === "home"
                        ? "border-brand-green bg-brand-green/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                    id="delivery-home-card"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      deliveryType === "home" ? "bg-brand-green text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-brand-navy">{t.formHome}</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {selectedWilayaCode 
                          ? `${lang === "fr" ? "Livraison" : "شحن"} : ${currentWilaya?.homePrice} DA` 
                          : (lang === "fr" ? "Tarif à domicile selon Wilaya" : "سعر التوصيل لباب البيت حسب الولاية")
                        }
                      </p>
                    </div>
                    {deliveryType === "home" && (
                      <span className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-white text-[10px]`}>
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Desk Delivery Card (Yalidine Office Pick-up) */}
                  <div
                    onClick={() => setDeliveryType("desk")}
                    className={`relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      deliveryType === "desk"
                        ? "border-brand-green bg-brand-green/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                    id="delivery-desk-card"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      deliveryType === "desk" ? "bg-brand-green text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-brand-navy">{t.formDesk}</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {selectedWilayaCode 
                          ? `${lang === "fr" ? "Livraison" : "شحن"} : ${currentWilaya?.deskPrice} DA` 
                          : (lang === "fr" ? "Tarif bureau selon Wilaya" : "سعر الاستلام من المكتب حسب الولاية")
                        }
                      </p>
                    </div>
                    {deliveryType === "desk" && (
                      <span className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-white text-[10px]`}>
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Order Invoice/Total summary box */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-brand-navy pb-2 border-b border-gray-200/50">
                  {t.orderSummary}
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.formQty} :</span>
                    <span className="font-bold text-brand-navy">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.subtotal} :</span>
                    <span className="font-bold text-brand-navy">{subtotal.toLocaleString()} {t.priceCurrency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.shippingFee} :</span>
                    <span className="font-bold text-brand-navy">
                      {selectedWilayaCode ? `${shippingFee.toLocaleString()} ${t.priceCurrency}` : "0 DA"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-brand-navy pt-2 border-t border-gray-200/50">
                    <span>{t.grandTotal} :</span>
                    <span className="text-base text-brand-green font-extrabold">
                      {grandTotal.toLocaleString()} {t.priceCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust disclaimer */}
              <p className="text-[10px] text-center text-gray-400 font-semibold flex justify-center items-center gap-1">
                <Check className="h-3.5 w-3.5 text-brand-green stroke-[3]" />
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
                <h3 className="font-display text-2xl font-black text-brand-navy">
                  {t.successTitle}
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  {t.successDesc}
                </p>
              </div>

              {/* Order Reference details */}
              <div className="mx-auto max-w-sm rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 space-y-1">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {t.successCode}
                </p>
                <p className="font-mono text-lg font-black text-brand-green tracking-widest">
                  {orderReference}
                </p>
              </div>

              {/* Customer summary */}
              <div className="mx-auto max-w-md border border-gray-100 rounded-xl p-4 text-left text-xs space-y-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                <div className="flex justify-between border-b border-gray-100 pb-1.5 font-bold text-brand-navy">
                  <span>{lang === "fr" ? "Détails de facturation" : "معلومات الفاتورة"}</span>
                  <span className="text-brand-green font-extrabold">{lang === "fr" ? "Paiement à la livraison" : "الدفع عند الاستلام"}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.formName} :</span>
                  <span className="font-semibold text-brand-navy">{fullName}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.formPhone} :</span>
                  <span className="font-mono text-brand-navy">{phone}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{lang === "fr" ? "Destination" : "جهة التوصيل"} :</span>
                  <span className="font-semibold text-brand-navy">
                    {currentWilaya ? (lang === "fr" ? currentWilaya.nameFR : currentWilaya.nameAR) : ""} - {selectedCommune}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.formDeliveryMode} :</span>
                  <span className="font-semibold text-brand-navy">
                    {deliveryType === "home" ? t.formHome : t.formDesk}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{lang === "fr" ? "Transporteur" : "شركة التوصيل"} :</span>
                  <span className="font-semibold text-brand-navy font-sans">
                    {couriersList.find(c => c.id === selectedCourier)?.[lang === "fr" ? "nameFR" : "nameAR"]}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-brand-navy pt-2 border-t border-gray-100">
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white py-3 px-4 text-xs font-bold shadow-md shadow-[#25D366]/20 hover:opacity-95 transition-opacity"
                  id="whatsapp-confirm-btn"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.117 1.05 11.487 1.05c-5.43 0-9.85 4.37-9.854 9.799 0 1.834.49 3.626 1.419 5.212l-.93 3.393 3.493-.916z"/>
                  </svg>
                  <span>{lang === "fr" ? "Accélérer via WhatsApp" : "تأكيد فوري عبر واتساب"}</span>
                </a>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 px-6 text-xs font-bold transition-all active:scale-95"
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
