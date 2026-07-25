import { Wilaya } from "../types";

export async function fetchWilayasFromZR(): Promise<Wilaya[]> {
  const tenantId = process.env.VITE_ZR_TENANT_ID || import.meta.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
  const apiKey = process.env.VITE_ZR_SECRET_KEY || import.meta.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

  try {
    const response = await fetch("https://api.zrexpress.app/api/v1/territories/search", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "X-Tenant": tenantId,
        "X-Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        advancedFilter: {
          field: "level",
          operator: "eq",
          value: "wilaya"
        },
        pageSize: 100,
        pageNumber: 1,
        orderBy: ["code asc"]
      })
    });

    if (!response.ok) {
      console.error("Failed to fetch wilayas from ZR Express API:", response.statusText);
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
    console.error("Error fetching wilayas from ZR Express API:", err);
    return [];
  }
}
