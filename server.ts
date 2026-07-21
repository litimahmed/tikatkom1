import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// In-memory store for high-fidelity order tracking simulation
const trackingStore = new Map<string, any>();

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

      // Seamless local fallback if WooCommerce credentials are missing
      if (!consumerKey || !consumerSecret) {
        console.warn("[WooCommerce API] Credentials are not configured in local environment.");
        
        const orderId = `SIM-${Math.floor(10000 + Math.random() * 90000)}`;
        const trackingNumber = `ZR-${Math.floor(10000000 + Math.random() * 90000000)}`;

        // Record in local simulation memory for immediate search
        trackingStore.set(trackingNumber, {
          trackingNumber,
          orderId,
          customerName: fullName,
          phone,
          wilaya: wilayaName,
          commune,
          deliveryType,
          grandTotal,
          createdAt: new Date().toISOString(),
          history: [
            {
              status: "received",
              labelAR: "تم استقبال الطلب",
              labelFR: "Commande reçue",
              descAR: "تم تسجيل طلبك بنجاح وجاري معالجته لتسليمه لـ ZR Express.",
              descFR: "Votre commande a été enregistrée et est en cours de préparation.",
              time: new Date().toISOString()
            }
          ]
        });

        return res.status(200).json({
          success: true,
          mock: true,
          message: "Order recorded successfully (Developer Sandbox Fallback). Configure WC_CONSUMER_KEY and WC_CONSUMER_SECRET in .env to persist to live WordPress.",
          orderId,
          trackingNumber
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
      const orderId = `#${createdOrder.id || createdOrder.number}`;
      console.log(`[WooCommerce API] Order created successfully: ID ${orderId}`);

      // Generate tracking code
      let trackingNumber = `ZR-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      // Attempt real ZR Express API order creation if configured
      if (process.env.ZR_EXPRESS_API_KEY || process.env.ZR_EXPRESS_TOKEN) {
        try {
          const zrPayload = {
            api_key: process.env.ZR_EXPRESS_API_KEY,
            token: process.env.ZR_EXPRESS_TOKEN,
            nom_complet: fullName,
            telephone: phone,
            wilaya: wilayaName,
            commune: commune,
            adresse: address || commune,
            produit: `Order ${orderId}`,
            prix: grandTotal,
            type_livraison: deliveryType === "home" ? 1 : 2
          };
          const zrResponse = await fetch("https://api.zrexpress.com/api/v1/orders/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.ZR_EXPRESS_TOKEN || process.env.ZR_EXPRESS_API_KEY}`
            },
            body: JSON.stringify(zrPayload)
          });
          if (zrResponse.ok) {
            const zrData = await zrResponse.json();
            if (zrData && (zrData.tracking_number || zrData.code || zrData.NumColis)) {
              trackingNumber = zrData.tracking_number || zrData.code || zrData.NumColis;
            }
          }
        } catch (err) {
          console.error("[ZR Express API] Failed to auto-register order on real API:", err);
        }
      }

      // Record in local simulation memory for immediate search
      trackingStore.set(trackingNumber, {
        trackingNumber,
        orderId,
        customerName: fullName,
        phone,
        wilaya: wilayaName,
        commune,
        deliveryType,
        grandTotal,
        createdAt: new Date().toISOString(),
        history: [
          {
            status: "received",
            labelAR: "تم استقبال الطلب",
            labelFR: "Commande reçue",
            descAR: "تم تسجيل طلبك بنجاح وجاري معالجته لتسليمه لـ ZR Express.",
            descFR: "Votre commande a été enregistrée et est en cours de préparation.",
            time: new Date().toISOString()
          }
        ]
      });

      return res.status(200).json({
        success: true,
        mock: false,
        orderId,
        trackingNumber
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process order submission:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "An error occurred while communicating with WordPress."
      });
    }
  });

  // ZR Express Tracking API
  app.get("/api/zrexpress/tracking/:code", async (req, res) => {
    try {
      const { code } = req.params;
      if (!code) {
        return res.status(400).json({ success: false, error: "Tracking code is required." });
      }

      // If real credentials are set and it is a real tracking code (not simulated)
      if ((process.env.ZR_EXPRESS_API_KEY || process.env.ZR_EXPRESS_TOKEN) && !code.startsWith("SIM-") && !code.startsWith("ZR-")) {
        try {
          const zrResponse = await fetch(`https://api.zrexpress.com/api/v1/suivi?NumColis=${code}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${process.env.ZR_EXPRESS_TOKEN || process.env.ZR_EXPRESS_API_KEY}`
            }
          });
          if (zrResponse.ok) {
            const zrData = await zrResponse.json();
            return res.status(200).json({
              success: true,
              mock: false,
              data: zrData
            });
          }
        } catch (err) {
          console.error("[ZR Express Tracking API] Failed to fetch from ZR Express, falling back to local simulation.", err);
        }
      }

      const cleanCode = code.trim().toUpperCase();

      // Local lookup or simulated lookup
      const trackingInfo = trackingStore.get(cleanCode) || trackingStore.get(code);
      if (trackingInfo) {
        const timeDiffMs = Date.now() - new Date(trackingInfo.createdAt).getTime();
        const timeDiffMin = Math.floor(timeDiffMs / 60000);

        // Append timeline events based on time elapsed to make it extremely realistic!
        const updatedHistory = [...trackingInfo.history];

        if (timeDiffMin >= 1 && updatedHistory.length === 1) {
          updatedHistory.push({
            status: "transit",
            labelAR: "قيد النقل والتوزيع",
            labelFR: "En transit (Hub ZR Express)",
            descAR: "تم تأكيد طلبك وتم تسليمه لمركز فرز ZR Express.",
            descFR: "Votre commande est en cours de tri au centre ZR Express.",
            time: new Date(new Date(trackingInfo.createdAt).getTime() + 60000).toISOString()
          });
        }
        if (timeDiffMin >= 3 && updatedHistory.length === 2) {
          updatedHistory.push({
            status: "delivering",
            labelAR: "خارج للتوصيل",
            labelFR: "En cours de livraison",
            descAR: "الشحنة مع موزع شركة ZR Express وهي في الطريق إليك.",
            descFR: "Le colis est en cours de livraison par le livreur ZR Express.",
            time: new Date(new Date(trackingInfo.createdAt).getTime() + 180000).toISOString()
          });
        }
        if (timeDiffMin >= 5 && updatedHistory.length === 3) {
          updatedHistory.push({
            status: "delivered",
            labelAR: "تم التسليم بنجاح",
            labelFR: "Livré avec succès",
            descAR: "تم تسليم الشحنة للزبون وتلقي الدفع عند الاستلام.",
            descFR: "Le colis a été livré au client avec succès.",
            time: new Date(new Date(trackingInfo.createdAt).getTime() + 300000).toISOString()
          });
        }

        const currentStatus = updatedHistory[updatedHistory.length - 1].status;

        return res.status(200).json({
          success: true,
          mock: true,
          data: {
            ...trackingInfo,
            status: currentStatus,
            history: updatedHistory
          }
        });
      }

      // Default simulation for any other code that looks like a ZR Express tracking number
      const isZRCode = cleanCode.startsWith("ZR-") || cleanCode.length >= 8;

      if (isZRCode) {
        const mockHistory = [
          {
            status: "received",
            labelAR: "تم استقبال الطلب",
            labelFR: "Commande reçue",
            descAR: "تم تسجيل طلبك بنجاح وجاري معالجته لتسليمه لـ ZR Express.",
            descFR: "Votre commande a été enregistrée et est en cours de préparation.",
            time: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
          },
          {
            status: "transit",
            labelAR: "في مركز فرز ZR Express",
            labelFR: "En cours de tri (Centre ZR Express)",
            descAR: "الشحنة متواجدة حالياً بمركز الفرز الرئيسي بالجزائر العاصمة.",
            descFR: "Le colis est en cours de traitement au hub d'Alger.",
            time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString()
          },
          {
            status: "delivering",
            labelAR: "الشحنة مع الموزع (قيد التوصيل)",
            labelFR: "En cours de distribution",
            descAR: "الموزع في طريقه لتسليم الطلب، يرجى إبقاء الهاتف مفتوحاً.",
            descFR: "Le livreur est en route pour la livraison. Veuillez rester joignable.",
            time: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          }
        ];

        return res.status(200).json({
          success: true,
          mock: true,
          data: {
            trackingNumber: code,
            orderId: `#TKT-${Math.floor(10000 + Math.random() * 90000)}`,
            customerName: "عميل تيكاتكوم",
            wilaya: "الجزائر",
            commune: "الجزائر الوسطى",
            deliveryType: "home",
            grandTotal: 4500,
            status: "delivering",
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            history: mockHistory
          }
        });
      }

      return res.status(404).json({
        success: false,
        error: "رمز تتبع الطلب غير موجود. يرجى التأكد من الرمز والمحاولة مجدداً."
      });
    } catch (apiErr: any) {
      console.error("[Tracking API Error]:", apiErr);
      return res.status(500).json({ success: false, error: "حدث خطأ أثناء البحث عن الشحنة." });
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
