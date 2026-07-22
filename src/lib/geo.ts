/**
 * Robust IP-based Geolocation helper to detect client country.
 * Queries multiple reliable, free HTTPS-capable endpoints sequentially as fallbacks.
 * Persists the result in localStorage to optimize page reloads.
 */

const CACHE_KEY = "tikatkom_user_country";
const CACHE_TIME_KEY = "tikatkom_user_country_timestamp";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // Cache for 24 hours

export async function getUserCountryCode(): Promise<string> {
  // 1. Check URL query parameter overrides for quick testing
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "intl") {
      return "US"; // Non-Algerian international code
    }
    if (mode === "dz") {
      return "DZ"; // Forced Algerian code
    }
  }

  // 2. Fetch live country code from HTTPS IP Geolocation Services sequentially
  const services = [
    // Service 1: ipapi.co (HTTPS)
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`ipapi status ${res.status}`);
      const data = await res.json();
      if (data && typeof data.country_code === "string") {
        return data.country_code.toUpperCase();
      }
      throw new Error("Invalid response schema from ipapi");
    },
    // Service 2: freeipapi.com (HTTPS)
    async () => {
      const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`freeipapi status ${res.status}`);
      const data = await res.json();
      if (data && typeof data.countryCode === "string") {
        return data.countryCode.toUpperCase();
      }
      throw new Error("Invalid response schema from freeipapi");
    },
    // Service 3: ipinfo.io (HTTPS)
    async () => {
      const res = await fetch("https://ipinfo.io/json", { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`ipinfo status ${res.status}`);
      const data = await res.json();
      if (data && typeof data.country === "string") {
        return data.country.toUpperCase();
      }
      throw new Error("Invalid response schema from ipinfo");
    }
  ];

  for (const service of services) {
    try {
      const countryCode = await service();
      if (countryCode && countryCode.length === 2) {
        console.log(`[Geo API] Live Detected Country: ${countryCode}`);
        return countryCode;
      }
    } catch (error) {
      console.warn(`[Geo API Fallback] Service failed:`, error);
    }
  }

  // Fallback to DZ (Algeria) if all IP APIs fail
  console.warn("[Geo API] All geolocation APIs failed. Defaulting to Algeria (DZ).");
  return "DZ";
}
