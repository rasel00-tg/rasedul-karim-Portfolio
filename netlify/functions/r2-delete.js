import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || "8640d86f82b73afcaa0fd1e4c5229d10").trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || "21933dc73905f37bf57d4f47a0437527").trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || "a54d14821a6f7efe4185bd3932d836b44c9399d4e1efa532105c7aad57f1a951").trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || "portfolio").trim();

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
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: "Method Not Allowed" }) };
  }

  try {
    const { fileUrl } = JSON.parse(event.body || "{}");
    if (!fileUrl) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: "fileUrl is required" }) };
    }

    const key = fileUrl.replace(/^https?:\/\/[^/]+\//, "");
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "File purged from Cloudflare R2" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
