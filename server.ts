import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for all routes (necessary for local XAMPP/WordPress integration on different origins)
  app.use(cors());

  // Support JSON payload decoding
  app.use(express.json());

  // 1. Order Checkout / Save Client Record API Route
  app.post("/api/checkout", async (req, res) => {
    try {
      const {
        fullName,
        phone,
        wilayaCode,
        wilayaName,
        commune,
        address,
        courier,
        deliveryType,
        notes,
        productId,
        quantity,
        price,
        shippingFee,
        grandTotal
      } = req.body;

      // Validate core required inputs
      if (!fullName || !phone || !wilayaCode) {
        return res.status(400).json({
          success: false,
          error: "Full Name, Phone number, and Wilaya are required to submit order records."
        });
      }

      const wordpressUrl = process.env.VITE_WORDPRESS_URL || "http://localhost/tikatkom";
      const consumerKey = process.env.WC_CONSUMER_KEY;
      const consumerSecret = process.env.WC_CONSUMER_SECRET;

      // Seamless local fallback if WooCommerce credentials are missing
      if (!consumerKey || !consumerSecret) {
        console.warn("[WooCommerce API] Credentials are not configured in local environment.");
        return res.status(200).json({
          success: true,
          mock: true,
          message: "Order recorded successfully (Developer Sandbox Fallback). Configure WC_CONSUMER_KEY and WC_CONSUMER_SECRET in .env to persist to live WordPress.",
          orderId: `SIM-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      // Format Client Name for WordPress Customer Fields
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      // Map product IDs
      // Ensure the product ID is parsed into a number for WooCommerce line items
      const numericProductId = parseInt(productId, 10);
      const line_items = isNaN(numericProductId)
        ? []
        : [{ product_id: numericProductId, quantity: parseInt(quantity, 10) || 1 }];

      // Format shipping fee into WooCommerce flat rate lines
      const parsedShippingFee = parseFloat(shippingFee);
      const shipping_lines = isNaN(parsedShippingFee) || parsedShippingFee <= 0
        ? []
        : [
            {
              method_id: "flat_rate",
              method_title: deliveryType === "home" ? "Livraison à domicile" : "Stop Desk / Point de relais",
              total: String(parsedShippingFee)
            }
          ];

      // Build a robust order payload according to standard WooCommerce order schema
      const orderPayload = {
        payment_method: "cod",
        payment_method_title: "Cash on Delivery",
        set_paid: false,
        billing: {
          first_name: firstName,
          last_name: lastName,
          address_1: address || `${commune}, ${wilayaName}`,
          city: commune || wilayaName,
          state: wilayaCode,
          country: "DZ", // Algeria country code
          phone: phone
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: address || `${commune}, ${wilayaName}`,
          city: commune || wilayaName,
          state: wilayaCode,
          country: "DZ",
          phone: phone
        },
        line_items,
        shipping_lines,
        customer_note: notes || "",
        meta_data: [
          { key: "_delivery_wilaya_code", value: wilayaCode },
          { key: "_delivery_wilaya_name", value: wilayaName },
          { key: "_delivery_commune", value: commune },
          { key: "_delivery_courier", value: courier },
          { key: "_delivery_type", value: deliveryType },
          { key: "_delivery_shipping_fee", value: String(parsedShippingFee || 0) },
          { key: "_delivery_grand_total", value: String(grandTotal) }
        ]
      };

      // Call WooCommerce REST API using Basic Authorization Header (highly secure)
      const cleanWpUrl = wordpressUrl.replace(/\/$/, "");
      const targetApiUrl = `${cleanWpUrl}/wp-json/wc/v3/orders`;

      console.log(`[WooCommerce API] Connecting to: ${targetApiUrl}`);
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
        const errorBody = await response.text();
        console.error(`[WooCommerce API] Error status ${response.status}:`, errorBody);
        throw new Error(`WordPress WooCommerce returned status ${response.status}: ${errorBody}`);
      }

      const createdOrder = await response.json();
      console.log(`[WooCommerce API] Order created successfully: ID #${createdOrder.id}`);

      return res.status(200).json({
        success: true,
        mock: false,
        orderId: `#${createdOrder.id || createdOrder.number}`
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process order submission:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "An error occurred while communicating with WordPress."
      });
    }
  });

  // 2. Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 3. Mount Vite / Static Asset handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Server] Running in DEVELOPMENT mode with Vite Middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Server] Running in PRODUCTION mode serving static dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
