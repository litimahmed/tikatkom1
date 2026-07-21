import React, { useState, useEffect } from "react";
import { X, Search, MapPin, Truck, CheckCircle2, Clock, AlertCircle, Calendar, DollarSign, Package } from "lucide-react";
import { motion } from "motion/react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "fr" | "ar";
  initialTrackingCode?: string;
}

export default function TrackingModal({ isOpen, onClose, lang, initialTrackingCode = "" }: TrackingModalProps) {
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);

  const isRTL = lang === "ar";

  // Pre-populate if initialTrackingCode is passed
  useEffect(() => {
    if (isOpen) {
      if (initialTrackingCode) {
        setTrackingCode(initialTrackingCode);
        handleSearch(initialTrackingCode);
      } else {
        setTrackingCode("");
        setTrackingData(null);
        setError(null);
      }
    }
  }, [isOpen, initialTrackingCode]);

  const handleSearch = async (codeToSearch: string) => {
    const code = codeToSearch.trim();
    if (!code) {
      setError(lang === "ar" ? "يرجى إدخال رمز التتبع." : "Veuillez entrer un code de suivi.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const metaEnv = (import.meta as any).env;
      const apiBase = (metaEnv && metaEnv.VITE_API_URL) || "";
      const response = await fetch(`${apiBase}/api/zrexpress/tracking/${encodeURIComponent(code)}`);
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setTrackingData(result.data);
      } else {
        setError(
          result.error ||
            (lang === "ar"
              ? "رمز التتبع غير موجود. يرجى التأكد من الرمز والمحاولة مجدداً."
              : "Code de suivi introuvable. Veuillez vérifier et réessayer.")
        );
      }
    } catch (err) {
      console.error("[Tracking Search Error]:", err);
      setError(
        lang === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً."
          : "Une erreur est survenue lors de la communication avec le serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Localized Labels
  const labels = {
    title: lang === "ar" ? "تتبع شحنتك" : "Suivi de colis",
    subtitle: lang === "ar" ? "زد آر إكسبريس" : "ZR Express Algeria",
    placeholder: lang === "ar" ? "أدخل رمز التتبع (مثال: ZR-1048593)" : "Ex: ZR-1048593",
    searchBtn: lang === "ar" ? "تتبع" : "Suivre",
    orderRef: lang === "ar" ? "رقم الطلب" : "Réf. commande",
    recipient: lang === "ar" ? "المستلم" : "Destinataire",
    destination: lang === "ar" ? "الجهة" : "Destination",
    deliveryMode: lang === "ar" ? "طريقة التوصيل" : "Mode de livraison",
    totalAmount: lang === "ar" ? "إجمالي المبلغ" : "Montant total",
    home: lang === "ar" ? "إلى باب المنزل" : "À domicile",
    desk: lang === "ar" ? "مكتب شركة التوصيل" : "Stop Desk / Point relais",
    timelineTitle: lang === "ar" ? "حالة الشحنة الحالية" : "Historique de livraison",
    dateLabel: lang === "ar" ? "التاريخ" : "Date",
    timeLabel: lang === "ar" ? "الوقت" : "Heure",
    noDataYet: lang === "ar" ? "أدخل رمز التتبع الخاص بك لرؤية حالة طلبك وتفاصيل التوصيل مباشرة." : "Entrez votre code de suivi pour voir l'état de votre livraison en temps réel.",
    closeBtn: lang === "ar" ? "إغلاق" : "Fermer",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "transit":
        return <Truck className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "delivering":
        return <Package className="h-5 w-5 text-emerald-500 animate-bounce" />;
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-brand-green" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
      case "transit":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30";
      case "delivering":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30";
      case "delivered":
        return "bg-green-100 dark:bg-green-950/40 text-brand-green dark:text-green-400 border-green-200/50 dark:border-green-900/30";
      default:
        return "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200/50 dark:border-zinc-700/50";
    }
  };

  const getStatusLabel = (status: string) => {
    if (lang === "ar") {
      switch (status) {
        case "received": return "تم تسجيل الطلب";
        case "transit": return "قيد النقل";
        case "delivering": return "مع الموزع للتسليم";
        case "delivered": return "تم التسليم بنجاح";
        default: return "قيد المعالجة";
      }
    } else {
      switch (status) {
        case "received": return "Enregistré";
        case "transit": return "En transit";
        case "delivering": return "En cours de livraison";
        case "delivered": return "Livré";
        default: return "En traitement";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop with elegant blur */}
      <div 
        className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] border border-transparent dark:border-[#2a2a2a] shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
        id="tracking-modal-container"
      >
        {/* Header brand strip */}
        <div className="bg-gradient-to-r from-brand-green to-emerald-600 h-2 w-full"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} rounded-full p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-[#262626] hover:text-gray-700 dark:hover:text-zinc-300 transition-colors cursor-pointer`}
          aria-label="Close"
          id="close-tracking-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Content wrapper */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-brand-navy dark:text-white sm:text-xl">
                {labels.title}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                {labels.subtitle} 🇩🇿
              </p>
            </div>
          </div>

          {/* Search form box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(trackingCode);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4" : "left-4"} h-4.5 w-4.5 text-gray-400 dark:text-zinc-500`} />
              <input
                type="text"
                placeholder={labels.placeholder}
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                disabled={isLoading}
                className={`w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#1f1f1f] py-3.5 ${
                  isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
                } text-sm font-semibold text-brand-navy dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:border-brand-green focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-brand-green outline-none transition-all`}
                id="tracking-input-field"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-brand-green hover:bg-brand-green-hover text-white px-6 text-sm font-black shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              id="tracking-search-btn"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>{labels.searchBtn}</span>
              )}
            </button>
          </form>

          {/* Validation error msg */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-xl border border-rose-200/50 dark:border-rose-950/20 bg-rose-50 dark:bg-rose-950/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Results Display */}
          {trackingData ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Order Metadata summary card */}
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/10 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                      {lang === "ar" ? "رقم الشحنة (ZR)" : "Code Suivi (ZR)"}
                    </p>
                    <p className="font-mono text-base font-black text-brand-navy dark:text-white tracking-wider">
                      {trackingData.trackingNumber}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(trackingData.status)}`}>
                    {getStatusIcon(trackingData.status)}
                    <span>{getStatusLabel(trackingData.status)}</span>
                  </span>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium">{labels.orderRef}</span>
                    <p className="font-mono font-black text-brand-navy dark:text-zinc-200">{trackingData.orderId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium">{labels.recipient}</span>
                    <p className="font-semibold text-brand-navy dark:text-zinc-200">{trackingData.customerName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium">{labels.destination}</span>
                    <p className="font-semibold text-brand-navy dark:text-zinc-200">{trackingData.wilaya} - {trackingData.commune}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 dark:text-zinc-500 font-medium">{labels.deliveryMode}</span>
                    <p className="font-semibold text-brand-navy dark:text-zinc-200">
                      {trackingData.deliveryType === "home" ? labels.home : labels.desk}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-gray-100 dark:border-zinc-800/60 pt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold">{labels.totalAmount}</span>
                    <span className="text-sm text-brand-green font-extrabold font-mono">
                      {Number(trackingData.grandTotal).toLocaleString()} {lang === "ar" ? "د.ج" : "DA"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery History Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy dark:text-zinc-400">
                  {labels.timelineTitle}
                </h4>

                <div className="relative border-l-2 border-gray-100 dark:border-zinc-800 mr-2 ml-2 pr-4 pl-4 space-y-6">
                  {trackingData.history.map((event: any, index: number) => {
                    const eventDate = new Date(event.time);
                    const formattedDate = eventDate.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-FR", {
                      day: "numeric",
                      month: "short"
                    });
                    const formattedTime = eventDate.toLocaleTimeString(lang === "ar" ? "ar-DZ" : "fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    const isLast = index === trackingData.history.length - 1;

                    return (
                      <div key={index} className="relative">
                        {/* Timeline node node indicator */}
                        <span className={`absolute top-1.5 ${
                          isRTL ? "-right-[27px]" : "-left-[27px]"
                        } flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white dark:bg-[#1a1a1a] transition-all ${
                          isLast 
                            ? "border-brand-green scale-110 shadow-md shadow-brand-green/20" 
                            : "border-gray-300 dark:border-zinc-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isLast ? "bg-brand-green animate-ping" : "bg-gray-300 dark:bg-zinc-700"}`} />
                        </span>

                        {/* Event text */}
                        <div className="space-y-1">
                          <p className={`text-xs font-extrabold ${isLast ? "text-brand-green" : "text-brand-navy dark:text-zinc-300"}`}>
                            {lang === "ar" ? event.labelAR : event.labelFR}
                          </p>
                          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-zinc-400">
                            {lang === "ar" ? event.descAR : event.descFR}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-zinc-500 font-bold font-sans">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              {formattedDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Empty/No search state */
            !isLoading && (
              <div className="text-center py-8 text-gray-400 dark:text-zinc-500 text-sm font-semibold max-w-sm mx-auto space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-300">
                  <Package className="h-6 w-6" />
                </div>
                <p className="leading-relaxed text-xs">
                  {labels.noDataYet}
                </p>
              </div>
            )
          )}
        </div>

        {/* Action strip footer */}
        <div className="bg-gray-50 dark:bg-[#202020] border-t border-gray-100 dark:border-[#2a2a2a] p-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 py-2.5 px-6 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            id="close-tracking-footer-btn"
          >
            {labels.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
