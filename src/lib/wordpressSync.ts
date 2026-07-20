import { detectWordPressBaseUrl } from "./woocommerce";

// Retrieve or generate a persistent cart_key for headless session tracking in CoCart
export function getOrCreateCartKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem("tikatkom_cart_key");
  if (!key) {
    key = `cart_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem("tikatkom_cart_key", key);
  }
  return key;
}

// In-memory store for WooCommerce Store API headers (Nonces and Cart-Tokens)
let storeApiNonce: string | null = null;
let storeApiCartToken: string | null = null;

// Extractor to capture headers from any Store API response
function extractStoreHeaders(headers: Headers) {
  const nonce = headers.get("X-WC-Store-API-Nonce") || 
                headers.get("Nonce") || 
                headers.get("nonce") || 
                headers.get("x-wc-store-api-nonce");
  
  const token = headers.get("Cart-Token") || 
                headers.get("cart-token") || 
                headers.get("Cart-token");

  if (nonce) {
    storeApiNonce = nonce;
    console.log("[Store API] Captured Nonce:", storeApiNonce);
  }
  if (token) {
    storeApiCartToken = token;
    console.log("[Store API] Captured Cart-Token:", storeApiCartToken);
  }
}

// Helper to generate headers for WooCommerce Store API requests
function getStoreHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (storeApiNonce) {
    headers["X-WC-Store-API-Nonce"] = storeApiNonce;
  }
  if (storeApiCartToken) {
    headers["Cart-Token"] = storeApiCartToken;
  }
  
  return headers;
}

/**
 * Initialize the WooCommerce Store API session by pre-fetching the cart.
 * This triggers WooCommerce to generate cookies, session IDs, and the crucial CSRF nonces.
 */
export async function initWooCommerceStoreSession(): Promise<void> {
  const baseUrl = detectWordPressBaseUrl();
  try {
    console.log("[Store API] Initializing WooCommerce Store API session...");
    const url = `${baseUrl}/wp-json/wc/store/v1/cart`;
    const response = await fetch(url, { method: "GET", headers: getStoreHeaders() });
    extractStoreHeaders(response.headers);
  } catch (error) {
    console.warn("[Store API] Session initialization failed:", error);
  }
}

interface CustomerData {
  fullName: string;
  phone: string;
  wilayaCode: string;
  commune: string;
  address: string;
  notes?: string;
}

/**
 * Sync the selected product and quantity to BOTH CoCart and native WooCommerce Store API.
 * Since this is a high-converting single-product landing page, we clear previous items
 * first to ensure the cart contains exactly the product the user is looking to buy.
 */
export async function syncProductToCoCart(productId: string, quantity: number): Promise<boolean> {
  const baseUrl = detectWordPressBaseUrl();
  const cartKey = getOrCreateCartKey();

  // Ensure WooCommerce Store API session is initialized
  if (!storeApiNonce) {
    await initWooCommerceStoreSession();
  }

  // 1. Sync to CoCart (for CartBounty and CoCart session tracking)
  let coCartSuccess = false;
  try {
    console.log(`[CoCart] Syncing product ID ${productId} (Qty: ${quantity}) for cart_key: ${cartKey}`);
    
    // Clear previous items in CoCart
    const clearUrl = `${baseUrl}/wp-json/cocart/v2/cart/clear?cart_key=${cartKey}`;
    await fetch(clearUrl, { method: "POST" });

    // Add selected product
    const addUrl = `${baseUrl}/wp-json/cocart/v2/cart/add-item?cart_key=${cartKey}`;
    const response = await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productId,
        quantity: quantity.toString()
      })
    });

    if (response.ok) {
      coCartSuccess = true;
      console.log("[CoCart] Product synced successfully.");
    } else {
      console.warn(`[CoCart] Product add failed with status: ${response.status}`);
    }
  } catch (error) {
    console.warn("[CoCart] Product sync failed:", error);
  }

  // 2. Sync to WooCommerce Store API (for native checkout support)
  let storeSuccess = false;
  try {
    console.log(`[Store API] Adding product ID ${productId} (Qty: ${quantity}) to native WooCommerce cart...`);
    const addUrl = `${baseUrl}/wp-json/wc/store/v1/cart/add-item`;
    const response = await fetch(addUrl, {
      method: "POST",
      headers: getStoreHeaders(),
      body: JSON.stringify({
        id: parseInt(productId, 10),
        quantity: quantity
      })
    });

    extractStoreHeaders(response.headers);

    if (response.ok) {
      storeSuccess = true;
      console.log("[Store API] Product added to native WooCommerce cart successfully.");
    } else {
      console.warn(`[Store API] Product add failed with status: ${response.status}`);
    }
  } catch (error) {
    console.warn("[Store API] Product sync to WooCommerce native cart failed:", error);
  }

  return coCartSuccess || storeSuccess;
}

/**
 * Sync customer details to BOTH CoCart and WooCommerce Store API in real-time as they type.
 * This updates WooCommerce's active cart session, which instantly triggers CartBounty
 * to capture the abandoned cart/partial form entry with the buyer's name and phone!
 */
export async function syncCustomerToCoCart(data: CustomerData): Promise<boolean> {
  const baseUrl = detectWordPressBaseUrl();
  const cartKey = getOrCreateCartKey();

  // Split name into first and last name if possible
  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const placeholderEmail = `${data.phone.replace(/[^0-9]/g, "") || "customer"}@tikatkom-lead.com`;

  // Ensure WooCommerce Store API session is initialized
  if (!storeApiNonce) {
    await initWooCommerceStoreSession();
  }

  // 1. Sync to CoCart (for CartBounty lead capture)
  let coCartSuccess = false;
  try {
    console.log(`[CoCart] Syncing customer details to CoCart:`, data);
    
    // Crucial: Correct path has "/cart" in it -> /wp-json/cocart/v2/cart/customer
    const customerUrl = `${baseUrl}/wp-json/cocart/v2/cart/customer?cart_key=${cartKey}`;
    const response = await fetch(customerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billing: {
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          state: data.wilayaCode,
          city: data.commune,
          address_1: data.address || "Adresse de livraison",
          email: placeholderEmail
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          state: data.wilayaCode,
          city: data.commune,
          address_1: data.address || "Adresse de livraison"
        }
      })
    });

    if (response.ok) {
      coCartSuccess = true;
      console.log("[CoCart] Customer details successfully synced to CoCart.");
    } else {
      console.warn(`[CoCart] Customer update returned status: ${response.status}`);
    }
  } catch (error) {
    console.warn("[CoCart] Lead capture sync failed:", error);
  }

  // 2. Sync to native WooCommerce Store API (to authorize checkout session)
  let storeSuccess = false;
  try {
    console.log(`[Store API] Syncing customer details to native WooCommerce Cart:`, data);
    const customerUrl = `${baseUrl}/wp-json/wc/store/v1/cart/update-customer`;
    const response = await fetch(customerUrl, {
      method: "POST",
      headers: getStoreHeaders(),
      body: JSON.stringify({
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          state: data.wilayaCode,
          city: data.commune,
          address_1: data.address || "Adresse de livraison",
          country: "DZ",
          email: placeholderEmail
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          state: data.wilayaCode,
          city: data.commune,
          address_1: data.address || "Adresse de livraison",
          country: "DZ"
        }
      })
    });

    extractStoreHeaders(response.headers);

    if (response.ok) {
      storeSuccess = true;
      console.log("[Store API] Customer details successfully synced to native WooCommerce Cart.");
    } else {
      console.warn(`[Store API] Customer update returned status: ${response.status}`);
    }
  } catch (error) {
    console.warn("[Store API] Customer update failed:", error);
  }

  return coCartSuccess || storeSuccess;
}

/**
 * Submit the final order using the CoCart or WooCommerce Store API.
 * Returns the created WooCommerce Order reference ID or null on failure.
 */
export async function submitWooCommerceOrder(
  productId: string,
  quantity: number,
  customer: CustomerData,
  deliveryType: "home" | "desk",
  shippingFee: number
): Promise<string | null> {
  const baseUrl = detectWordPressBaseUrl();

  try {
    console.log("[WooCommerce] Placing final order...", { productId, quantity, customer, deliveryType, shippingFee });

    // First ensure the cart product and customer details are freshly updated
    await syncProductToCoCart(productId, quantity);
    await syncCustomerToCoCart(customer);

    const nameParts = customer.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const placeholderEmail = `${customer.phone.replace(/[^0-9]/g, "") || "customer"}@tikatkom-lead.com`;

    // Attempt native WooCommerce Store API Checkout
    console.log("[WooCommerce] Attempting checkout via native WooCommerce Store API checkout...");
    const storeCheckoutUrl = `${baseUrl}/wp-json/wc/store/v1/checkout`;
    const storeResponse = await fetch(storeCheckoutUrl, {
      method: "POST",
      headers: getStoreHeaders(),
      body: JSON.stringify({
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          phone: customer.phone,
          state: customer.wilayaCode,
          city: customer.commune,
          address_1: customer.address || "Adresse de livraison",
          country: "DZ",
          email: placeholderEmail
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: customer.phone,
          state: customer.wilayaCode,
          city: customer.commune,
          address_1: customer.address || "Adresse de livraison",
          country: "DZ"
        },
        payment_method: "cod",
        customer_note: customer.notes || ""
      })
    });

    extractStoreHeaders(storeResponse.headers);

    if (storeResponse.ok) {
      const storeOrder = await storeResponse.json();
      console.log("[WooCommerce] Order created successfully via Store API:", storeOrder);
      return storeOrder.order_id ? String(storeOrder.order_id) : storeOrder.id ? String(storeOrder.id) : null;
    }

    const errorText = await storeResponse.text();
    throw new Error(`Order placement failed. Status: ${storeResponse.status}. Response: ${errorText}`);
  } catch (error) {
    console.error("[WooCommerce] Order placement failed:", error);
    return null;
  }
}
