import { Product, Category } from "../types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import AutoSlider from "./AutoSlider";

interface DigitalBentoGridProps {
  lang: "fr" | "ar";
  onExploreClick?: (category?: string) => void;
  onOpenDigitalStore?: (subcategoryId?: string) => void;
  onSelectProduct?: (product: Product) => void;
  categories?: Category[];
}

interface DigitalCategoryItem {
  id: string;
  nameFR: string;
  nameAR: string;
  image: string;
}

export default function DigitalBentoGrid({ lang, onExploreClick, onOpenDigitalStore, categories = [] }: DigitalBentoGridProps) {
  const isRTL = lang === "ar";

  const defaultDigitalCategories: DigitalCategoryItem[] = [
    {
      id: "vip_subscriptions",
      nameFR: "Abonnements VIP",
      nameAR: "اشتراكات وتطبيقات VIP",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "activation_keys",
      nameFR: "Clés & Licences",
      nameAR: "تفعيل وتسليم تلقائي",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "ai_tools",
      nameFR: "Outils IA & Web",
      nameAR: "أدوات وحسابات AI",
      image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "ebooks_courses",
      nameFR: "E-Books & Formations",
      nameAR: "مكتبة التعلم والدورات",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "gift_cards",
      nameFR: "Cartes Cadeaux",
      nameAR: "بطاقات هدايا وشحن",
      image: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "design_templates",
      nameFR: "Templates & Design",
      nameAR: "قوالب وتصاميم جاهزة",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Dynamic WooCommerce digital categories (whose slug starts with "digital" or has isDigital = true)
  const wpDigitalCats: DigitalCategoryItem[] = categories
    .filter(c => c.isDigital || c.id.toLowerCase().startsWith("digital") || (c.slug && c.slug.toLowerCase().startsWith("digital")))
    .map(c => ({
      id: c.id,
      nameFR: c.nameFR,
      nameAR: c.nameAR,
      image: c.image && !c.image.includes("placehold.co") ? c.image : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    }));

  const digitalCategories = wpDigitalCats.length > 0 ? wpDigitalCats : defaultDigitalCategories;

  const handleCardClick = (subcatId: string) => {
    if (onOpenDigitalStore) {
      onOpenDigitalStore(subcatId);
    } else if (onExploreClick) {
      onExploreClick("digital");
    }
  };

  const renderDigitalCategoryCard = (category: DigitalCategoryItem, index: number) => {
    const name = isRTL ? category.nameAR : category.nameFR;
    const isFirst = index === 0;

    return (
      <motion.div
        onClick={() => handleCardClick(category.id)}
        className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 dark:bg-[#1e1e1e] transition-all duration-500 hover:shadow-xl"
        id={`digital-cat-card-${category.id}`}
        whileHover={{ y: -4 }}
      >
        {/* Background Image */}
        <img
          src={category.image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Smooth Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Bottom Content Row */}
        <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-8 flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <h3 className={`text-white font-bold tracking-tight text-base sm:text-xl ${isRTL ? "font-arabic font-black text-right" : "font-sans font-extrabold text-left"} line-clamp-1`}>
            {name}
          </h3>

          <div 
            className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              isFirst 
                ? "bg-brand-green text-white group-hover:bg-brand-green-dark" 
                : "bg-white dark:bg-[#1e1e1e] text-brand-navy dark:text-zinc-100 group-hover:bg-brand-green group-hover:text-white"
            }`}
          >
            {isRTL ? <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="bg-white dark:bg-[#0f0f10] py-8 sm:py-16 overflow-hidden" id="digital-bento-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div 
          className="mb-5 sm:mb-8 flex flex-col justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 sm:pb-4 md:flex-row md:items-end gap-2 sm:gap-4"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
              {isRTL ? "خدمات ومنتجات رقمية" : "PRODUITS NUMÉRIQUES"}
            </p>
            <h3 className="font-arabic text-xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5 sm:mt-1">
              {isRTL ? "تصفح الأقسام الرقمية" : "Découvrez Nos Catégories Numériques"}
            </h3>
          </div>

          {(onOpenDigitalStore || onExploreClick) && (
            <button
              onClick={() => handleCardClick("all")}
              className="group flex items-center gap-2 text-xs sm:text-sm font-black text-brand-navy dark:text-zinc-200 hover:text-brand-green transition-colors focus:outline-none cursor-pointer self-start md:self-auto"
            >
              <span>{isRTL ? "عرض الكل" : "Voir tout"}</span>
              {isRTL ? (
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          )}
        </div>

        {/* Realtime Responsive AutoSlider matching CategoriesGrid */}
        <AutoSlider
          items={digitalCategories}
          renderItem={renderDigitalCategoryCard}
          lang={lang}
          idPrefix="digital-categories-slider"
          visibleDesktop={3}
          visibleTablet={2}
          visibleMobile={1}
          autoPlayInterval={3000}
        />

      </div>
    </section>
  );
}

