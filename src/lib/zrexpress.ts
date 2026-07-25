import { Wilaya } from "../types";

export async function fetchWilayasFromZR(): Promise<Wilaya[]> {
  try {
    const response = await fetch("/api/zrexpress/wilayas");

    if (!response.ok) {
      console.error("Failed to fetch wilayas from backend proxy API:", response.statusText);
      return [];
    }

    const json = await response.json();
    const items = json.items || json.data || (Array.isArray(json) ? json : []);

    return items.map((item: any) => {
      const formattedCode = item.code != null ? String(item.code).padStart(2, "0") : String(item.postalCode || "");
      return {
        code: formattedCode,
        nameFR: item.name || "",
        nameAR: item.nameArabic || item.name || "",
        communes: []
      };
    });
  } catch (err) {
    console.error("Error fetching wilayas from backend proxy API:", err);
    return [];
  }
}
