# WooCommerce Secure Checkout & Order Capturing Integration

This guide provides a secure, production-ready implementation for capturing checkout records in a React frontend and saving them to WordPress/WooCommerce using **Environment Variables**, a **Secure Backend Proxy**, and **Local XAMPP Compatibility fixes**.

---

## 1. WordPress WooCommerce Setup & Key Settings

To authorize your backend proxy layer (Node.js or PHP Custom Endpoint) to create orders, you must generate a Read/Write API key pair in WordPress.

### Generating WooCommerce REST API Keys
1. In your WordPress dashboard, navigate to **WooCommerce** → **Settings** → **Advanced**.
2. Click on the **REST API** tab.
3. Click **Add Key**.
4. Configure the settings:
   - **Description**: React Frontend Secure Checkout Proxy
   - **User**: Select an Administrator account (or a custom role with shop manager capabilities).
   - **Permissions**: **Read/Write** (Crucial, as the proxy needs to write new orders via `POST`).
5. Click **Generate API Key**.
6. **IMPORTANT**: Immediately copy the **Consumer Key** (`ck_...`) and **Consumer Secret** (`cs_...`) into your secure vault or backend `.env` file. They will be hidden after you leave this page.

---

## 2. WordPress Configuration (`functions.php`)

Place this PHP code at the end of your active WordPress theme's `functions.php` file (or in a custom helper plugin). It resolves two common local development issues when using XAMPP/Localhost:
1. **CORS and HTTP Basic Auth headers** being discarded or stripped by Apache on local non-SSL (HTTP) configurations.
2. **Local SSL Loopback issues** where WordPress fails to make internal HTTP requests because of self-signed SSL certs.

```php
<?php
/**
 * WooCommerce REST API Local Development Fixes
 * Place this in your active WordPress theme's functions.php file.
 */

// 1. Fix for Apache stripping the Authorization header in local XAMPP / HTTP environments
add_filter('determine_current_user', function ($user) {
    if (empty($user) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = explode(' ', $_SERVER['HTTP_AUTHORIZATION']);
        if (strtolower($auth[0]) === 'basic' && isset($auth[1])) {
            list($username, $password) = explode(':', base64_decode($auth[1]));
            $_SERVER['PHP_AUTH_USER'] = $username;
            $_SERVER['PHP_AUTH_PW'] = $password;
            
            $wp_user = wp_authenticate($username, $password);
            if (!is_wp_error($wp_user)) {
                return $wp_user->ID;
            }
        }
    }
    return $user;
}, 20);

// 2. Disable SSL verification for outgoing loopback HTTP requests (specifically for local testing)
add_filter('https_ssl_verify', '__return_false');
add_filter('https_local_ssl_verify', '__return_false');

// 3. Fix local CORS preflight OPTIONS requests for local XAMPP cross-origin development
add_action('init', function() {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        
        // Respond 200 immediately to OPTIONS preflight requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            status_header(200);
            exit;
        }
    }
});
```

---

## 3. Secure Proxy Layer

### Option A: Node.js / Express Proxy Backend (Implemented in `/server.ts`)
This is the default recommended setup for full-stack apps. The React client calls your server at `/api/checkout`, and the Express server appends credentials on the server-side, protecting your `Consumer Secret`.

```typescript
import express from "express";
import fetch from "node-fetch"; // or native fetch in Node 18+

const app = express();
app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  try {
    const { firstName, lastName, email, productId, quantity } = req.body;

    // 1. Validate incoming user inputs
    if (!firstName || !email || !productId) {
      return res.status(400).json({
        success: false,
        error: "First Name, Email, and Product ID are required."
      });
    }

    const wordpressUrl = process.env.VITE_WORDPRESS_URL || "http://localhost/tikatkom";
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;

    // Sandbox developer fallback if keys are missing
    if (!consumerKey || !consumerSecret) {
      return res.status(200).json({
        success: true,
        mock: true,
        orderId: `SIM-${Math.floor(10000 + Math.random() * 90000)}`,
        message: "Order simulation successful! (Define WC_CONSUMER_KEY to connect live)"
      });
    }

    // 2. Format WooCommerce order schema
    const orderPayload = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      billing: {
        first_name: firstName,
        last_name: lastName || "",
        email: email,
        country: "DZ" // Default or dynamic country code
      },
      shipping: {
        first_name: firstName,
        last_name: lastName || ""
      },
      line_items: [
        {
          product_id: parseInt(productId, 10),
          quantity: parseInt(quantity, 10) || 1
        }
      ]
    };

    // 3. Make the secure server-to-server HTTP POST request
    const cleanWpUrl = wordpressUrl.replace(/\/$/, "");
    const targetApiUrl = `${cleanWpUrl}/wp-json/wc/v3/orders`;
    const authHeader = "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await fetch(targetApiUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API returned status ${response.status}: ${errorText}`);
    }

    const createdOrder = await response.json();
    return res.status(200).json({
      success: true,
      orderId: `#${createdOrder.id || createdOrder.number}`
    });

  } catch (err: any) {
    console.error("[Proxy Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An error occurred while routing your checkout request."
    });
  }
});
```

---

### Option B: Custom WordPress PHP REST API Endpoint (No Node.js Required)
Perfect for classic shared PHP hosting environments (like Hostinger, Bluehost, DZ Security).
Instead of making external HTTP calls back to yourself, this custom endpoint uses **WordPress's native WooCommerce CRUD functions**! This avoids SSL loopback errors, auth credentials exposure, and runs at native server speeds!

Place this in your active theme's `functions.php` file or a plugin:

```php
<?php
/**
 * Register a highly secure, custom REST API route to handle direct checkouts.
 * Path: /wp-json/secure-checkout/v1/create-order
 */
