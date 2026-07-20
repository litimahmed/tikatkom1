import { Product, Category } from "../types";
import { products as mockProducts, categories as mockCategories } from "../data";

// WooCommerce Store API endpoints do NOT require credentials for public reading.
// We resolve the WordPress base URL dynamically:
// 1. If VITE_WORDPRESS_URL is set in environment, use it (perfect for external dev).
// 2. Otherwise, use the current origin window.location.origin (perfect when served directly from the WP directory).
const WP_BASE_URL = (import.meta as any).env?.VITE_WORDPRESS_URL || window.location.origin;

// Helper to split bilingual strings formatted as "French / Arabic" or "Arabic | French"
export function parseMultilingual(text: string): { fr: string; ar: string } {
  if (!text) return { fr: "", ar: "" };
  
  // Clean HTML tags first
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  // Common dividers
  const separators = [" | ", " - ", " / "];
  for (const sep of separators) {
    if (cleanText.includes(sep)) {
      const parts = cleanText.split(sep);
      const part1 = parts[0].trim();
      const part2 = parts[1].trim();
      
      // Determine which part is Arabic
      const hasArabic = (str: string) => /[\u0600-\u06FF]/.test(str);
      
      if (hasArabic(part1)) {
        return { ar: part1, fr: part2 };
      } else {
        return { fr: part1, ar: part2 };
      }
    }
  }
  
  // No separator found. Check if the string is Arabic or French/English
  const isArabic = /[\u0600-\u06FF]/.test(cleanText);
  if (isArabic) {
    return { ar: cleanText, fr: cleanText };
  } else {
    return { fr: cleanText, ar: cleanText };
  }
}

// Map WooCommerce Store API category to our App's Category type
export function mapWooCategory(wpCat: any): Category {
  const nameInfo = parseMultilingual(wpCat.name || "");
  return {
    id: wpCat.slug || String(wpCat.id),
    nameFR: nameInfo.fr || wpCat.name,
    nameAR: nameInfo.ar || wpCat.name,
    image: wpCat.image?.src || "/src/assets/images/placeholder.jpg",
    count: wpCat.count || 0
  };
}

// Map WooCommerce Store API product to our App's Product type
export function mapWooProduct(wpProduct: any): Product {
  const titleInfo = parseMultilingual(wpProduct.name || "");
  const descInfo = parseMultilingual(wpProduct.description || wpProduct.short_description || "");
  
  // Parse prices from WooCommerce Store API
  // In the Store API, prices are returned in a "prices" object:
  // e.g., { price: "6200", regular_price: "8500", currency_minor_unit: 2 }
  let priceParsed = 0;
  let oldPriceParsed = undefined;

  const parsePriceValue = (val: any) => {
    if (!val) return 0;
    const num = parseFloat(val);
    // If it's represented as minor units (e.g. 620000 instead of 6200), scale it down
    if (num > 150000) {
      return num / 100;
    }
    return num;
  };

  if (wpProduct.prices) {
    priceParsed = parsePriceValue(wpProduct.prices.price);
    if (wpProduct.prices.regular_price && wpProduct.prices.regular_price !== wpProduct.prices.price) {
      oldPriceParsed = parsePriceValue(wpProduct.prices.regular_price);
    }
  }

  // Extract features list from the short description bullet points, or attributes
  const featuresFR: string[] = [];
  const featuresAR: string[] = [];
  
  if (wpProduct.short_description) {
    const doc = new DOMParser().parseFromString(wpProduct.short_description, 'text/html');
    const lis = doc.querySelectorAll('li');
    lis.forEach(li => {
      const text = li.textContent || "";
      const info = parseMultilingual(text);
      if (info.fr) featuresFR.push(info.fr);
      if (info.ar) featuresAR.push(info.ar);
    });
  }
  
  // Default fallbacks if no bullet points found
  if (featuresFR.length === 0) {
    featuresFR.push(titleInfo.fr);
  }
  if (featuresAR.length === 0) {
    featuresAR.push(titleInfo.ar);
  }

  // Stock status
  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (!wpProduct.is_in_stock) {
    stockStatus = "out_of_stock";
  } else if (wpProduct.low_stock_amount && wpProduct.quantity_limit && wpProduct.quantity_limit <= wpProduct.low_stock_amount) {
    stockStatus = "low_stock";
  }

  // Primary category slug
  const categorySlug = wpProduct.categories && wpProduct.categories.length > 0 
    ? wpProduct.categories[0].slug 
    : "uncategorized";

  // Badges (either calculated sale percentage or from tags)
  let badgeFR = undefined;
  let badgeAR = undefined;
  if (oldPriceParsed && oldPriceParsed > priceParsed) {
    const pct = Math.round(((oldPriceParsed - priceParsed) / oldPriceParsed) * 100);
    badgeFR = `OFFRE -${pct}%`;
    badgeAR = `عرض -${pct}%`;
  } else if (wpProduct.tags && wpProduct.tags.length > 0) {
    const tagInfo = parseMultilingual(wpProduct.tags[0].name);
    badgeFR = tagInfo.fr;
    badgeAR = tagInfo.ar;
  }

  return {
    id: String(wpProduct.id),
    titleFR: titleInfo.fr || wpProduct.name,
    titleAR: titleInfo.ar || wpProduct.name,
    descriptionFR: descInfo.fr || "",
    descriptionAR: descInfo.ar || "",
    price: priceParsed,
    oldPrice: oldPriceParsed,
    image: wpProduct.images && wpProduct.images.length > 0 ? wpProduct.images[0].src : "/src/assets/images/placeholder.jpg",
    category: categorySlug,
    badgeFR,
    badgeAR,
    rating: parseFloat(wpProduct.average_rating) || 4.8,
    reviewsCount: wpProduct.review_count || 12,
    stockStatus,
    featuresFR,
    featuresAR,
    tags: wpProduct.tags ? wpProduct.tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })) : undefined
  };
}

