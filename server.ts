
// Force IPv4 to fix ETIMEDOUT when connecting to ZR Express API
// Node.js default IPv6-first causes timeouts on some networks
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');


import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";


// ============================================
// ROBUST FETCH WITH RETRY & EXPONENTIAL BACKOFF
// ============================================
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 5,
    initialDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Fetch] Attempt ${attempt}/${maxRetries} for ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If response is OK, return it
      if (response.ok) {
        console.log(`[Fetch] Success on attempt ${attempt}`);
        return response;
      }

      // If response is 4xx/5xx that might be retryable, throw to retry
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // For 4xx errors (except 429), don't retry - return the response
      return response;

    } catch (error) {
      lastError = error as Error;
      console.warn(`[Fetch] Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 200;
      const waitTime = delay + jitter;
      console.log(`[Fetch] Waiting ${Math.round(waitTime)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      delay *= 2; // Double the delay for next attempt
    }
  }

  throw lastError || new Error('All fetch attempts failed');
}
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
        // UUIDs from territory API
        wilayaId,
        communeId,
        // Display names
        wilayaName,
        communeName,
        address,
        deliveryType,
        notes,
        productId,
        quantity,
        price,
        deliveryPrice,
        grandTotal,
        lang = 'ar'
      } = req.body;

      // ===== VALIDATION =====
      if (!fullName || !phone || !wilayaId || !communeId) {
        return res.status(400).json({
          success: false,
          error: "Full Name, Phone number, Wilaya, and Commune are required to submit order records."
        });
      }

      // Format phone number for Algeria
      const formattedPhone = phone.startsWith('+') ? phone : `+213${phone.replace(/^0/, '')}`;
      // ============================================
      // PART 1: CREATE WOOCOMMERCE ORDER
      // ============================================
      const wordpressUrl = process.env.VITE_WORDPRESS_URL || "http://localhost/tikatkom";
      const consumerKey = process.env.WC_CONSUMER_KEY;
      const consumerSecret = process.env.WC_CONSUMER_SECRET;

      let orderId = "";
      let isWcMock = true;

      // Format Client Name for WordPress Customer Fields
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      // Build WooCommerce order payload
      const orderPayload = {
        payment_method: "cod",
        payment_method_title: "Cash on Delivery",
        set_paid: false,
        billing: {
          first_name: firstName,
          last_name: lastName,
          address_1: address || `${communeName}, ${wilayaName}`,
          city: communeName || wilayaName,
          state: wilayaName,
          country: "DZ",
          phone: formattedPhone
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
          address_1: address || `${communeName}, ${wilayaName}`,
          city: communeName || wilayaName,
          state: wilayaName,
          country: "DZ",
          phone: formattedPhone
        },
        line_items: [
          {
            product_id: parseInt(productId, 10) || 0,
            quantity: parseInt(quantity, 10) || 1
          }
        ],
        customer_note: notes || "",
        meta_data: [
          { key: "_delivery_wilaya_id", value: wilayaId },
          { key: "_delivery_commune_id", value: communeId },
          { key: "_delivery_wilaya_name", value: wilayaName },
          { key: "_delivery_commune_name", value: communeName },
          { key: "_delivery_type", value: deliveryType },
          { key: "_delivery_grand_total", value: String(grandTotal) },
          { key: "_delivery_phone", value: formattedPhone },
          { key: "_delivery_price", value: String(deliveryPrice || 0) }
        ]
      };

      // Try to create WooCommerce order if credentials exist
      if (consumerKey && consumerSecret) {
        try {
          const cleanWpUrl = wordpressUrl.replace(/\/$/, "");
          const targetApiUrl = `${cleanWpUrl}/wp-json/wc/v3/orders`;
          const authHeader = "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

          console.log(`[WooCommerce API] Creating order at: ${targetApiUrl}`);

          const wcResponse = await fetch(targetApiUrl, {
            method: "POST",
            headers: {
              "Authorization": authHeader,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
          });

          if (wcResponse.ok) {
            const createdOrder = await wcResponse.json();
            orderId = `#${createdOrder.id || createdOrder.number}`;
            isWcMock = false;
            console.log(`[WooCommerce API] Order created successfully: ${orderId}`);
          } else {
            const errorBody = await wcResponse.text();
            console.error(`[WooCommerce API] Error ${wcResponse.status}:`, errorBody);
            orderId = `#TKT-${Math.floor(10000 + Math.random() * 90000)}`;
          }
        } catch (wcError) {
          console.error("[WooCommerce API] Connection error:", wcError);
          orderId = `#TKT-${Math.floor(10000 + Math.random() * 90000)}`;
        }
      } else {
        console.warn("[WooCommerce API] Credentials not configured. Using mock order ID.");
        orderId = `#TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      // ============================================
// PART 2: CREATE ZR EXPRESS PARCEL
// ============================================
      let trackingCode = "";
      let parcelCreated = false;
      let customerId = "";

      const zrApiKey = process.env.ZREXPRESS_API_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";
      const zrTenantId = process.env.ZREXPRESS_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";

      console.log("[ZR Express] Using Tenant ID:", zrTenantId);
      console.log("[ZR Express] Using API Key:", zrApiKey.substring(0, 10) + "...");

      try {
        console.log("[ZR Express] Creating parcel...");

        // ✅ STEP 1: Create customer
        try {
          const customerResponse = await fetchWithRetry("https://api.zrexpress.app/api/v1/customers/individual", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "X-Tenant": zrTenantId,
              "X-Api-Key": zrApiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: fullName,
              phone: {
                number1: formattedPhone
              }
            })
          }, 2, 1000);

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            customerId = customerData.id;
            console.log("[ZR Express] Customer created:", customerId);
          } else {
            const errText = await customerResponse.text();
            console.warn("[ZR Express] Customer creation failed:", errText);
            customerId = crypto.randomUUID ? crypto.randomUUID() : '3fa85f64-5717-4562-b3fc-2c963f66afa6';
          }
        } catch (customerError) {
          console.warn("[ZR Express] Customer creation error:", customerError);
          customerId = crypto.randomUUID ? crypto.randomUUID() : '3fa85f64-5717-4562-b3fc-2c963f66afa6';
        }

        // ✅ STEP 2: Create the parcel
        // Build delivery address dynamically
        const deliveryAddress: any = {
          cityTerritoryId: wilayaId,
          districtTerritoryId: communeId,
          postalCode: "16000"
        };

// Only add street if it exists and is not empty
        if (address && address.trim() !== '') {
          deliveryAddress.street = address.trim();
        } else {
          deliveryAddress.street = `${communeName}, ${wilayaName}`;
        }

        const parcelPayload = {
          customer: {
            customerId: customerId,
            name: fullName,
            phone: {
              number1: formattedPhone
            }
          },
          deliveryAddress: {
            cityTerritoryId: wilayaId,
            districtTerritoryId: communeId,
            street: address || `${communeName}, ${wilayaName}`,
            postalCode: "16000"
          },
          orderedProducts: [
            {
              productId: "3168b15f-6e5b-4f19-80d2-60dfeff5bdb1",
              productName: "Product",
              productSku: "SKU-001",
              unitPrice: Number(price) || 0,
              quantity: Number(quantity) || 1,
              length: 10,
              width: 10,
              height: 10,
              weight: 1,
              stockType: "local"
            }
          ],
          deliveryType: deliveryType === "desk" ? "pickup-point" : "home",
          description: notes || "Order from Tikatkom",
          amount: Number(grandTotal) || 0
        };

        console.log("[ZR Express] Parcel payload:", JSON.stringify(parcelPayload, null, 2));

        // ✅ STEP 3: Create the parcel (POST) - returns only ID
        const createResponse = await fetch("https://api.zrexpress.app/api/v1/parcels", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "X-Tenant": zrTenantId,
            "X-Api-Key": zrApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parcelPayload)
        });

        console.log("[ZR Express] Create parcel response status:", createResponse.status);

        if (createResponse.ok) {
          const createData = await createResponse.json();
          const parcelId = createData.id || "";
          console.log("[ZR Express] Parcel created with ID:", parcelId);

          // ✅ STEP 4: Fetch the full parcel details (GET) to get tracking number
          if (parcelId) {
            const getResponse = await fetch(`https://api.zrexpress.app/api/v1/parcels/${parcelId}`, {
              method: "GET",
              headers: {
                "accept": "application/json",
                "X-Tenant": zrTenantId,
                "X-Api-Key": zrApiKey,
                "Content-Type": "application/json"
              }
            });

            if (getResponse.ok) {
              const parcelData = await getResponse.json();
              console.log('[ZR Express] Full parcel details:', JSON.stringify(parcelData, null, 2));

              trackingCode = parcelData.trackingNumber || parcelData.id || "";
              parcelCreated = true;

              console.log(`[ZR Express] Parcel created successfully!`);
              console.log(`  - Parcel ID: ${parcelId}`);
                console.log(`  - Tracking Number: ${trackingCode}`);
              if (trackingCode) {
                try {
                  console.log('[SMS] Attempting to import twilio...');
                  const { sendTrackingSMS } = await import('./src/lib/twilio.ts');
                  console.log('[SMS] Twilio imported successfully');
                  const smsResult = await sendTrackingSMS(formattedPhone, trackingCode, lang || 'ar');
                  console.log('[SMS] Result:', smsResult);
                } catch (smsError: any) {
                  console.error('[SMS] Failed but order still completed:', smsError.message);
                  console.error('[SMS] Error stack:', smsError.stack);
                }
              }
            } else {
              const errorText = await getResponse.text();
              console.error(`[ZR Express] Failed to fetch parcel details (${getResponse.status}):`, errorText);
              // Still mark as created, use ID as fallback
              trackingCode = parcelId;
              parcelCreated = true;
            }
          }
        } else {
          const errorText = await createResponse.text();
          console.error(`[ZR Express] Failed to create parcel (${createResponse.status}):`, errorText);
        }
      } catch (zrError) {
        console.error("[ZR Express] Error creating parcel:", zrError);
        console.error("[ZR Express] Error stack:", zrError instanceof Error ? zrError.stack : zrError);
      }

      // ============================================
      // PART 3: RETURN RESPONSE
      // ============================================
      return res.status(200).json({
        success: true,
        mock: isWcMock,
        orderId: orderId,
        trackingCode: trackingCode,
        parcelCreated: parcelCreated,
        message: parcelCreated
            ? "Order and parcel created successfully!"
            : "Order created but parcel creation failed. Please contact support."
      });

    } catch (err: any) {
      console.error("[Server Error] Failed to process checkout:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "An error occurred while processing your order."
      });
    }
  });
  // 2. ZR Express Proxy Route for Wilayas
