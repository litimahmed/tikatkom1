import { ArrowRight, ArrowLeft } from "lucide-react";
import { translations } from "../data";
import { Category } from "../types";
import { motion } from "motion/react";
import AutoSlider from "./AutoSlider";

interface CategoriesGridProps {
  lang: "fr" | "ar";
  onCategoryClick: (categoryId: string) => void;
  categories: Category[];
}

export default function CategoriesGrid({ lang, onCategoryClick, categories }: CategoriesGridProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  const renderCategoryCard = (category: Category, index: number) => {
    const name = lang === "fr" ? category.nameFR : category.nameAR;
    const isFirst = index === 0;

    return (
      <motion.div
        onClick={() => onCategoryClick(category.id)}
        className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 dark:bg-[#1e1e1e] transition-all duration-500 hover:shadow-xl"
        id={`cat-card-${category.id}`}
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
    <section className="bg-white dark:bg-[#0f0f10] py-8 sm:py-16 overflow-hidden" id="categories-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          className="mb-5 sm:mb-8 flex flex-col justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 sm:pb-4 md:flex-row md:items-end gap-2 sm:gap-4"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
              {lang === "fr" ? "NOS CATÉGORIES" : "تصفح أقسامنا"}
            </p>
            <h3 className="font-arabic text-xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5 sm:mt-1">
              {lang === "fr" ? "Découvrez Nos Univers" : "منتجات مختارة بجودة مضمونة"}
            </h3>
          </div>
        </div>

        {/* Realtime Responsive AutoSlider */}
        <AutoSlider
          items={categories}
          renderItem={renderCategoryCard}
          lang={lang}
          idPrefix="categories-slider"
          visibleDesktop={3}
          visibleTablet={2}
          visibleMobile={1}
          autoPlayInterval={3000}
        />
      </div>
    </section>
  );
}
