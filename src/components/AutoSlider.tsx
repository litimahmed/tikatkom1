import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AutoSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.JSX.Element;
  lang: "fr" | "ar";
  autoPlayInterval?: number; // default 3000ms
  visibleDesktop?: number; // default 3
  visibleTablet?: number; // default 2
  visibleMobile?: number; // default 1
  idPrefix?: string;
}

export default function AutoSlider<T>({
  items,
  renderItem,
  lang,
  autoPlayInterval = 3000,
  visibleDesktop = 3,
  visibleTablet = 2,
  visibleMobile = 1,
  idPrefix = "slider",
}: AutoSliderProps<T>) {
  const isRTL = lang === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(visibleDesktop);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive columns monitoring
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCount(visibleDesktop);
      } else if (width >= 640) {
        setVisibleCount(visibleTablet);
      } else {
        setVisibleCount(visibleMobile);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [visibleDesktop, visibleTablet, visibleMobile]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Auto-adjust currentIndex when visibleCount changes to avoid out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleCount, maxIndex, currentIndex]);

  // Autoplay Logic
  useEffect(() => {
    if (isHovered || items.length <= visibleCount || autoPlayInterval <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // wrap around to beginning
        }
        return prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isHovered, items.length, visibleCount, maxIndex, autoPlayInterval]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Mouse & Touch Swipe Detection
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [draggedDistance, setDraggedDistance] = useState<number>(0);

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setDraggedDistance(0);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    const diff = dragStartX - clientX;
    setDraggedDistance(diff);
  };

  const handleDragEnd = () => {
    if (dragStartX === null) return;
    const swipeThreshold = 50; // pixels to trigger a slide
    if (Math.abs(draggedDistance) > swipeThreshold) {
      if (draggedDistance > 0) {
        // Swiped left
        if (isRTL) {
          handlePrev();
        } else {
          handleNext();
        }
      } else {
        // Swiped right
        if (isRTL) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    setDragStartX(null);
    setDraggedDistance(0);
  };

  // Touch Event Listeners
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse Event Listeners
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    setIsHovered(false);
    setDragStartX(null);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  // Dots / Pages calculation
  const totalPages = Math.max(1, items.length - visibleCount + 1);

  // Translation Percentage
  const translationX = isRTL
    ? currentIndex * (100 / visibleCount)
    : -currentIndex * (100 / visibleCount);

  return (
    <div
      className="relative w-full group/slider"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`${idPrefix}-container`}
    >
      {/* Slider Viewport */}
      <div className="overflow-hidden w-full rounded-2xl">
        <motion.div
          ref={containerRef}
          className="flex w-full cursor-grab active:cursor-grabbing select-none"
          animate={{ x: `${translationX}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {items.map((item, index) => {
            const widthClass =
              visibleCount === 3
                ? "w-1/3"
                : visibleCount === 2
                ? "w-1/2"
                : "w-full";

            return (
              <div
                key={index}
                className={`${widthClass} shrink-0 px-2.5 box-border`}
                id={`${idPrefix}-item-${index}`}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Chevrons - Hidden if everything is visible */}
      {items.length > visibleCount && (
        <>
          <button
            onClick={isRTL ? handleNext : handlePrev}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? "-right-3 sm:-right-5" : "-left-3 sm:-left-5"
            } z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 text-brand-navy dark:text-zinc-200 shadow-md backdrop-blur-sm transition-all hover:bg-brand-green hover:text-white hover:border-brand-green cursor-pointer opacity-0 group-hover/slider:opacity-100 focus:opacity-100`}
            aria-label="Previous Slide"
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            onClick={isRTL ? handlePrev : handleNext}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRTL ? "-left-3 sm:-left-5" : "-right-3 sm:-right-5"
            } z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 text-brand-navy dark:text-zinc-200 shadow-md backdrop-blur-sm transition-all hover:bg-brand-green hover:text-white hover:border-brand-green cursor-pointer opacity-0 group-hover/slider:opacity-100 focus:opacity-100`}
            aria-label="Next Slide"
          >
            {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </>
      )}

      {/* Elegant Pagination Indicators (Dots) */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? "w-6 bg-brand-green"
                  : "w-2 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
