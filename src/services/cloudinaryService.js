/**
 * Client-Side Cloudinary Service (Strict Zero Secret Storage)
 * All uploads are executed via server-signed parameters or unsigned fallback for direct client upload.
 */

// Function URL (configured for Firebase Cloud Functions or local emulator)
const FUNCTIONS_BASE_URL = 
  import.meta.env.VITE_FUNCTIONS_URL || 
  "https://us-central1-rasedul-karim-portfolio.cloudfunctions.net";

/**
 * Format any Cloudinary URL with enterprise optimization flags (f_auto, q_auto)
 */
export const getOptimizedImageUrl = (url, width = null) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  // If already contains optimization parameters
  if (url.includes('/f_auto,q_auto/')) return url;

  // Insert f_auto,q_auto right after /upload/
  const transform = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return url.replace('/upload/', `/upload/${transform}/`);
};

/**
 * Request signed parameters from Firebase Cloud Function
 */
export const fetchCloudinarySignature = async (idToken, folder = 'portfolio_assets') => {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getCloudinarySignature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ folder })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to obtain signature (Status ${response.status})`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Signed upload endpoint notice:", err.message);
    // Return null to allow fallback to unsigned upload if configured
    return null;
  }
};

/**
 * Upload Image directly from browser to Cloudinary
 * Strictly uses signed parameters from backend or unsigned preset without exposing API_SECRET
 */
export const uploadImageToCloudinary = async (file, idToken, folder = 'portfolio_assets') => {
  if (!file) throw new Error("No file provided for upload");

  const cloudName = "msekigsd";
  const apiKey = "279978363829318";

  // 1. Try to fetch signature from secure backend
  let signatureData = null;
  if (idToken) {
    signatureData = await fetchCloudinarySignature(idToken, folder);
  }

  const formData = new FormData();
  formData.append('file', file);

  if (signatureData && signatureData.signature) {
    // Enterprise Signed Upload Flow
    formData.append('api_key', signatureData.apiKey || apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder || folder);
  } else {
    // Unsigned Preset Flow (Zero secret leakage fallback)
    formData.append('upload_preset', 'portfolio_unsigned');
    formData.append('folder', folder);
  }

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const uploadResponse = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData
  });

  if (!uploadResponse.ok) {
    const errorInfo = await uploadResponse.json().catch(() => ({}));
    throw new Error(errorInfo.error?.message || `Cloudinary upload failed (${uploadResponse.status})`);
  }

  const result = await uploadResponse.json();

  // Return optimized media metadata map
  return {
    imageUrl: getOptimizedImageUrl(result.secure_url),
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format
  };
};

/**
 * Cascade Deletion: Purge asset from Cloudinary via secure serverless endpoint
 */
export const deleteCloudinaryAsset = async (publicId, idToken) => {
  if (!publicId) return;

  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/deleteCloudinaryAsset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("Asset deletion response notice:", err.error || response.statusText);
    }
  } catch (err) {
    console.warn("Cloudinary asset purge notice:", err.message);
  }
};
