const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cloudinary = require("cloudinary").v2;
const cors = require("cors")({ origin: true });
require("dotenv").config();

admin.initializeApp();

// Configure Cloudinary with secure server-side environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "msekigsd";
const apiKey = process.env.CLOUDINARY_API_KEY || "279978363829318";
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

/**
 * Authentication Middleware:
 * Verifies Firebase Auth ID Token to ensure only authenticated admin performs actions
 */
const verifyAdminToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid token");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  if (adminEmail && decodedToken.email !== adminEmail) {
    throw new Error("Forbidden: Admin access only");
  }

  return decodedToken;
};

/**
 * Endpoint 1: Generate Secure Cloudinary Signature (HTTP/Callable)
 * Generates signed request parameters for direct browser/client-to-Cloudinary upload
 */
exports.getCloudinarySignature = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      // Check authentication
      await verifyAdminToken(req);

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = req.body?.folder || req.query?.folder || "portfolio_assets";

      const paramsToSign = {
        folder: folder,
        timestamp: timestamp
      };

      if (!apiSecret) {
        throw new Error("Server configuration error: CLOUDINARY_API_SECRET is missing");
      }

      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

      return res.status(200).json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder
      });
    } catch (err) {
      console.error("Signature generation error:", err.message);
      return res.status(401).json({ error: err.message });
    }
  });
});

/**
 * Endpoint 2: Secure Asset Deletion
 * Destroys old/unused Cloudinary assets by publicId upon verifying admin authorization
 */
exports.deleteCloudinaryAsset = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      // Check authentication
      await verifyAdminToken(req);

      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ error: "publicId parameter is required" });
      }

      const result = await cloudinary.uploader.destroy(publicId);

      return res.status(200).json({
        success: true,
        result
      });
    } catch (err) {
      console.error("Asset deletion error:", err.message);
      return res.status(401).json({ error: err.message });
    }
  });
});
