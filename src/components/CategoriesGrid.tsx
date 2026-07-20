import { useRef, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { translations } from "../data";
import { Category } from "../types";
import { motion } from "motion/react";

interface CategoriesGridProps {
  lang: "fr" | "ar";
  onCategoryClick: (categoryId: string) => void;
  categories: Category[];
}

export default function CategoriesGrid({ lang, onCategoryClick, categories }: CategoriesGridProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Monitor scroll position to show/hide arrows dynamically
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    
    // For RTL, scrollLeft can be negative or positive depending on browser, let's normalize:
    const absScrollLeft = Math.abs(scrollLeft);
    const maxScroll = scrollWidth - clientWidth;
    
    if (isRTL) {
      // In RTL:
      // - scrolled to the far right (start): scrollLeft is 0. Arrow pointing left (next) should be visible, arrow pointing right (prev) hidden.
      // - scrolled to the far left (end): scrollLeft is around -maxScroll. Arrow pointing left hidden, right visible.
      setShowLeftArrow(absScrollLeft < maxScroll - 5);
      setShowRightArrow(absScrollLeft > 5);
    } else {
      // In LTR:
      // - scrolled to far left (start): scrollLeft is 0. Arrow pointing left hidden, right visible.
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < maxScroll - 5);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      // Run once initially
      handleScroll();
    }
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", handleScroll);
      }
    };
  }, [categories, lang]);

  const scroll = (direction: "prev" | "next") => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.querySelector(".category-card-item")?.clientWidth || 300;
    const gap = 24; // gap-6
    const scrollAmount = (cardWidth + gap);
    
    // Determine horizontal multiplier based on LTR/RTL
    // In RTL, "next" moves to the left (negative offset), "prev" moves to the right (positive offset)
    let finalAmount = 0;
    if (isRTL) {
      finalAmount = direction === "next" ? -scrollAmount : scrollAmount;
    } else {
      finalAmount = direction === "next" ? scrollAmount : -scrollAmount;
    }

    sliderRef.current.scrollBy({
      left: finalAmount,
      behavior: "smooth"
    });
  };

  const isSlider = categories.length > 3;

  return (
    <section className="bg-white dark:bg-[#0f0f10] py-12 sm:py-16 overflow-hidden" id="categories-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          className="mb-8 flex flex-col justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 md:flex-row md:items-end gap-4"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
              {lang === "fr" ? "NOS CATÉGORIES" : "تصفح أقسامنا"}
            </p>
            <h3 className="font-arabic text-2xl font-black text-brand-navy dark:text-white tracking-tight sm:text-3xl mt-1">
              {lang === "fr" ? "Découvrez Nos Univers" : "منتجات مختارة بجودة مضمونة"}
            </h3>
          </div>

          {/* Slider Controls (Visible only if slider layout is active) */}
          {isSlider && (
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <button
                onClick={() => scroll("prev")}
                disabled={isRTL ? !showRightArrow : !showLeftArrow}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-navy dark:text-zinc-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-850 hover:border-brand-green disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Category"
              >
                {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button
                onClick={() => scroll("next")}
                disabled={isRTL ? !showLeftArrow : !showRightArrow}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-navy dark:text-zinc-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-850 hover:border-brand-green disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Category"
              >
                {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {isSlider ? (
          /* Slider Layout */
          <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-6 px-1"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {categories.map((category, index) => {
              const name = lang === "fr" ? category.nameFR : category.nameAR;
              const isFirst = index === 0;

              return (
                <motion.div
                  key={category.id}
                  onClick={() => onCategoryClick(category.id)}
                  className="category-card-item group relative aspect-[4/5] w-[280px] sm:w-[320px] lg:w-[360px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 dark:bg-[#1e1e1e] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  id={`cat-card-${category.id}`}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
                  <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <h3 className={`text-white font-bold tracking-tight text-lg sm:text-xl ${isRTL ? "font-arabic font-black text-right" : "font-sans font-extrabold text-left"} line-clamp-1`}>
                      {name}
                    </h3>

                    <div 
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isFirst 
                          ? "bg-brand-green text-white group-hover:bg-brand-green-dark" 
                          : "bg-white dark:bg-[#1e1e1e] text-brand-navy dark:text-zinc-100 group-hover:bg-brand-green group-hover:text-white"
                      }`}
                    >
                      {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Standard 3-Column Grid Layout */
          <div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {categories.map((category, index) => {
              const name = lang === "fr" ? category.nameFR : category.nameAR;
              const isFirst = index === 0;

              return (
                <div
                  key={category.id}
                  onClick={() => onCategoryClick(category.id)}
                  className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 dark:bg-[#1e1e1e] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  id={`cat-card-${category.id}`}
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
                  <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <h3 className={`text-white font-bold tracking-tight text-xl sm:text-2xl ${isRTL ? "font-arabic font-black text-right" : "font-sans font-extrabold text-left"}`}>
                      {name}
                    </h3>

                    <div 
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isFirst 
                          ? "bg-brand-green text-white group-hover:bg-brand-green-dark" 
                          : "bg-white dark:bg-[#1e1e1e] text-brand-navy dark:text-zinc-100 group-hover:bg-brand-green group-hover:text-white"
                      }`}
                    >
                      {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
