import { translations } from "../data";

interface FooterProps {
  lang: "fr" | "ar";
}

export default function Footer({ lang }: FooterProps) {
  const isRTL = lang === "ar";
  
  return (
    <footer className="w-full bg-brand-navy dark:bg-[#121212] border-t border-brand-navy-light dark:border-[#2a2a2a] py-6 text-gray-400">
      <div 
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* Left Side: Copyright */}
        <div className="text-center sm:text-left">
          <p>© 2026 TIKATKOM. Tous droits réservés.</p>
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-6">
          <a 
            href="#mentions" 
            className="hover:text-brand-green transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            {lang === "fr" ? "Mentions Légales" : "الشروط القانونية"}
          </a>
          <span className="text-gray-600">|</span>
          <a 
            href="#contact" 
            className="hover:text-brand-green transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            {lang === "fr" ? "Contact & Support" : "اتصل بنا"}
          </a>
        </div>
      </div>
    </footer>
  );
}
