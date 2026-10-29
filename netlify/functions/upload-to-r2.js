import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || "8640d86f82b73afcaa0fd1e4c5229d10").trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || "21933dc73905f37bf57d4f47a0437527").trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || "a54d14821a6f7efe4185bd3932d836b44c9399d4e1efa532105c7aad57f1a951").trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || "portfolio").trim();
const R2_PUBLIC_DOMAIN = (process.env.R2_PUBLIC_DOMAIN || "https://pub-646ef96285ab4ea585237b1060eb0116.r2.dev").trim().replace(/\/+$/, "");

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const { filename, fileData, image, contentType, folder } = JSON.parse(event.body || "{}");
    const rawData = fileData || image;

    if (!filename || !rawData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: "Filename and fileData are required." }),
      };
    }

    const folderName = (folder || "uploads").toString().trim().replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9_-]/g, "_") || "uploads";
    const safeExt = contentType === "image/jpeg" ? ".jpg" : ".webp";
    const cleanBase = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${Date.now()}_${cleanBase}${safeExt}`;
    const filePath = `${folderName}/${fileName}`;
    const base64Data = rawData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const mimeType = contentType || "image/webp";

    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3Client.send(putCommand);

    const publicUrl = `${R2_PUBLIC_DOMAIN}/${filePath}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        filePath,
        key: filePath,
        filename: fileName,
        bucket: R2_BUCKET_NAME,
        size: buffer.length,
        storage: "cloudflare-r2",
      }),
    };
  } catch (err) {
    console.error("Netlify Function R2 upload error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Cloudflare R2 upload error: ${err.message || "Unknown error"}`,
      }),
    };
  }
};