// Fetch Categories directly from public WooCommerce Store API
export async function getWooCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/wp-json/wc/store/v1/products/categories?per_page=100`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(mapWooCategory);
    }
    return mockCategories;
  } catch (error) {
    console.warn("WooCommerce connection failed; using gorgeous mock categories fallback.", error);
    return mockCategories;
  }
}

// Fetch Products directly from public WooCommerce Store API
export async function getWooProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${WP_BASE_URL}/wp-json/wc/store/v1/products?per_page=100`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(mapWooProduct);
    }
    return mockProducts;
  } catch (error) {
    console.warn("WooCommerce connection failed; using gorgeous mock products fallback.", error);
    return mockProducts;
  }
}

// Filter products into specific sections based on WooCommerce Tags
// Falls back to static offsets of all products if no matching tags are found!
export function getProductsForSection(
  allProducts: Product[],
  sectionId: "most_requested" | "new_arrivals" | "best_sellers" | "flash_deals",
  rawWpProducts: any[] = []
): Product[] {
  // Check if we have raw products with tag structures to inspect
  if (rawWpProducts.length > 0) {
    const matchedProducts: Product[] = [];
    
    for (const raw of rawWpProducts) {
      if (!raw.tags) continue;
      const hasTag = raw.tags.some((t: any) => {
        const slug = (t.slug || "").toLowerCase();
        const name = (t.name || "").toLowerCase();
        
        if (sectionId === "most_requested") {
          return slug.includes("most-requested") || name.includes("أكثر طلبا") || name.includes("الأكثر طلبا");
        }
        if (sectionId === "new_arrivals") {
          return slug.includes("new-arrivals") || slug.includes("new-in") || name.includes("جديد");
        }
        if (sectionId === "best_sellers") {
          return slug.includes("best-sellers") || name.includes("الأكثر مبيعا") || name.includes("أفضل مبيعات");
        }
        if (sectionId === "flash_deals") {
          return slug.includes("flash-deals") || slug.includes("deals") || name.includes("فلاش") || name.includes("عروض");
        }
        return false;
      });

      if (hasTag) {
        const mapped = allProducts.find(p => p.id === String(raw.id));
        if (mapped) matchedProducts.push(mapped);
      }
    }

    if (matchedProducts.length > 0) {
      return matchedProducts.slice(0, 4); // limit to 4 per homepage section
    }
  }

  // If we couldn't match tags from raw data, search mapped products for keyword indicators in titles/badges
  const mappedMatches = allProducts.filter(p => {
    const badge = (p.badgeFR || p.badgeAR || "").toLowerCase();
    const title = (p.titleFR || p.titleAR || "").toLowerCase();
    
    if (sectionId === "most_requested") {
      return badge.includes("demande") || badge.includes("طلب");
    }
    if (sectionId === "new_arrivals") {
      return badge.includes("nouveaut") || badge.includes("جديد");
    }
    if (sectionId === "best_sellers") {
      return badge.includes("vente") || badge.includes("مبيع");
    }
    if (sectionId === "flash_deals") {
      return badge.includes("deal") || badge.includes("flash") || badge.includes("فلاش") || badge.includes("عرض");
    }
    return false;
  });

  if (mappedMatches.length > 0) {
    return mappedMatches.slice(0, 4);
  }

  // High-fidelity fallback presets if no custom tag overrides are uploaded yet
  if (sectionId === "most_requested") {
    return allProducts.slice(0, 4);
  } else if (sectionId === "new_arrivals") {
    return allProducts.slice(4, 8);
  } else if (sectionId === "best_sellers") {
    return allProducts.filter(p => p.oldPrice !== undefined).slice(0, 4);
  } else {
    // flash_deals
    return allProducts.filter(p => p.stockStatus === "low_stock").concat(allProducts).slice(0, 4);
  }
}
