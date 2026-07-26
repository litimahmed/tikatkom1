// src/lib/zrexpress.ts

import { Wilaya } from "../types";


export interface Commune {
  id: string;
  name: string;
  nameArabic: string;
}
export interface DeliveryRate {
  toTerritoryId: string;
  toTerritoryName: string;
  toTerritoryLevel: string;
  deliveryPrices: {
    deliveryType: "home" | "pickup-point";
    price: number;
  }[];
}
// Fetch wilayas through your backend proxy
export async function fetchWilayasFromZR(): Promise<Wilaya[]> {
  try {
    // Use the correct port (3000) and endpoint
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const url = `${apiBase}/api/zrexpress/wilayas`;

    console.log("Fetching wilayas from:", url); // Debug log

    const response = await fetch(url, {
      method: "GET",  // Your server uses GET for this endpoint
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch wilayas:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    // Handle the response structure from your server
    // Your server returns the data directly from ZR Express
    const items = data.items || data.data || [];

    console.log("Fetched wilayas:", items.length); // Debug log

    return items.map((item: any) => ({
      id: item.id || "",
      code: String(item.code).padStart(2, "0"),
      nameFR: item.name || "",
      nameAR: item.nameArabic || item.name || "",
      communes: []
    }));

  } catch (err) {
    console.error("Error fetching wilayas:", err);
    return [];
  }
}
// Fetch communes for a specific wilaya through your backend proxy
export async function fetchCommunesFromZR(wilayaId: string): Promise<Commune[]> {
  try {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const url = `${apiBase}/api/zrexpress/communes`;

    console.log("Fetching communes for wilaya:", wilayaId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ wilayaId })
    });

    if (!response.ok) {
      console.error("Failed to fetch communes:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const items = data.items || data.data || [];

    console.log("Fetched communes:", items.length);

    return items.map((item: any) => ({
      id: item.id || "",
      name: item.name || "",
      nameArabic: item.nameArabic || item.name || ""
    }));

  } catch (err) {
    console.error("Error fetching communes:", err);
    return [];
  }
}

// Fetch delivery rate for a specific territory
export async function fetchDeliveryRate(territoryId: string): Promise<DeliveryRate | null> {
  try {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const url = `${apiBase}/api/zrexpress/rates/${territoryId}`;

    console.log("Fetching delivery rate for territory:", territoryId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch delivery rate:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Fetched delivery rate:", data);

    return data;

  } catch (err) {
    console.error("Error fetching delivery rate:", err);
    return null;
  }
}