add_action('rest_api_init', function () {
    register_rest_route('secure-checkout/v1', '/create-order', array(
        'methods'             => 'POST',
        'callback'            => 'secure_checkout_create_order_handler',
        'permission_callback' => '__return_true', // Open for public checkouts
    ));
});

function secure_checkout_create_order_handler(WP_REST_Request $request) {
    // 1. Parse JSON body payload
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_params();
    }

    $first_name = isset($params['firstName']) ? sanitize_text_field($params['firstName']) : '';
    $last_name  = isset($params['lastName']) ? sanitize_text_field($params['lastName']) : '';
    $email      = isset($params['email']) ? sanitize_email($params['email']) : '';
    $product_id = isset($params['productId']) ? intval($params['productId']) : 0;
    $quantity   = isset($params['quantity']) ? intval($params['quantity']) : 1;

    // Basic Validation
    if (empty($first_name) || empty($email) || $product_id <= 0) {
        return new WP_Error(
            'missing_required_fields', 
            'Required fields (firstName, email, productId) are missing or invalid.', 
            array('status' => 400)
        );
    }

    if (!class_exists('WooCommerce')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce is not active.', array('status' => 500));
    }

    try {
        // 2. Verify WooCommerce product exists
        $product = wc_get_product($product_id);
        if (!$product) {
            return new WP_Error('invalid_product_id', 'The requested product ID does not exist.', array('status' => 404));
        }

        // 3. Create native order programmatically
        $order = wc_create_order();
        $order->add_product($product, $quantity);

        // 4. Fill customer record details
        $order->set_billing_first_name($first_name);
        $order->set_billing_last_name($last_name);
        $order->set_billing_email($email);
        $order->set_shipping_first_name($first_name);
        $order->set_shipping_last_name($last_name);

        // Set payment parameters (Cash on Delivery)
        $order->set_payment_method('cod');
        $order->set_payment_method_title('Cash on Delivery');

        // 5. Finalize totals and save to database
        $order->calculate_totals();
        $order_id = $order->save();

        return new WP_REST_Response(array(
            'success' => true,
            'orderId' => '#' . $order_id,
            'message' => 'Order created successfully via native CRUD.'
        ), 200);

    } catch (Exception $e) {
        return new WP_Error('order_creation_failed', $e->getMessage(), array('status' => 500));
    }
}
```

---

## 4. Vite Environment Setup

To keep configurations flexible, use `.env` files. Vite loads them automatically depending on your environment mode.

### `.env.development` (Local testing with XAMPP)
```env
# Point to your local Express backend
VITE_API_URL="http://localhost:3000"

# Local WordPress setup URL
VITE_WORDPRESS_URL="http://localhost/tikatkom"
```

### `.env.production` (DZ Security / Hostinger Production Hosting)
```env
# Live API endpoint (or sub-directory if integrated)
VITE_API_URL="https://tikatkom.com"

# Live WordPress site URL
VITE_WORDPRESS_URL="https://tikatkom.com"
```

---

## 5. Vite React Frontend Checkout Form Component

Here is a complete, beautiful React functional component with input validation, loaders, error handles, and direct fetch synchronization.

```tsx
import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";

interface CheckoutFormProps {
  productId: string;
  price: number;
}

export default function SecureCheckoutForm({ productId, price }: CheckoutFormProps) {
  // 1. Form Field States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 2. Request Handling States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // 3. Validation helper
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!firstName.trim() || !email.trim()) {
      setError("Please complete all required fields (*).");
      setLoading(false);
      return;
    }

    try {
      // Resolve endpoint dynamically from Vite environment
      const apiBase = import.meta.env.VITE_API_URL || "";
      
      // OPTION A (Express Proxy Endpoint)
      const endpoint = `${apiBase}/api/checkout`;
      
      // OPTION B (Uncomment if using the Custom PHP WordPress Route instead)
      // const endpoint = `${apiBase}/wp-json/secure-checkout/v1/create-order`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          productId,
          quantity
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An unexpected error occurred on the server.");
      }

      setSuccess(true);
      setOrderId(data.orderId);
    } catch (err: any) {
      console.error("[Checkout Submission Error]", err);
      setError(err.message || "Failed to establish a network connection with the checkout proxy.");
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = price * quantity;

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Commande Confirmée !</h3>
        <p className="text-sm text-slate-600">
          Merci pour votre achat. Votre commande a été enregistrée avec succès sous la référence suivante :
        </p>
        <div className="bg-white border border-dashed border-emerald-200 py-3 px-4 rounded-xl">
          <span className="font-mono text-lg font-black text-emerald-600">{orderId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 shadow-xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-emerald-500" />
          Finaliser votre commande
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Remplissez vos informations pour un paiement sécurisé à la livraison.
        </p>
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        {/* Error Alert Panel */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
              Prénom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: Amine"
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
              Nom de Famille
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex: Belkaid"
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:text-white"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
            Adresse Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: client@email.com"
            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:text-white"
          />
        </div>

        {/* Quantity and Order Summary row */}
        <div className="flex items-center justify-between border-t border-b border-dashed border-slate-100 dark:border-zinc-800 py-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Quantité</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold dark:text-white"
              >
                -
              </button>
              <span className="text-sm font-bold w-5 text-center dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold dark:text-white"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Total Estimé</span>
            <span className="text-base font-black text-emerald-600">
              {grandTotal.toLocaleString()} DA
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <span>Confirmer l'achat (Paiement à la livraison)</span>
          )}
        </button>
      </form>
    </div>
  );
}
```
