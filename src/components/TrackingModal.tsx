import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Truck, CheckCircle2, Clock, Package, MapPin, AlertCircle } from "lucide-react";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "fr" | "ar";
}

interface TrackingHistoryItem {
  status: string;
  date: string;
  desc: string;
}

interface TrackingData {
  trackingCode: string;
  orderId: string;
  clientName: string;
  productName: string;
  total: number;
  wilayaName: string;
  commune: string;
  deliveryType: string;
  currentStatus: string;
  history: TrackingHistoryItem[];
}

export default function TrackingModal({ isOpen, onClose, lang }: TrackingModalProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingData | null>(null);

  const isRTL = lang === "ar";

  const t = {
    title: lang === "fr" ? "Suivi de Colis" : "تتبع طلبيتك",
    subtitle: lang === "fr" ? "Entrez votre code de suivi (ex: ZR123456789) ou référence de commande" : "أدخل رقم تتبع الطرد الخاص بك أو رقم الطلب لمعرفة حالة التوصيل",
    placeholder: lang === "fr" ? "Ex: ZR772839182 ou TKT-12345" : "مثال: ZR772839182 أو TKT-12345",
    btnSearch: lang === "fr" ? "Rechercher" : "بحث سريع",
    btnSearching: lang === "fr" ? "Recherche..." : "جاري البحث...",
    orderInfo: lang === "fr" ? "Détails de l'envoi" : "تفاصيل الشحنة",
    client: lang === "fr" ? "Destinataire" : "المستلم",
    destination: lang === "fr" ? "Destination" : "جهة التوصيل",
    product: lang === "fr" ? "Article" : "المنتج",
    price: lang === "fr" ? "Montant à payer" : "المبلغ عند الاستلام",
    statusLabel: lang === "fr" ? "Statut Actuel" : "الحالة الحالية",
    historyLabel: lang === "fr" ? "Historique d'expédition" : "مسار الشحنة",
    emptyError: lang === "fr" ? "Veuillez entrer un code de suivi." : "يرجى إدخال رمز التتبع أولاً.",
    trialTip: lang === "fr" ? "Astuce : Entrez '123' ou n'importe quel code commençant par 'ZR' pour tester !" : "تلميح: أدخل '123' أو أي كود يبدأ بـ 'ZR' لتجربة نظام التتبع السريع !",
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setError(t.emptyError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingCode: trackingCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || (lang === "fr" ? "Code de suivi non trouvé." : "رمز التتبع غير موجود. يرجى التحقق وإعادة المحاولة."));
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError(lang === "fr" ? "Une erreur s'est produite lors de la connexion au serveur." : "حدث خطأ أثناء الاتصال بالخادم الرئيسي.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livré":
        return "bg-emerald-500 text-white";
      case "En cours de livraison":
        return "bg-blue-500 text-white";
      case "Expédié":
        return "bg-amber-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  // Safe Date Formatter helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "ar-DZ", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="tracking-modal-root">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative border-b border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-center">
          <h2 className="font-display text-lg font-black text-brand-navy dark:text-white leading-tight text-center">
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-gray-50 dark:bg-zinc-800/60 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              isRTL ? "left-6" : "right-6"
            }`}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tracking Search Input Form */}
          <form onSubmit={handleTrack} className="space-y-3" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400">
              {t.subtitle}
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 ${isRTL ? "right-4" : "left-4"}`} />
                <input
                  type="text"
                  placeholder={t.placeholder}
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className={`w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850 py-3 text-sm text-brand-navy dark:text-white placeholder-gray-400 focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all font-mono font-bold uppercase tracking-wider ${
                    isRTL ? "pr-11 pl-4 text-right" : "pl-11 pr-4 text-left"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white px-5 text-xs font-black shadow-md shadow-brand-green/10 transition-all active:scale-95 disabled:opacity-65 cursor-pointer flex items-center justify-center gap-1 min-w-[100px]"
              >
                {isLoading ? t.btnSearching : t.btnSearch}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div 
              className={`rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-start gap-3 ${
                isRTL ? "flex-row-reverse text-right" : "flex-row text-left"
              }`}
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Results Block */}
          {result && (
            <div className="space-y-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
              
              {/* Statut header card */}
              <div className="rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 text-white p-5 shadow-lg relative overflow-hidden border border-brand-navy/10">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                  <Truck className="h-40 w-40" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className={`flex justify-between items-start ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{t.statusLabel}</p>
                      <h4 className="text-xl font-black font-display tracking-tight text-brand-green">
                        {result.currentStatus}
                      </h4>
                    </div>
                    <span className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-black tracking-wider font-mono">
                      {result.trackingCode}
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs ${isRTL ? "text-right" : "text-left"}`}>
                    <div>
                      <span className="text-gray-400 block mb-0.5 font-bold">{t.client}</span>
                      <span className="font-extrabold">{result.clientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5 font-bold">{t.destination}</span>
                      <span className="font-extrabold">{result.wilayaName} - {result.commune}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details list */}
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 space-y-3 bg-gray-50/50 dark:bg-zinc-850/20 text-xs">
                <h4 className={`font-display font-black text-brand-navy dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.orderInfo}
                </h4>
                <div className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 font-bold">{t.product} :</span>
                  <span className="font-black text-brand-navy dark:text-white">{result.productName}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 font-bold">{lang === "fr" ? "Référence de commande" : "مرجع الطلب"} :</span>
                  <span className="font-mono font-black text-brand-navy dark:text-white">{result.orderId}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 font-bold">{t.price} :</span>
                  <span className="font-black text-brand-green text-sm">{result.total.toLocaleString()} DA</span>
                </div>
                <div className={`flex justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 font-bold">{lang === "fr" ? "Type de livraison" : "نوع التوصيل"} :</span>
                  <span className="font-extrabold text-brand-navy dark:text-zinc-200">
                    {result.deliveryType === "home" 
                      ? (lang === "fr" ? "À domicile" : "توصيل للمنزل") 
                      : (lang === "fr" ? "Stopdesk / Relais" : "استلام من المكتب")}
                  </span>
                </div>
              </div>

              {/* Stepper Timeline Tracker */}
              <div className="space-y-4">
                <h4 className={`font-display text-sm font-black text-brand-navy dark:text-white flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
                  <Clock className="h-4 w-4 text-brand-green" />
                  <span>{t.historyLabel}</span>
                </h4>

                <div className="relative border-l border-gray-100 dark:border-zinc-800 pl-6 space-y-6 ml-3" style={{ direction: "ltr" }}>
                  {result.history.map((step, idx) => {
                    const isLatest = idx === result.history.length - 1;
                    return (
                      <div key={idx} className="relative">
                        {/* Stepper bullet indicator */}
                        <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          isLatest 
                            ? "border-brand-green bg-white text-brand-green" 
                            : "border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isLatest ? "bg-brand-green animate-ping" : "bg-gray-400"}`} />
                        </span>

                        {/* Step Details */}
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between gap-4">
                            <h5 className={`font-bold text-xs ${isLatest ? "text-brand-green font-black" : "text-gray-700 dark:text-zinc-300"}`}>
                              {lang === "fr" ? step.status : step.status}
                            </h5>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {formatDate(step.date)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
