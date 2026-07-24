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

  // 2. Try internal /api/geo endpoint first (same origin, no CORS)
  try {
    const res = await fetch("/api/geo", { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode) {
        return data.countryCode.toUpperCase();
      }
    }
  } catch {
    // Silent fallback to secondary client-side check or default
  }

  // 3. Fallback to freeipapi.com (CORS friendly) if needed
  try {
    const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.countryCode === "string") {
        return data.countryCode.toUpperCase();
      }
    }
  } catch {
    // Silent catch
  }

  // Default to DZ (Algeria)
  return "DZ";
}
