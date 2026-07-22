import { motion } from "motion/react";
import { Mail, Truck } from "lucide-react";

interface FloatingContactProps {
  lang: "fr" | "ar";
  isAlgerian?: boolean;
  onTrackingClick: () => void;
}

export default function FloatingContact({ lang, isAlgerian = true, onTrackingClick }: FloatingContactProps) {
  // Read WhatsApp and Email from environment variables with safe defaults
  const whatsappNumber = ((import.meta as any).env?.VITE_MERCHANT_WHATSAPP || "+213781913776").replace(/\s+/g, "");
  const merchantEmail = (import.meta as any).env?.VITE_MERCHANT_EMAIL || "litimahmed67@gmail.com";

  // Build localized message text for WhatsApp
  const whatsappMessage = lang === "ar"
    ? "السلام عليكم، أريد الاستفسار عن المنتجات المتوفرة في المتجر..."
    : "Bonjour, je souhaite me renseigner sur les produits de la boutique...";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailUrl = `mailto:${merchantEmail}?subject=${encodeURIComponent(
    lang === "ar" ? "استفسار من متجر تيكاتكوم" : "Demande d'information - TIKATKOM"
  )}`;

  // Labels for tooltips
  const whatsappTooltip = lang === "ar" ? "تواصل معنا عبر واتساب" : "Contactez-nous sur WhatsApp";
  const emailTooltip = lang === "ar" ? "أرسل لنا بريداً إلكترونياً" : "Envoyez-nous un e-mail";
  const trackingText = lang === "ar" ? "تتبع طلبيتك" : "Suivre mon colis";

  return (
    <>
      {/* LEFT SIDE: WhatsApp & Email Contact Options */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3.5 items-center select-none" id="floating-contact-left-container">
        {/* WhatsApp Button */}
        <div className="group relative">
          {/* Tooltip on the Right of the button */}
          <span 
            className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900/90 dark:bg-zinc-800/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-sm opacity-0 scale-95 transition-all duration-200 origin-left pointer-events-none group-hover:opacity-100 group-hover:scale-100 font-sans ${
              lang === "ar" ? "font-arabic" : ""
            }`}
          >
            {whatsappTooltip}
          </span>
          
          {/* Floating Button Action */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow duration-200 border border-emerald-400/20"
            id="btn-whatsapp-floating"
            aria-label="WhatsApp"
          >
            {/* Custom WhatsApp Vector Icon */}
            <svg 
              className="h-6 w-6 fill-current" 
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.a>
        </div>

        {/* Email Button */}
        <div className="group relative">
          {/* Tooltip on the Right of the button */}
          <span 
            className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900/90 dark:bg-zinc-800/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-sm opacity-0 scale-95 transition-all duration-200 origin-left pointer-events-none group-hover:opacity-100 group-hover:scale-100 font-sans ${
              lang === "ar" ? "font-arabic" : ""
            }`}
          >
            {emailTooltip}
          </span>
          
          {/* Floating Button Action */}
          <motion.a
            href={emailUrl}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-950/20 hover:shadow-slate-950/30 transition-shadow duration-200 border border-slate-800/30 dark:bg-white dark:text-slate-950 dark:border-white/10"
            id="btn-email-floating"
            aria-label="Email"
          >
            <Mail className="h-5 w-5 stroke-[2.5]" />
          </motion.a>
        </div>
      </div>

      {/* RIGHT SIDE: Dedicated Tracking Search Button (Only for Algerian domestic visitors) */}
      {isAlgerian && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3.5 items-center select-none" id="floating-contact-right-container">
          <div className="group relative">
            <motion.button
              onClick={onTrackingClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-12 items-center gap-2 rounded-full bg-brand-green text-white px-4 shadow-lg shadow-brand-green/25 hover:shadow-brand-green/40 transition-all duration-200 border border-brand-green/30 cursor-pointer"
              id="btn-tracking-floating"
              aria-label="Track Parcel"
            >
              <Truck className="h-5 w-5 stroke-[2.5]" />
              <span className={`text-xs font-black tracking-wider ${lang === "ar" ? "font-arabic" : ""}`}>
                {trackingText}
              </span>
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
}
