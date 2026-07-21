import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

// Load environment variables
dotenv.config();

// Define local Order Database interface
interface Order {
  orderId: string;
  trackingCode: string;
  fullName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  courier: string;
  deliveryType: string;
  notes: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  shippingFee: number;
  grandTotal: number;
  createdAt: string;
  status: string;
}

const ORDERS_FILE = path.join(process.cwd(), "orders.json");

// Safe helper to read orders from JSON file
function readOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read orders.json file:", error);
  }
  return [];
}

// Safe helper to write orders to JSON file
function writeOrders(orders: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to orders.json:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for all routes (necessary for local XAMPP/WordPress integration on different origins)
  app.use(cors());

  // Support JSON payload decoding
  app.use(express.json());

  // 1. Order Checkout / Save Client Record & Dispatch to ZR Express
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
        productName,
        quantity,
        price,
        shippingFee,
        grandTotal
      } = req.body;

      // Validate core required inputs
      if (!fullName || !phone || !wilayaCode) {
        return res.status(400).json({
          success: false,
          error: "Le nom, le numéro de téléphone et la Wilaya sont requis pour soumettre la commande."
        });
      }

      // 1. WooCommerce Integration
      const wordpressUrl = process.env.VITE_WORDPRESS_URL || "http://localhost/tikatkom";
      const consumerKey = process.env.WC_CONSUMER_KEY;
      const consumerSecret = process.env.WC_CONSUMER_SECRET;

      let orderId = "";
      let isWcMock = true;

      if (consumerKey && consumerSecret) {
        console.log(`[WooCommerce API] Connecting to: ${wordpressUrl}`);
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

        try {
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
            const errorBody = await response.text();
            console.error(`[WooCommerce API] Error status ${response.status}:`, errorBody);
            throw new Error(`WordPress WooCommerce returned status ${response.status}: ${errorBody}`);
          }

          const createdOrder = await response.json();
          console.log(`[WooCommerce API] Order created successfully: ID #${createdOrder.id}`);
          orderId = `#${createdOrder.id || createdOrder.number}`;
          isWcMock = false;
        } catch (wcErr: any) {
          console.error("[WooCommerce API Error] Failed to submit to live WooCommerce:", wcErr);
          // Fall back gracefully to simulation so that user is not completely blocked
          orderId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
        }
      } else {
        console.warn("[WooCommerce API] Credentials are not configured. Using mock order ID.");
        orderId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      // 2. Generate unique ZR Express tracking code with collision checks
      let trackingCode = "";
      const existingOrders = readOrders();
      let attempts = 0;
      while (attempts < 10) {
        const randCode = `ZR${Math.floor(100000000 + Math.random() * 900000000)}`;
        const exists = existingOrders.some(o => o.trackingCode === randCode);
        if (!exists) {
          trackingCode = randCode;
          break;
        }
        attempts++;
      }
      if (!trackingCode) {
        trackingCode = `ZR${Date.now().toString().slice(-9)}`;
      }

      // 3. Build order object
      const newOrder: Order = {
        orderId,
        trackingCode,
        fullName,
        phone,
        wilayaCode: String(wilayaCode),
        wilayaName,
        commune: String(commune),
        address: address || "",
        courier: courier || "zrexpress",
        deliveryType,
        notes: notes || "",
        productId: String(productId),
        productName: productName || "Article Premium",
        quantity: Number(quantity) || 1,
        price: Number(price) || 0,
        shippingFee: Number(shippingFee) || 0,
        grandTotal: Number(grandTotal) || 0,
        createdAt: new Date().toISOString(),
        status: "Prêt à expédier"
      };

      // 4. Save to local orders.json database
      existingOrders.push(newOrder);
      writeOrders(existingOrders);

      // 5. ZR Express Procolis API credentials check
      const zrToken = process.env.ZR_API_TOKEN;
      const zrKey = process.env.ZR_API_KEY;

      if (zrToken && zrKey) {
        console.log(`[ZR Express API] Dispatching parcel to Procolis. Tracking: ${trackingCode}, Order ID: ${orderId}`);
        
        const zrPayload = {
          Colis: [
            {
              Tracking: trackingCode,
              TypeLivraison: deliveryType === "home" ? "0" : "1", // 0 = Domicile, 1 = Stopdesk
              TypeColis: "0", // 0 = Standard
              Confrimee: "1", // 1 = Ready to Ship immediately
              Client: fullName,
              MobileA: phone,
              MobileB: "",
              Adresse: address || `${commune}, ${wilayaName}`,
              IDWilaya: String(wilayaCode),
              Commune: String(commune),
              Total: String(grandTotal),
              Note: notes || "",
              TProduit: `${productName || "Article"} (x${quantity})`,
              id_Externe: orderId,
              Source: "TIKATKOM"
            }
          ]
        };

        try {
          const response = await fetch("https://procolis.com/api_v1/add_colis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "token": zrToken,
              "key": zrKey
            },
            body: JSON.stringify(zrPayload)
          });

          if (!response.ok) {
            const errBody = await response.text();
            console.error(`[ZR Express API] Error from Procolis status ${response.status}:`, errBody);
          } else {
            const zrResult = await response.json();
            console.log(`[ZR Express API] Parcel dispatched successfully!`, zrResult);
          }
        } catch (apiErr) {
          console.error(`[ZR Express API] Network error during dispatch:`, apiErr);
        }
      } else {
        console.warn("[ZR Express API] API Token or Key not configured. Running order in high-fidelity developer simulator.");
      }

      // Return success response with order details and tracking code!
      return res.status(200).json({
        success: true,
        mock: isWcMock,
        orderId: orderId,
        trackingCode: trackingCode,
        message: "Commande enregistrée et colis généré avec succès !"
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process checkout:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Une erreur s'est produite lors de l'enregistrement de la commande."
      });
    }
  });

  // 1.5. International Headless Order Checkout (Credit Card / PayPal)
  app.post("/api/checkout-intl", async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        address,
        city,
        state,
        postcode,
        country,
        paymentMethod,
        items, // Array of { id, title, price, quantity }
        shippingFee,
        grandTotal
      } = req.body;

      if (!fullName || !email || !address || !city || !country || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Veuillez remplir tous les champs obligatoires pour finaliser la commande."
        });
      }

      // WooCommerce integration
      const wordpressUrl = process.env.VITE_WORDPRESS_URL || "http://localhost/tikatkom";
      const consumerKey = process.env.WC_CONSUMER_KEY;
      const consumerSecret = process.env.WC_CONSUMER_SECRET;

      let orderId = "";
      let isWcMock = true;

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      // Map line items for WooCommerce standard order payload
      const line_items = items.map((item: any) => ({
        product_id: parseInt(item.id, 10),
        quantity: parseInt(item.quantity, 10) || 1
      }));

      // Shipping lines
      const parsedShippingFee = parseFloat(shippingFee);
      const shipping_lines = isNaN(parsedShippingFee) || parsedShippingFee <= 0
        ? []
        : [
            {
              method_id: "flat_rate",
              method_title: "International Shipping",
              total: String(parsedShippingFee)
            }
          ];

      const orderPayload = {
        payment_method: paymentMethod === "paypal" ? "paypal" : "stripe",
        payment_method_title: paymentMethod === "paypal" ? "PayPal Payment" : "Credit Card Payment",
        set_paid: true, // Marked paid for CC / PayPal
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          address_1: address,
          city: city,
          state: state || "",
          postcode: postcode || "",
          country: country,
          phone: phone || ""
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city: city,
          state: state || "",
          postcode: postcode || "",
          country: country,
          phone: phone || ""
        },
        line_items,
        shipping_lines,
        meta_data: [
          { key: "_payment_method_selected", value: paymentMethod },
          { key: "_delivery_grand_total", value: String(grandTotal) }
        ]
      };

      if (consumerKey && consumerSecret) {
        try {
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
            const errorBody = await response.text();
            console.error(`[WooCommerce API] Error status ${response.status}:`, errorBody);
            throw new Error(`WordPress WooCommerce returned status ${response.status}: ${errorBody}`);
          }

          const createdOrder = await response.json();
          orderId = `#${createdOrder.id || createdOrder.number}`;
          isWcMock = false;
        } catch (wcErr: any) {
          console.error("[WooCommerce API Error] Failed to submit to live WooCommerce:", wcErr);
          orderId = `INT-${Math.floor(10000 + Math.random() * 90000)}`;
        }
      } else {
        orderId = `INT-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      // Generate simulated international tracking code (like DHL/FedEx)
      const trackingCode = `DHL${Math.floor(100000000 + Math.random() * 900000000)}WW`;

      // Save to orders.json with formatted names
      const existingOrders = readOrders();
      const firstItem = items[0];
      const prodName = items.length > 1 ? `${firstItem.title} (+${items.length - 1} articles)` : firstItem.title;

      const newOrder: Order = {
        orderId,
        trackingCode,
        fullName,
        phone: phone || "",
        wilayaCode: "INT",
        wilayaName: country,
        commune: city,
        address: address,
        courier: "dhl",
        deliveryType: "home",
        notes: `International Checkout via ${paymentMethod === "paypal" ? "PayPal" : "Credit Card"}. Email: ${email}`,
        productId: String(firstItem.id),
        productName: prodName,
        quantity: items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
        price: Number(firstItem.price) || 0,
        shippingFee: Number(shippingFee) || 0,
        grandTotal: Number(grandTotal) || 0,
        createdAt: new Date().toISOString(),
        status: "En cours de traitement"
      };

      existingOrders.push(newOrder);
      writeOrders(existingOrders);

      return res.status(200).json({
        success: true,
        mock: isWcMock,
        orderId: orderId,
        trackingCode: trackingCode,
        message: "Commande internationale enregistrée avec succès !"
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process international checkout:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Une erreur s'est produite lors de l'enregistrement de la commande internationale."
      });
    }
  });

  // 2. Client & Server Parcel Tracking Lookup
  app.post("/api/track", async (req, res) => {
    try {
      const { trackingCode } = req.body;
      if (!trackingCode) {
        return res.status(400).json({ success: false, error: "Le code de suivi est requis." });
      }

      const cleanTracking = trackingCode.trim();

      // Check if real ZR Express credentials exist for live tracking
      const token = process.env.ZR_API_TOKEN;
      const key = process.env.ZR_API_KEY;

      if (token && key) {
        console.log(`[ZR Express API] Querying real Procolis status for tracking: ${cleanTracking}`);
        try {
          const response = await fetch("https://procolis.com/api_v1/lire", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "token": token,
              "key": key
            },
            body: JSON.stringify({
              Colis: [
                { Tracking: cleanTracking }
              ]
            })
          });

          if (response.ok) {
            const result = await response.json();
            // Let's parse or pass through the response
            return res.status(200).json({
              success: true,
              realApi: true,
              data: result
            });
          } else {
            const errText = await response.text();
            console.error(`[ZR Express API] Error from Procolis /lire:`, errText);
          }
        } catch (apiErr) {
          console.error(`[ZR Express API] Network error on /lire:`, apiErr);
        }
      }

      // Simulation fallback: look up in our local database `orders.json`
      const localOrders = readOrders();
      const order = localOrders.find(o => o.trackingCode.toLowerCase() === cleanTracking.toLowerCase() || o.orderId.toLowerCase() === cleanTracking.toLowerCase());

      if (order) {
        // Return simulated tracker info based on when it was created
        const createdDate = new Date(order.createdAt);
        const diffMs = Date.now() - createdDate.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        let currentStatus = "Prêt à expédier"; // Ready to ship (Initial)
        let trackingHistory = [
          { status: "Commande Reçue", date: order.createdAt, desc: "Votre commande a été reçue et enregistrée." },
          { status: "Prêt à expédier", date: new Date(createdDate.getTime() + 1 * 60 * 1000).toISOString(), desc: "Le colis a été emballé et préparé pour l'expédition avec ZR Express." }
        ];

        if (diffMins >= 3) {
          currentStatus = "Expédié";
          trackingHistory.push({
            status: "Expédié",
            date: new Date(createdDate.getTime() + 3 * 60 * 1000).toISOString(),
            desc: "Le colis a été remis au transporteur ZR Express."
          });
        }
        if (diffMins >= 6) {
          currentStatus = "En cours de livraison";
          trackingHistory.push({
            status: "En cours de livraison",
            date: new Date(createdDate.getTime() + 6 * 60 * 1000).toISOString(),
            desc: "Le colis est arrivé à la commune de destination et est en cours de livraison."
          });
        }
        if (diffMins >= 10) {
          currentStatus = "Livré";
          trackingHistory.push({
            status: "Livré",
            date: new Date(createdDate.getTime() + 10 * 60 * 1000).toISOString(),
            desc: "Le colis a été livré au destinataire avec succès. Paiement encaissé."
          });
        }

        return res.status(200).json({
          success: true,
          realApi: false,
          trackingCode: order.trackingCode,
          orderId: order.orderId,
          clientName: order.fullName,
          productName: order.productName,
          total: order.grandTotal,
          wilayaName: order.wilayaName,
          commune: order.commune,
          deliveryType: order.deliveryType,
          currentStatus,
          history: trackingHistory
        });
      } else {
        // If not found in orders.json but matches ZR prefix or any test pattern, return a nice mock tracker so they can see how it looks
        if (cleanTracking.toUpperCase().startsWith("ZR") || cleanTracking === "123" || cleanTracking === "test") {
          const testCode = cleanTracking === "123" || cleanTracking === "test" ? "ZR772839182" : cleanTracking.toUpperCase();
          return res.status(200).json({
            success: true,
            realApi: false,
            trackingCode: testCode,
            orderId: "TKT-54910",
            clientName: "Ahmed Larbi",
            productName: "Montre Connectée Premium Ultra",
            total: 5400,
            wilayaName: "Oran",
            commune: "Bir El Djir",
            deliveryType: "home",
            currentStatus: "En cours de livraison",
            history: [
              { status: "Commande Reçue", date: new Date(Date.now() - 120 * 60000).toISOString(), desc: "Commande validée." },
              { status: "Prêt à expédier", date: new Date(Date.now() - 95 * 60000).toISOString(), desc: "Colis préparé et étiqueté." },
              { status: "Expédié", date: new Date(Date.now() - 60 * 60000).toISOString(), desc: "Expédié via ZR Express." },
              { status: "En cours de livraison", date: new Date(Date.now() - 10 * 60000).toISOString(), desc: "Le livreur est en route pour la livraison à domicile." }
            ]
          });
        }

        return res.status(404).json({
          success: false,
          error: "Code de suivi ou numéro de commande introuvable. Veuillez vérifier votre saisie."
        });
      }
    } catch (err: any) {
      console.error("[Tracking Error]", err);
      return res.status(500).json({ success: false, error: "Une erreur s'est produite lors de la recherche du suivi." });
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
