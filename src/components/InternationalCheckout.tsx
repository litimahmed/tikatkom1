import React, { useState } from "react";
import { X, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { CartItem, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface InternationalCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  lang: "fr" | "ar";
  onOrderSuccess: (orderData: { orderId: string; trackingCode: string; grandTotal: number }) => void;
}

const COUNTRIES = [
  { code: "FR", nameFR: "France", nameAR: "فرنسا" },
  { code: "CA", nameFR: "Canada", nameAR: "كندا" },
  { code: "US", nameFR: "États-Unis", nameAR: "الولايات المتحدة" },
  { code: "BE", nameFR: "Belgique", nameAR: "بلجيكا" },
  { code: "CH", nameFR: "Suisse", nameAR: "سويسرا" },
  { code: "SA", nameFR: "Arabie Saoudite", nameAR: "المملكة العربية السعودية" },
  { code: "AE", nameFR: "Émirats Arabes Unis", nameAR: "الإمارات العربية المتحدة" },
  { code: "GB", nameFR: "Royaume-Uni", nameAR: "المملكة المتحدة" },
  { code: "DE", nameFR: "Allemagne", nameAR: "ألمانيا" },
];

export default function InternationalCheckout({
  isOpen,
  onClose,
  cartItems,
  lang,
  onOrderSuccess,
}: InternationalCheckoutProps) {
  const isRTL = lang === "ar";
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "FR",
  });

  // Credit Card Interactive Fields
  const [cardData, setCardData] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
    focusedField: "",
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 1500; // Flat international shipping rate 1500 DA
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "number") {
      // Format card number with spaces (16 digits)
      value = value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (value.length > 19) return;
    } else if (name === "expiry") {
      // Format MM/YY
      value = value.replace(/\//g, "");
      if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      if (value.length > 5) return;
    } else if (name === "cvv") {
      value = value.replace(/\D/g, "");
      if (value.length > 4) return;
    }

    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Basic Validations
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.postcode) {
      setErrorMsg(lang === "fr" ? "Veuillez remplir tous les champs requis." : "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (paymentMethod === "card") {
      const cleanNum = cardData.number.replace(/\s/g, "");
      if (cleanNum.length < 15 || !cardData.expiry || cardData.cvv.length < 3) {
        setErrorMsg(
          lang === "fr"
            ? "Veuillez renseigner des informations bancaires valides."
            : "يرجى إدخال معلومات بطاقة دفع صالحة."
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Post to international endpoint
      const response = await fetch("/api/checkout-intl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country,
          paymentMethod: paymentMethod === "paypal" ? "paypal" : "stripe",
          items: cartItems.map((item) => ({
            id: item.product.id,
            title: lang === "fr" ? item.product.titleFR : item.product.titleAR,
            price: item.product.price,
            quantity: item.quantity,
          })),
          shippingFee,
          grandTotal,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to place order.");
      }

      onOrderSuccess({
        orderId: resData.orderId,
        trackingCode: resData.trackingCode,
        grandTotal,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-zinc-950 font-sans" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-brand-navy dark:text-white leading-tight">
                {lang === "fr" ? "Paiement Sécurisé" : "إتمام الدفع الآمن"}
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                SSL Secured checkout gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-full py-1.5 px-3 cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
            <span>{lang === "fr" ? "Fermer" : "إلغاء"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Checkout Form (8 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              
              {/* Step 1: Billing & Shipping Address */}
              <div>
                <h2 className="text-sm font-black text-brand-green uppercase tracking-wider mb-4">
                  {lang === "fr" ? "1. Informations de Livraison" : "1. معلومات الشحن والاتصال"}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Nom Complet *" : "الاسم الكامل *"}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={lang === "fr" ? "Ex: Jean Dupont" : "مثال: أحمد العربي"}
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Adresse Email *" : "البريد الإلكتروني *"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Téléphone (Optionnel)" : "رقم الهاتف (اختياري)"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Adresse de livraison *" : "عنوان الشحن الكامل *"}
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={lang === "fr" ? "Rue, Appartement, Bureau..." : "اسم الشارع، رقم المنزل، رقم الشقة..."}
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Ville *" : "المدينة / الولاية *"}
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Paris"
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Code Postal *" : "الرمز البريدي *"}
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      required
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="75001"
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "État / Province" : "المقاطعة / الإقليم"}
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Île-de-France"
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      {lang === "fr" ? "Pays *" : "البلد *"}
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold focus:border-brand-green focus:ring-0 dark:text-white"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {lang === "fr" ? c.nameFR : c.nameAR}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <h2 className="text-sm font-black text-brand-green uppercase tracking-wider mb-4">
                  {lang === "fr" ? "2. Mode de Paiement" : "2. وسيلة الدفع"}
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3.5 border font-bold text-xs cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-brand-green bg-brand-green/5 text-brand-green"
                        : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>{lang === "fr" ? "Carte Bancaire" : "بطاقة ائتمانية"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3.5 border font-bold text-xs cursor-pointer transition-all ${
                      paymentMethod === "paypal"
                        ? "border-brand-green bg-brand-green/5 text-brand-green"
                        : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="font-extrabold text-[#003087]">Pay</span>
                    <span className="font-extrabold text-[#0079C1]">Pal</span>
                  </button>
                </div>

                {/* Card input details */}
                <AnimatePresence mode="wait">
                  {paymentMethod === "card" ? (
                    <motion.div
                      key="card-pane"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    >
                      {/* Interactive Credit Card Widget */}
                      <div className="relative h-44 w-full rounded-2xl bg-gradient-to-br from-brand-navy via-[#1e2540] to-brand-green text-white p-5 flex flex-col justify-between shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        
                        <div className="flex justify-between items-start z-10">
                          <span className="text-xs font-black tracking-widest text-white/70">TIKATKOM CARD</span>
                          <div className="h-7 w-11 rounded-md bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
                            <span className="text-[9px] font-black tracking-widest text-yellow-400">CHIP</span>
                          </div>
                        </div>

                        <div className="my-2 z-10">
                          <div className="text-base sm:text-lg font-mono tracking-widest text-center">
                            {cardData.number || "•••• •••• •••• ••••"}
                          </div>
                        </div>

                        <div className="flex justify-between items-end z-10">
                          <div>
                            <span className="block text-[8px] uppercase font-bold text-white/50 tracking-wider">Card Holder</span>
                            <span className="block text-xs font-black tracking-wide uppercase line-clamp-1 max-w-[160px]">
                              {cardData.holder || formData.fullName || "Your Name"}
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="block text-[8px] uppercase font-bold text-white/50 tracking-wider">Expires</span>
                              <span className="block text-xs font-black font-mono">{cardData.expiry || "MM/YY"}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase font-bold text-white/50 tracking-wider">CVV</span>
                              <span className="block text-xs font-black font-mono">{cardData.cvv || "•••"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                            {lang === "fr" ? "Numéro de Carte" : "رقم البطاقة"}
                          </label>
                          <input
                            type="text"
                            name="number"
                            value={cardData.number}
                            onChange={handleCardChange}
                            placeholder="4000 1234 5678 9010"
                            className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-mono tracking-wider focus:border-brand-green focus:ring-0 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                            {lang === "fr" ? "Nom du Titulaire" : "اسم حامل البطاقة"}
                          </label>
                          <input
                            type="text"
                            name="holder"
                            value={cardData.holder}
                            onChange={(e) => setCardData((prev) => ({ ...prev, holder: e.target.value }))}
                            placeholder="JEAN DUPONT"
                            className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold uppercase focus:border-brand-green focus:ring-0 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                              {lang === "fr" ? "Date d'Exp." : "تاريخ الانتهاء"}
                            </label>
                            <input
                              type="text"
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-mono text-center focus:border-brand-green focus:ring-0 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              name="cvv"
                              value={cardData.cvv}
                              onChange={handleCardChange}
                              placeholder="•••"
                              className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-mono text-center focus:border-brand-green focus:ring-0 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="paypal-pane"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center space-y-3 bg-gray-50/50 dark:bg-zinc-900/10"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.007 8.424c.196-1.342-.112-2.39-.933-3.14-.94-.859-2.541-1.284-4.802-1.284H7.323c-.456 0-.84.329-.911.78L4.032 19.82a.5.5 0 00.493.578h4.086l1.246-7.904-.047.303c.07-.45.454-.78.91-.78h2.09c3.084 0 5.48-.86 6.136-4.526.248-1.393.111-2.457-.939-3.067z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 max-w-sm mx-auto font-semibold">
                        {lang === "fr"
                          ? "Vous allez être redirigé vers l'interface de paiement sécurisée de PayPal."
                          : "سيتم توجيهك بأمان إلى واجهة دفع PayPal لإتمام العملية."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3.5 border border-red-100 dark:border-red-950 text-xs font-semibold text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* CTA Action Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-brand-green hover:bg-brand-green-dark disabled:bg-gray-200 py-3.5 px-6 font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>
                      {lang === "fr" ? "Traitement de votre commande..." : "جاري معالجة طلبك بأمان..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {lang === "fr"
                        ? `Payer et Commander (${grandTotal.toLocaleString()} DA)`
                        : `تأكيد الدفع والطلب (${grandTotal.toLocaleString()} دج)`}
                    </span>
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Order Summary Sidebar (5 columns) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm space-y-5 sticky top-28">
              <h3 className="text-sm font-black text-brand-navy dark:text-white flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <ShoppingBag className="h-4 w-4 text-brand-green" />
                <span>{lang === "fr" ? "Résumé de la Commande" : "ملخص الطلب"}</span>
                <span className="ml-auto bg-gray-100 dark:bg-zinc-800 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-brand-navy dark:text-zinc-300">
                  {cartItems.length} {lang === "fr" ? "articles" : "منتجات"}
                </span>
              </h3>

              {/* Items List */}
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/60 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const title = lang === "fr" ? item.product.titleFR : item.product.titleAR;
                  return (
                    <div key={item.product.id} className="flex gap-3.5 py-3 first:pt-0 last:pb-0">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50">
                        <img src={item.product.image} alt={title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-brand-navy dark:text-zinc-200 line-clamp-1 leading-tight">
                          {title}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                          {lang === "fr" ? "Quantité :" : "الكمية :"} {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs font-black text-brand-navy dark:text-zinc-100">
                        {(item.product.price * item.quantity).toLocaleString()} {lang === "fr" ? "DA" : "دج"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Invoice breakdown */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-semibold">
                  <span>{lang === "fr" ? "Sous-total" : "المجموع الفرعي"}</span>
                  <span className="font-bold text-brand-navy dark:text-zinc-200">{subtotal.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-semibold">
                  <span>{lang === "fr" ? "Frais d'expédition" : "تكلفة الشحن الدولي"}</span>
                  <span className="font-bold text-brand-green">+{shippingFee.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-brand-navy dark:text-white font-black text-sm pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span>Total :</span>
                  <span className="text-base text-brand-green">{grandTotal.toLocaleString()} DA</span>
                </div>
              </div>

              {/* Trust Badge footer */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 dark:text-zinc-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-green" />
                <span>Garantie de remboursement sous 30 jours sécurisée SSL</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