// server.ts - Keep this endpoint as-is (it's correct)
  app.get("/api/zrexpress/wilayas", async (req, res) => {
    try {
      const tenantId = process.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
      const apiKey = process.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

      const response = await fetchWithRetry("https://api.zrexpress.app/api/v1/territories/search", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)",
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
      },3, 1000);

      if (!response.ok) {
        const errText = await response.text();
        console.error("[ZR Express API Error]", errText);
        return res.status(response.status).json({
          success: false,
          error: errText
        });
      }

      const data = await response.json();
      console.log(`[ZR Express] Fetched ${data.items?.length || 0} wilayas`);
      return res.status(200).json(data);

    } catch (err: any) {
      console.error("[ZR Express API] Error fetching wilayas:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
  app.post("/api/zrexpress/communes", async (req, res) => {
    try {
      const { wilayaId } = req.body;

      console.log("[ZR Express Proxy] Fetching communes for wilaya:", wilayaId);

      if (!wilayaId) {
        return res.status(400).json({
          success: false,
          error: "wilayaId is required"
        });
      }

      const tenantId = process.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
      const apiKey = process.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

      const response = await fetchWithRetry("https://api.zrexpress.app/api/v1/territories/search", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          advancedFilter: {
            field: "parentId",
            operator: "eq",
            value: wilayaId
          },
          pageSize: 200,
          pageNumber: 1
        })
      }, 3, 1000);

      if (!response.ok) {
        const errText = await response.text();
        console.error("[ZR Express API Error]", errText);
        return res.status(response.status).json({
          success: false,
          error: errText
        });
      }

      const data = await response.json();
      console.log(`[ZR Express] Fetched ${data.items?.length || 0} communes`);
      return res.status(200).json(data);

    } catch (err: any) {
      console.error("[ZR Express API] Error fetching communes:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
  app.get("/api/zrexpress/rates/:territoryId", async (req, res) => {
    try {
      const { territoryId } = req.params;

      console.log("[ZR Express Proxy] Fetching delivery rate for territory:", territoryId);

      if (!territoryId) {
        return res.status(400).json({
          success: false,
          error: "territoryId is required"
        });
      }

      const tenantId = process.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
      const apiKey = process.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

      const response = await fetchWithRetry(`https://api.zrexpress.app/api/v1/delivery-pricing/rates/${territoryId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)"
        }
      }, 3, 1000);

      if (!response.ok) {
        const errText = await response.text();
        console.error("[ZR Express API Error]", errText);
        return res.status(response.status).json({
          success: false,
          error: errText
        });
      }

      const data = await response.json();
      console.log("[ZR Express] Delivery rate fetched:", data);
      return res.status(200).json(data);

    } catch (err: any) {
      console.error("[ZR Express API] Error fetching delivery rate:", err.message);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to fetch delivery rate"
      });
    }
  });
  // 4. Tracking endpoint - gets parcel details with full history
  app.post("/api/track", async (req, res) => {
    try {
      const { trackingCode } = req.body;

      if (!trackingCode) {
        return res.status(400).json({
          success: false,
          error: "Tracking code is required"
        });
      }

      const tenantId = process.env.VITE_ZR_TENANT_ID || "d1dc440e-39ab-4ae7-beb9-783750e06d83";
      const apiKey = process.env.VITE_ZR_SECRET_KEY || "xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG";

      console.log(`[Tracking] Searching for tracking number: ${trackingCode}`);

      // STEP 1: Search for the parcel by tracking number
      const searchResponse = await fetchWithRetry("https://api.zrexpress.app/api/v1/parcels/search", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          advancedFilter: {
            field: "trackingNumber",
            operator: "eq",
            value: trackingCode
          },
          pageSize: 1,
          pageNumber: 1
        })
      }, 2, 1000);

      if (!searchResponse.ok) {
        console.error(`[Tracking] Search failed: ${searchResponse.status}`);
        return res.status(404).json({
          success: false,
          error: "Tracking number not found"
        });
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Tracking number not found"
        });
      }

      const parcelId = searchData.items[0].id;
      console.log(`[Tracking] Found parcel ID: ${parcelId}`);

      // STEP 2: Get full parcel details
      const getResponse = await fetchWithRetry(`https://api.zrexpress.app/api/v1/parcels/${parcelId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)"
        }
      }, 2, 1000);

      if (!getResponse.ok) {
        console.error(`[Tracking] Get parcel failed: ${getResponse.status}`);
        return res.status(404).json({
          success: false,
          error: "Parcel details not found"
        });
      }

      const parcelData = await getResponse.json();

      // STEP 3: Get state history
      const historyResponse = await fetchWithRetry(`https://api.zrexpress.app/api/v1/parcels/${parcelId}/state-history`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "X-Tenant": tenantId,
          "X-Api-Key": apiKey,
          "User-Agent": "Mozilla/5.0 (compatible; Tikatkom-Server/1.0)"
        }
      }, 2, 1000);

      let history = [];
      if (historyResponse.ok) {
        history = await historyResponse.json();
        console.log(`[Tracking] Found ${history.length} history entries`);
      } else {
        console.warn(`[Tracking] History fetch failed: ${historyResponse.status}`);
      }

      // STEP 4: Format the response for frontend
      const formattedHistory = history.map((entry: any) => {
        // Get the state description from newState or previousState
        const state = entry.newState || entry.previousState || {};
        const stateDescription = state.description || state.name || "Mise à jour";

        // Determine the status label
        let statusLabel = stateDescription;
        if (entry.newState && entry.previousState) {
          statusLabel = `Transition: ${entry.previousState?.description || 'Unknown'} → ${entry.newState?.description || 'Unknown'}`;
        } else if (entry.newState) {
          statusLabel = entry.newState.description || entry.newState.name || "Nouveau statut";
        }

        return {
          status: statusLabel,
          date: entry.createdAt || entry.date || new Date().toISOString(),
          description: entry.comment || stateDescription || `Statut: ${state.name || 'Mise à jour'}`,
          modifiedBy: entry.modifiedBy?.fullName || "Système"
        };
      });

      // Sort history by date (oldest first for timeline)
      formattedHistory.sort((a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Get current status from parcel data
      const currentStatus = parcelData.state?.description ||
          parcelData.state?.name ||
          "Commande reçue";

      // Format the response
      const formattedResponse = {
        success: true,
        trackingCode: parcelData.trackingNumber || trackingCode,
        currentStatus: currentStatus,
        clientName: parcelData.customer?.name || "",
        address: parcelData.deliveryAddress?.street || "",
        commune: parcelData.deliveryAddress?.city || "",
        wilaya: parcelData.deliveryAddress?.cityTerritoryId || "",
        total: parcelData.amount || 0,
        deliveryType: parcelData.deliveryType === "pickup-point" ? "desk" : "home",
        createdAt: parcelData.createdAt,
        lastUpdate: parcelData.lastStateUpdateAt || parcelData.createdAt,
        history: formattedHistory
      };

      return res.status(200).json(formattedResponse);

    } catch (err: any) {
      console.error("[Tracking Error]", err);
      return res.status(500).json({
        success: false,
        error: err.message || "An error occurred while tracking your parcel"
      });
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
