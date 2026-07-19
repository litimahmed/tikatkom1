import { ArrowRight, ArrowLeft } from "lucide-react";
import { categories, translations } from "../data";

interface CategoriesGridProps {
  lang: "fr" | "ar";
  onCategoryClick: (categoryId: string) => void;
}

export default function CategoriesGrid({ lang, onCategoryClick }: CategoriesGridProps) {
  const t = translations[lang];
  const isRTL = lang === "ar";

  return (
    <section className="bg-white py-12 sm:py-16" id="categories-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          className="mb-8 flex flex-col justify-between border-b border-gray-100 pb-4 md:flex-row md:items-end"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-green sm:text-xs">
              {lang === "fr" ? "NOS CATÉGORIES" : "تصفح أقسامنا"}
            </p>
            <h3 className="font-arabic text-2xl font-black text-brand-navy tracking-tight sm:text-3xl mt-1">
              {lang === "fr" ? "Découvrez Nos Univers" : "منتجات مختارة بجودة مضمونة"}
            </h3>
          </div>
        </div>

        {/* Categories Grid (3 Columns) styled EXACTLY like aaa.png */}
        <div 
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {categories.map((category, index) => {
            const name = lang === "fr" ? category.nameFR : category.nameAR;
            
            // In aaa.png, Card 1 (index 0) has a green arrow button, Card 2 and 3 have white arrow buttons.
            // Let's match this exactly. If hovered, any card's button can turn green for a beautiful premium touch!
            const isFirst = index === 0;

            return (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[24px] bg-gray-50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                id={`cat-card-${category.id}`}
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Smooth Gradient Overlay similar to aaa.png */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Bottom Content Row: Text Label on Left, Arrow Circle on Right */}
                <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Category Name */}
                  <h3 className={`text-white font-bold tracking-tight text-xl sm:text-2xl ${isRTL ? "font-arabic font-black text-right" : "font-sans font-extrabold text-left"}`}>
                    {name}
                  </h3>

                  {/* Arrow Circle Button */}
                  <div 
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isFirst 
                        ? "bg-brand-green text-white group-hover:bg-brand-green-dark" 
                        : "bg-white text-brand-navy group-hover:bg-brand-green group-hover:text-white"
                    }`}
                  >
                    {isRTL ? (
                      <ArrowLeft className="h-5 w-5" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
