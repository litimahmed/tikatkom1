import { useRef, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "../types";
import { digitalCategories as defaultDigitalCategories } from "../data";
import { motion } from "motion/react";

interface DigitalProductProps {
  lang: "fr" | "ar";
  onCategoryClick: (categoryId: string) => void;
  onViewAllClick: () => void;
  categories?: Category[];
}

export default function DigitalProduct({
  lang,
  onCategoryClick,
  onViewAllClick,
  categories = defaultDigitalCategories,
}: DigitalProductProps) {
  if (!categories || categories.length === 0) return null;

  const isRTL = lang === "ar";
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const absScrollLeft = Math.abs(scrollLeft);
    const maxScroll = scrollWidth - clientWidth;
    
    if (isRTL) {
      setShowLeftArrow(absScrollLeft < maxScroll - 5);
      setShowRightArrow(absScrollLeft > 5);
    } else {
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < maxScroll - 5);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", handleScroll);
      }
    };
  }, [categories, lang]);

  const isSlider = categories.length > 3;

  const scrollByAmount = (amount: number) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: amount,
      behavior: "smooth"
    });
  };

  // Auto-slide effect
  useEffect(() => {
    if (!isSlider || isPaused) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const absScrollLeft = Math.abs(scrollLeft);

      const cardWidth = sliderRef.current.querySelector(".digital-cat-card-item")?.clientWidth || 300;
      const step = cardWidth + 24;

      if (isRTL) {
        if (absScrollLeft >= maxScroll - 15) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollByAmount(-step);
        }
      } else {
        if (scrollLeft >= maxScroll - 15) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollByAmount(step);
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [categories, lang, isPaused, isSlider, isRTL]);

  return (
    <section className="bg-white dark:bg-[#0f0f10] py-12 sm:py-16 overflow-hidden" id="digital-categories-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div 
          className="mb-8 flex flex-col justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 md:flex-row md:items-end gap-4"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
              {lang === "fr" ? "NOS CATÉGORIES NUMÉRIQUES" : "أقسام المنتجات الرقمية"}
            </p>
            <h3 className="font-arabic text-2xl font-black text-brand-navy dark:text-white tracking-tight sm:text-3xl mt-1">
              {lang === "fr" ? "Abonnements & Services Numériques" : "تصفح أقسام الخدمات والمنتجات الرقمية"}
            </h3>
          </div>

          <button
            onClick={onViewAllClick}
            className="group flex items-center gap-1.5 text-xs font-black text-brand-navy dark:text-zinc-200 hover:text-brand-green transition-colors focus:outline-none cursor-pointer"
            id="digital-view-all-btn"
          >
            <span>{lang === "fr" ? "Voir tout" : "عرض الكل"}</span>
            {isRTL ? (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>

        {/* Digital Categories Slider / Grid */}
        {isSlider ? (
          <div 
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left Chevron Button */}
            <button
              onClick={() => {
                const cardWidth = sliderRef.current?.querySelector(".digital-cat-card-item")?.clientWidth || 300;
                scrollByAmount(-(cardWidth + 24));
              }}
              disabled={!showLeftArrow}
              className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 dark:bg-zinc-900/95 text-brand-navy dark:text-white shadow-xl border border-gray-200 dark:border-zinc-800 backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
              aria-label="Scroll Left"
              id="digital-cat-slider-left-btn"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={() => {
                const cardWidth = sliderRef.current?.querySelector(".digital-cat-card-item")?.clientWidth || 300;
                scrollByAmount(cardWidth + 24);
              }}
              disabled={!showRightArrow}
              className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 dark:bg-zinc-900/95 text-brand-navy dark:text-white shadow-xl border border-gray-200 dark:border-zinc-800 backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
              aria-label="Scroll Right"
              id="digital-cat-slider-right-btn"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slider Track */}
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
                    className="digital-cat-card-item group relative aspect-[4/5] w-[280px] sm:w-[320px] lg:w-[360px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 dark:bg-[#1e1e1e] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                    id={`digital-cat-card-${category.id}`}
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
          </div>
        ) : (
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
                  id={`digital-cat-card-${category.id}`}
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
