import { X, Truck, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { translations } from "../data";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "fr" | "ar";
}

export default function ShippingModal({ isOpen, onClose, lang }: ShippingModalProps) {
  if (!isOpen) return null;

  const t = translations[lang];
  const isRTL = lang === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <div 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] border border-transparent dark:border-[#2a2a2a] shadow-2xl transition-all duration-300"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
        id="shipping-info-modal"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-brand-green to-emerald-600 h-2 w-full"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} rounded-full p-1.5 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-[#262626] hover:text-gray-700 dark:hover:text-zinc-300 transition-colors cursor-pointer`}
          aria-label="Close"
          id="close-shipping-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10">
              <Truck className="h-6 w-6 text-brand-green" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-brand-navy dark:text-white sm:text-xl">
                {t.shippingTitle}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                Yalidine Express Algeria 🇩🇿
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-300 mb-6">
            {t.shippingDesc}
          </p>

          {/* Details points */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy dark:text-white">
                  {lang === "fr" ? "Couverture complète" : "تغطية شاملة لكل مكان"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {lang === "fr" 
                    ? "Livraison disponible dans toutes les communes des 58 Wilayas." 
                    : "التوصيل متوفر لجميع بلديات الولايات الثمانية والخمسين."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy dark:text-white">
                  {lang === "fr" ? "Paiement à la réception (COD)" : "الدفع الآمن عند الاستلام"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {lang === "fr"
                    ? "Ne payez rien à l'avance. Payez l'agent de livraison en espèces après avoir inspecté votre product."
                    : "لا تدفع أي شيء مسبقاً. الدفع يكون نقداً لقبل موظف التوصيل بعد معاينة وفحص طلبك."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <HelpCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy dark:text-white">
                  {lang === "fr" ? "Frais de livraison optimisés" : "أسعار شحن جد مدروسة"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {lang === "fr"
                    ? "Tarifs de livraison à partir de 250 DA selon votre Wilaya et l'option choisie (bureau ou domicile)."
                    : "تبدأ أسعار الشحن من 250 دج فقط حسب ولايتك وخيار الشحن المختار (المكتب أو باب البيت)."}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-brand-green py-3 px-4 text-sm font-bold text-white shadow-lg shadow-brand-green/20 transition-all hover:bg-brand-green-hover active:scale-95 cursor-pointer"
              id="close-shipping-btn"
            >
              {t.shippingClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
