import { detectWordPressBaseUrl } from "./woocommerce";

// Retrieve or generate a persistent cart_key for headless session tracking
export function getOrCreateCartKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem("tikatkom_cart_key");
  if (!key) {
    key = `cart_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem("tikatkom_cart_key", key);
  }
  return key;
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
 * Sync the selected product and quantity to the CoCart session.
 * Since this is a high-converting single-product landing page, we clear previous items
 * first to ensure the cart contains exactly the product the user is looking to buy.
 */
export async function syncProductToCoCart(productId: string, quantity: number): Promise<boolean> {
  const baseUrl = detectWordPressBaseUrl();
  const cartKey = getOrCreateCartKey();

  try {
    console.log(`[CoCart] Syncing product ID ${productId} (Qty: ${quantity}) for cart_key: ${cartKey}`);
    
    // Step 1: Clear previous items in the cart
    const clearUrl = `${baseUrl}/wp-json/cocart/v2/cart/clear?cart_key=${cartKey}`;
    await fetch(clearUrl, { method: "POST" });

    // Step 2: Add the selected product
    const addUrl = `${baseUrl}/wp-json/cocart/v2/cart/add-item?cart_key=${cartKey}`;
    const response = await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productId,
        quantity: quantity.toString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add item to CoCart: ${response.statusText}`);
    }

    console.log("[CoCart] Product synced successfully.");
    return true;
  } catch (error) {
    console.warn("[CoCart] Product sync failed (ensure WordPress is running with CoCart installed):", error);
    return false;
  }
}

/**
 * Sync customer details to CoCart in real-time as they type.
 * This updates WooCommerce's active cart session, which instantly triggers CartBounty
 * to capture the abandoned cart/partial form entry with the buyer's name and phone!
 */
export async function syncCustomerToCoCart(data: CustomerData): Promise<boolean> {
  const baseUrl = detectWordPressBaseUrl();
  const cartKey = getOrCreateCartKey();

  // Split name into first and last name if possible, or use full name as first name
  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    console.log(`[CartBounty & CoCart] Syncing partial customer data for lead capture:`, data);
    
    const customerUrl = `${baseUrl}/wp-json/cocart/v2/customer?cart_key=${cartKey}`;
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
          address_1: data.address,
          email: `${data.phone.replace(/[^0-9]/g, "") || "customer"}@tikatkom-lead.com` // Helper email placeholder for CartBounty tracking
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          state: data.wilayaCode,
          city: data.commune,
          address_1: data.address
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer details: ${response.statusText}`);
    }

    console.log("[CartBounty & CoCart] Partial lead details successfully captured.");
    return true;
  } catch (error) {
    console.warn("[CartBounty] Lead capture failed (ensure WordPress has CoCart and CartBounty enabled):", error);
    return false;
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
  const cartKey = getOrCreateCartKey();

  try {
    console.log("[WooCommerce] Placing final order...", { productId, quantity, customer, deliveryType, shippingFee });

    // First ensure the cart product and customer details are freshly updated
    await syncProductToCoCart(productId, quantity);
    await syncCustomerToCoCart(customer);

    // Build checkout payload
    const checkoutUrl = `${baseUrl}/wp-json/cocart/v2/checkout?cart_key=${cartKey}`;
    const response = await fetch(checkoutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_method: "cod",
        payment_method_title: "Cash on Delivery",
        customer_note: customer.notes || "",
        shipping_lines: [
          {
            method_id: deliveryType === "home" ? "flat_rate" : "local_pickup",
            method_title: deliveryType === "home" ? "Domicile" : "Bureau Yalidine",
            total: shippingFee.toString()
          }
        ]
      })
    });

    if (response.ok) {
      const orderData = await response.json();
      console.log("[WooCommerce] Order created successfully via CoCart:", orderData);
      return orderData.order_id ? String(orderData.order_id) : orderData.id ? String(orderData.id) : null;
    }

    // Fallback: If CoCart Checkout endpoint is premium or fails, attempt standard WooCommerce Store API Checkout
    console.log("[WooCommerce] CoCart checkout failed, attempting fallback to native WooCommerce Store API checkout...");
    const storeCheckoutUrl = `${baseUrl}/wp-json/wc/store/v1/checkout`;
    const storeResponse = await fetch(storeCheckoutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billing_address: {
          first_name: customer.fullName,
          last_name: "",
          phone: customer.phone,
          state: customer.wilayaCode,
          city: customer.commune,
          address_1: customer.address,
          email: `${customer.phone.replace(/[^0-9]/g, "") || "customer"}@tikatkom-lead.com`
        },
        shipping_address: {
          first_name: customer.fullName,
          last_name: "",
          state: customer.wilayaCode,
          city: customer.commune,
          address_1: customer.address
        },
        payment_method: "cod",
        customer_note: customer.notes || ""
      })
    });

    if (storeResponse.ok) {
      const storeOrder = await storeResponse.json();
      console.log("[WooCommerce] Order created successfully via Store API:", storeOrder);
      return storeOrder.order_id ? String(storeOrder.order_id) : storeOrder.id ? String(storeOrder.id) : null;
    }

    throw new Error(`Order placement failed. Status: ${response.status}`);
  } catch (error) {
    console.error("[WooCommerce] Order placement failed:", error);
    return null;
  }
}
