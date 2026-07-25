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

  // 1. Order Checkout / Save Client Record API Route (WordPress WooCommerce)
  app.post("/api/checkout", async (req, res) => {
    try {
      const {
        fullName,
        phone,
        wilayaCode,
        wilayaName,
        commune,
        address,
        deliveryType,
        notes,
        productId,
        quantity,
        price,
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

      // Map product IDs
      // Ensure the product ID is parsed into a number for WooCommerce line items
      const numericProductId = parseInt(productId, 10);
      const line_items = isNaN(numericProductId)
        ? []
        : [{ product_id: numericProductId, quantity: parseInt(quantity, 10) || 1 }];

      // Seamless local fallback if WooCommerce credentials are missing
      if (!consumerKey || !consumerSecret) {
        console.warn("[WooCommerce API] Credentials are not configured in local environment.");
        
        const orderId = `#SIM-${Math.floor(10000 + Math.random() * 90000)}`;

        return res.status(200).json({
          success: true,
          mock: true,
          message: "Order recorded successfully (Developer Sandbox Fallback). Configure WC_CONSUMER_KEY and WC_CONSUMER_SECRET in .env to persist to live WordPress.",
          orderId
        });
      }

      // Format Client Name for WordPress Customer Fields
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

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
        customer_note: notes || "",
        meta_data: [
          { key: "_delivery_wilaya_code", value: wilayaCode },
          { key: "_delivery_wilaya_name", value: wilayaName },
          { key: "_delivery_commune", value: commune },
          { key: "_delivery_type", value: deliveryType },
          { key: "_delivery_grand_total", value: String(grandTotal) }
        ]
      };

      // Call WooCommerce REST API using Basic Authorization Header
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
      const orderId = `#${createdOrder.id || createdOrder.number}`;
      console.log(`[WooCommerce API] Order created successfully: ID ${orderId}`);

      return res.status(200).json({
        success: true,
        mock: false,
        orderId
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process order submission:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "An error occurred while communicating with WordPress."
      });
    }
  });

  // 2. ZR Express Proxy Route for Wilayas
  app.get("/api/zrexpress/wilayas", async (req, res) => {
    try {
      const tenantId = process.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
      const apiKey = process.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

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
        const errText = await response.text();
        return res.status(response.status).json({ success: false, error: errText });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("[ZR Express API] Error fetching wilayas:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Health check route
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
