/**
 * Robust IP-based Geolocation helper to detect client country.
 * Queries multiple reliable, free HTTPS-capable endpoints sequentially as fallbacks.
 * Persists the result in localStorage to optimize page reloads.
 */

const CACHE_KEY = "tikatkom_user_country";
const CACHE_TIME_KEY = "tikatkom_user_country_timestamp";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // Cache for 24 hours

export async function getUserCountryCode(): Promise<string> {
  // 1. Check local storage cache
  try {
    const cachedCountry = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIME_KEY);
    if (cachedCountry && cachedTimestamp) {
      const parsedTime = parseInt(cachedTimestamp, 10);
      if (Date.now() - parsedTime < ONE_DAY_MS) {
        return cachedCountry.toUpperCase();
      }
    }
  } catch (err) {
    console.warn("Could not read country cache", err);
  }

  // 2. Query Geolocation Services sequentially
  const services = [
    // Service 1: ipapi.co (Highly reliable HTTPS API)
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) });
      if (!res.ok) throw new Error(`ipapi status ${res.status}`);
      const data = await res.json();
      if (data && typeof data.country_code === "string") {
        return data.country_code.toUpperCase();
      }
      throw new Error("Invalid response schema from ipapi");
    },
    // Service 2: freeipapi.com (Reliable, high-speed public API)
    async () => {
      const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(3500) });
      if (!res.ok) throw new Error(`freeipapi status ${res.status}`);
      const data = await res.json();
      if (data && typeof data.countryCode === "string") {
        return data.countryCode.toUpperCase();
      }
      throw new Error("Invalid response schema from freeipapi");
    },
    // Service 3: ipinfo.io (Simple JSON API)
    async () => {
      const res = await fetch("https://ipinfo.io/json", { signal: AbortSignal.timeout(3500) });
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
        console.log(`[Geo API] Detected Country: ${countryCode}`);
        // Cache result
        try {
          localStorage.setItem(CACHE_KEY, countryCode);
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (e) {
          console.warn("Could not save country cache", e);
        }
        return countryCode;
      }
    } catch (error) {
      console.warn(`[Geo API Fallback] Service failed:`, error);
    }
  }

  // Final fallback to DZ (Algeria) if all APIs are down or blocked
  console.warn("[Geo API] All geolocation APIs failed. Defaulting to Algeria (DZ).");
  return "DZ";
}
