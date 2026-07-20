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

// Track last successfully synced product and quantity to prevent duplicate API requests / race conditions
let lastSyncedProductId: string | null = null;
let lastSyncedQuantity: number | null = null;

// Flag to dynamically disable CoCart integration if CoCart endpoints return 404
let isCoCartSupported = true;

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

  // Skip duplicate syncing if this product and quantity is already in the WooCommerce cart
  if (lastSyncedProductId === productId && lastSyncedQuantity === quantity) {
    console.log(`[Sync] Product ID ${productId} with Qty ${quantity} already synced in this session. Skipping duplicate API requests.`);
    return true;
  }

  // Ensure WooCommerce Store API session is initialized
  if (!storeApiNonce) {
    await initWooCommerceStoreSession();
  }

  // 1. Sync to CoCart (for CartBounty and CoCart session tracking)
  let coCartSuccess = false;
  if (isCoCartSupported) {
    try {
      console.log(`[CoCart] Syncing product ID ${productId} (Qty: ${quantity}) for cart_key: ${cartKey}`);
      
      // Clear previous items in CoCart
      const clearUrl = `${baseUrl}/wp-json/cocart/v2/cart/clear?cart_key=${cartKey}`;
      const clearRes = await fetch(clearUrl, { method: "POST" });
      if (clearRes.status === 404) {
        isCoCartSupported = false;
        console.log("[CoCart] CoCart v2 endpoints returned 404. Disabling CoCart integration for this session.");
      } else {
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
        } else if (response.status === 404) {
          isCoCartSupported = false;
          console.log("[CoCart] CoCart v2 endpoints returned 404 during product add. Disabling CoCart integration for this session.");
        } else {
          console.warn(`[CoCart] Product add failed with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.warn("[CoCart] Product sync failed:", error);
    }
  }

  // 2. Sync to WooCommerce Store API (for native checkout support)
  let storeSuccess = false;
  try {
    console.log(`[Store API] Syncing product ID ${productId} (Qty: ${quantity}) to native WooCommerce cart...`);
    
    // First, let's fetch the current native cart to see what's in there
    const cartUrl = `${baseUrl}/wp-json/wc/store/v1/cart`;
    const cartRes = await fetch(cartUrl, {
      method: "GET",
      headers: getStoreHeaders()
    });
    
    extractStoreHeaders(cartRes.headers);
    
    let targetItemInCart: any = null;
    const itemsToRemove: any[] = [];
    
    if (cartRes.ok) {
      const cartData = await cartRes.json();
      if (cartData && Array.isArray(cartData.items)) {
        for (const item of cartData.items) {
          if (String(item.id) === String(productId)) {
            targetItemInCart = item;
          } else {
            itemsToRemove.push(item);
          }
        }
      }
    }
    
    // Clean up other items from the cart to avoid any interference
    for (const item of itemsToRemove) {
      console.log(`[Store API] Removing unexpected item key ${item.key} (ID ${item.id}) from native cart...`);
      const removeUrl = `${baseUrl}/wp-json/wc/store/v1/cart/remove-item`;
      const removeRes = await fetch(removeUrl, {
        method: "POST",
        headers: getStoreHeaders(),
        body: JSON.stringify({ key: item.key })
      });
      extractStoreHeaders(removeRes.headers);
    }
    
    if (targetItemInCart) {
      // If the target item is already in the cart, update its quantity if it differs
      if (targetItemInCart.quantity !== quantity) {
        console.log(`[Store API] Updating product ID ${productId} quantity in native cart to ${quantity} (was ${targetItemInCart.quantity})...`);
        const updateUrl = `${baseUrl}/wp-json/wc/store/v1/cart/update-item`;
        const updateRes = await fetch(updateUrl, {
          method: "POST",
          headers: getStoreHeaders(),
          body: JSON.stringify({
            key: targetItemInCart.key,
            quantity: quantity
          })
        });
        extractStoreHeaders(updateRes.headers);
        if (updateRes.ok) {
          storeSuccess = true;
          console.log("[Store API] Product quantity updated successfully in native cart.");
        }
      } else {
        console.log(`[Store API] Product ID ${productId} with quantity ${quantity} is already correctly set in native cart.`);
        storeSuccess = true;
      }
    } else {
      // If the target item is not in the cart, add it
      console.log(`[Store API] Adding product ID ${productId} (Qty: ${quantity}) to native WooCommerce cart...`);
      const addUrl = `${baseUrl}/wp-json/wc/store/v1/cart/add-item`;
      const addRes = await fetch(addUrl, {
        method: "POST",
        headers: getStoreHeaders(),
        body: JSON.stringify({
          id: parseInt(productId, 10),
          quantity: quantity
        })
      });
      extractStoreHeaders(addRes.headers);
      if (addRes.ok) {
        storeSuccess = true;
        console.log("[Store API] Product added to native WooCommerce cart successfully.");
      } else {
        console.warn(`[Store API] Product add failed with status: ${addRes.status}`);
      }
    }
  } catch (error) {
    console.warn("[Store API] Product sync to WooCommerce native cart failed:", error);
  }

  const success = coCartSuccess || storeSuccess;
  if (success) {
    lastSyncedProductId = productId;
    lastSyncedQuantity = quantity;
  }

  return success;
}

/**
 * Sync customer details to BOTH CoCart and WooCommerce Store API in real-time as they type.
 * This updates WooCommerce's active cart session, which instantly triggers CartBounty
 * to capture the abandoned cart/partial form entry with the buyer's name and phone!
 */
export async function syncCustomerToCoCart(data: CustomerData): Promise<boolean> {
  const baseUrl = detectWordPressBaseUrl();
  const cartKey = getOrCreateCartKey();

  // Split name into first and last name if possible, ensuring last_name is never empty
  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || firstName;
  
  // Create a cleaner, more personalized email placeholder
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "client";
  const cleanPhone = data.phone.replace(/[^0-9]/g, "");
  const placeholderEmail = `${cleanFirstName}-${cleanPhone || "tel"}@tikatkom-lead.com`;

  // Ensure the state code has the DZ- prefix for Algeria (e.g. DZ-47) as required by WooCommerce
  const stateCode = data.wilayaCode ? (data.wilayaCode.startsWith("DZ-") ? data.wilayaCode : `DZ-${data.wilayaCode}`) : "DZ-16";
  
  // Generate a valid Algerian postal code based on the state (e.g. 13000 for Tlemcen, or 16000 for Algiers)
  const numericState = stateCode.replace("DZ-", "");
  const postcode = numericState ? `${numericState.padStart(2, "0")}000` : "16000";

  // Ensure WooCommerce Store API session is initialized
  if (!storeApiNonce) {
    await initWooCommerceStoreSession();
  }

  // 1. Sync to CoCart (for CartBounty lead capture)
  let coCartSuccess = false;
  if (isCoCartSupported) {
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
            state: stateCode,
            city: data.commune || "Alger",
            address_1: data.address || "Adresse de livraison",
            postcode: postcode,
            country: "DZ",
            email: placeholderEmail
          },
          shipping: {
            first_name: firstName,
            last_name: lastName,
            phone: data.phone,
            state: stateCode,
            city: data.commune || "Alger",
            address_1: data.address || "Adresse de livraison",
            postcode: postcode,
            country: "DZ"
          }
        })
      });

      if (response.ok) {
        coCartSuccess = true;
        console.log("[CoCart] Customer details successfully synced to CoCart.");
      } else if (response.status === 404) {
        isCoCartSupported = false;
        console.log("[CoCart] CoCart customer update returned 404. Disabling CoCart integration for this session.");
      } else {
        console.log(`[CoCart] Customer update returned status: ${response.status} (this is normal if CoCart Lite is used)`);
      }
    } catch (error) {
      console.warn("[CoCart] Lead capture sync failed:", error);
    }
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
          state: stateCode,
          city: data.commune || "Alger",
          address_1: data.address || "Adresse de livraison",
          postcode: postcode,
          country: "DZ",
          email: placeholderEmail
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          state: stateCode,
          city: data.commune || "Alger",
          address_1: data.address || "Adresse de livraison",
          country: "DZ",
          postcode: postcode
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
 * Select the correct shipping rate on WooCommerce based on delivery type and expected shipping fee.
 */
async function selectCartShippingRate(deliveryType: "home" | "desk", expectedPrice: number): Promise<void> {
  const baseUrl = detectWordPressBaseUrl();
  try {
    console.log(`[Store API] Querying cart to select shipping rate for deliveryType: ${deliveryType}, expectedPrice: ${expectedPrice}...`);
    const cartUrl = `${baseUrl}/wp-json/wc/store/v1/cart`;
    const response = await fetch(cartUrl, {
      method: "GET",
      headers: getStoreHeaders()
    });
    extractStoreHeaders(response.headers);
    if (!response.ok) {
      console.warn(`[Store API] Failed to fetch cart for shipping rate selection: ${response.status}`);
      return;
    }

    const cart = await response.json();
    if (!cart || !Array.isArray(cart.shipping_rates) || cart.shipping_rates.length === 0) {
      console.log("[Store API] No shipping rates available in the cart.");
      return;
    }

    // Loop through each package in shipping_rates
    for (const pkg of cart.shipping_rates) {
      const packageId = pkg.package_id ?? 0;
      const rates = pkg.shipping_rates;
      if (!Array.isArray(rates) || rates.length === 0) continue;

      let bestRate: any = null;

      // 1. First pass: look for exact price match (considering both minor/major units or decimals)
      for (const rate of rates) {
        const ratePrice = parseFloat(rate.price || "0");
        if (
          ratePrice === expectedPrice || 
          ratePrice / 100 === expectedPrice || 
          ratePrice === expectedPrice * 100
        ) {
          bestRate = rate;
          break;
        }
      }

      // 2. Second pass: if no exact price match, match by keyword (home/domicile vs desk/bureau/office/yalidine)
      if (!bestRate) {
        for (const rate of rates) {
          const name = (rate.name || "").toLowerCase();
          const desc = (rate.description || "").toLowerCase();
          const id = (rate.rate_id || "").toLowerCase();
          
          if (deliveryType === "home") {
            if (
              name.includes("home") || name.includes("domicile") || name.includes("منزل") || name.includes("دار") ||
              id.includes("home") || id.includes("domicile") || id.includes("flat_rate")
            ) {
              bestRate = rate;
              break;
            }
          } else {
            if (
              name.includes("desk") || name.includes("bureau") || name.includes("office") || name.includes("مكتب") || name.includes("yalidine") ||
              id.includes("desk") || id.includes("bureau") || id.includes("office") || id.includes("local")
            ) {
              bestRate = rate;
              break;
            }
          }
        }
      }

      // 3. Third pass: fallback to the first rate if none matched
      if (!bestRate && rates.length > 0) {
        bestRate = rates[0];
      }

      if (bestRate) {
        console.log(`[Store API] Selecting shipping rate: ${bestRate.name} (ID: ${bestRate.rate_id}) with price ${bestRate.price}`);
        const selectUrl = `${baseUrl}/wp-json/wc/store/v1/cart/select-shipping-rate`;
        const selectRes = await fetch(selectUrl, {
          method: "POST",
          headers: getStoreHeaders(),
          body: JSON.stringify({
            package_id: packageId,
            rate_id: bestRate.rate_id
          })
        });
        extractStoreHeaders(selectRes.headers);
        if (selectRes.ok) {
          console.log(`[Store API] Shipping rate ${bestRate.rate_id} selected successfully.`);
        } else {
          console.warn(`[Store API] Failed to select shipping rate. Status: ${selectRes.status}`);
        }
      }
    }
  } catch (error) {
    console.warn("[Store API] Error selecting shipping rate:", error);
  }
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

    // Dynamically select the correct shipping rate on WooCommerce based on the chosen deliveryType and shippingFee
    await selectCartShippingRate(deliveryType, shippingFee);

    const nameParts = customer.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    
    // Create a cleaner, more personalized email placeholder
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "client";
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const placeholderEmail = `${cleanFirstName}-${cleanPhone || "tel"}@tikatkom-lead.com`;
    const stateCode = customer.wilayaCode ? (customer.wilayaCode.startsWith("DZ-") ? customer.wilayaCode : `DZ-${customer.wilayaCode}`) : "DZ-16";
    const numericState = stateCode.replace("DZ-", "");
    const postcode = numericState ? `${numericState.padStart(2, "0")}000` : "16000";

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
          state: stateCode,
          city: customer.commune || "Alger",
          address_1: customer.address || "Adresse de livraison",
          postcode: postcode,
          country: "DZ",
          email: placeholderEmail
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: customer.phone,
          state: stateCode,
          city: customer.commune || "Alger",
          address_1: customer.address || "Adresse de livraison",
          postcode: postcode,
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
      // Reset synced state since the cart was checked out and cleared
      lastSyncedProductId = null;
      lastSyncedQuantity = null;
      return storeOrder.order_id ? String(storeOrder.order_id) : storeOrder.id ? String(storeOrder.id) : null;
    }

    const errorText = await storeResponse.text();
    throw new Error(`Order placement failed. Status: ${storeResponse.status}. Response: ${errorText}`);
  } catch (error) {
    console.error("[WooCommerce] Order placement failed:", error);
    return null;
  }
}
