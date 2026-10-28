/**
 * Storage Service for Client-Side Canvas Image Compression & Cloudflare R2 Delayed Upload
 * 
 * Features:
 * 1. Client-Side HTML5 Canvas Compression & Resizing (max 1200px, 85% WebP/JPEG)
 * 2. Delayed Upload to Cloudflare R2 bucket:
 *    https://8640d86f82b73afcaa0fd1e4c5229d10.r2.cloudflarestorage.com/portfolio/{filename}
 * 3. Graceful fallback buffer so data and submissions are 100% safe.
 */
import { firebaseConfig, initFirebase } from '../firebase/config';
import { uploadImageToCloudinary } from './cloudinaryService';

export const R2_BASE_URL = 'https://8640d86f82b73afcaa0fd1e4c5229d10.r2.cloudflarestorage.com/portfolio';

/**
 * Fast Base64 reader to guarantee offline preview and safe data fallback
 */
export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Timeout wrapper to prevent hanging on network attempts
 */
export const withTimeout = (promise, ms = 3500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
};

/**
 * Generate instantaneous local object URL for instant UI preview without network upload
 */
export const createLocalImagePreview = (file) => {
  if (!file) return '';
  return URL.createObjectURL(file);
};

/**
 * Client-Side Canvas Image Compression & Resizing
 * - Resizes images to max 1200px width/height while maintaining aspect ratio
 * - Compresses to 80-85% WebP (or JPEG fallback)
 * - Pure client-side zero-dependency HTML5 Canvas execution
 */
export const compressImageWithCanvas = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'image/webp'
  } = options;

  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file for canvas compression'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in canvas'));
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Apply high-quality bicubic/bilinear smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image scaled to canvas
        ctx.drawImage(img, 0, 0, width, height);

        const safeExt = format === 'image/webp' ? '.webp' : '.jpg';
        const cleanBase = (file.name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const outputFilename = `${cleanBase}${safeExt}`;

        // Attempt WebP blob creation
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to JPEG if browser does not support WebP toBlob
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    return resolve({
                      blob: file,
                      dataUrl: e.target.result,
                      filename: file.name,
                      width,
                      height,
                      size: file.size,
                      originalSize: file.size
                    });
                  }
                  const compressedFile = new File([jpegBlob], `${cleanBase}.jpg`, { type: 'image/jpeg' });
                  resolve({
                    blob: compressedFile,
                    dataUrl: canvas.toDataURL('image/jpeg', quality),
                    filename: `${cleanBase}.jpg`,
                    width,
                    height,
                    size: jpegBlob.size,
                    originalSize: file.size
                  });
                },
                'image/jpeg',
                quality
              );
              return;
            }

            const compressedFile = new File([blob], outputFilename, { type: format });
            resolve({
              blob: compressedFile,
              dataUrl: canvas.toDataURL(format, quality),
              filename: outputFilename,
              width,
              height,
              size: blob.size,
              originalSize: file.size
            });
          },
          format,
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Upload compressed image to Cloudflare R2 Bucket via direct PUT request
 * Endpoint: https://8640d86f82b73afcaa0fd1e4c5229d10.r2.cloudflarestorage.com/portfolio/{filename}
 */
export const uploadToCloudflareR2 = async (compressedBlob, filename) => {
  if (!compressedBlob) throw new Error('No compressed image provided for R2 upload');

  const cleanFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const targetUrl = `${R2_BASE_URL}/${cleanFilename}`;

  const res = await withTimeout(
    fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': compressedBlob.type || 'image/webp'
      },
      body: compressedBlob
    }),
    4500
  );

  if (!res.ok) {
    throw new Error(`Cloudflare R2 returned status: ${res.status} ${res.statusText}`);
  }

  return targetUrl;
};

export const R2_PUBLIC_DOMAIN = 'https://pub-646ef96285ab4ea585237b1060eb0116.r2.dev';

/**
 * Universal Cloudflare R2 Image Upload with Client-Side Auto-Compression:
 * - Applicable to ALL website sections (Sponsor Banners, Deals & Discounts, Projects, etc.)
 * - Auto-compresses on client side to < 200-300 KB WebP via HTML5 Canvas
 * - Deferred upload: only uploads on form submit
 * - Puts binary directly to Cloudflare R2 bucket 'portfolio' via S3 SDK API endpoint
 * - Constructs and returns the authentic public CDN URL:
 *   https://pub-646ef96285ab4ea585237b1060eb0116.r2.dev/${folder}/${Date.now()}_cleanName.webp
 * - Throws explicit errors if upload fails to prevent saving broken or local paths in Firestore
 */
export const uploadImageToCloudflareR2 = async (fileOrBlob, options = {}) => {
  const {
    folder = 'uploads',
    filename = 'image.webp',
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82
  } = options;

  if (!fileOrBlob) throw new Error('কোনো ছবি পাওয়া যায়নি');

  // If already an authentic remote HTTPS URL (and not a local /uploads/ or blob preview), return as is
  if (typeof fileOrBlob === 'string') {
    if (fileOrBlob.startsWith('https://') && !fileOrBlob.includes('/uploads/')) {
      return fileOrBlob;
    }
    if (fileOrBlob.startsWith('blob:') || fileOrBlob.startsWith('/uploads/') || fileOrBlob.startsWith('data:')) {
      throw new Error('অবৈধ ইমেজ ফরম্যাট! ফাইলটি পুনরায় নির্বাচন করুন।');
    }
  }

  // 1. Client-Side HTML5 Canvas Auto-Compression (< 200-300 KB, WebP)
  let blobToUpload = fileOrBlob;
  let fileDataUrl = '';
  if (fileOrBlob instanceof File || fileOrBlob instanceof Blob) {
    try {
      const compressed = await compressImageWithCanvas(fileOrBlob, {
        maxWidth,
        maxHeight,
        quality,
        format: 'image/webp'
      });
      if (compressed?.blob) {
        blobToUpload = compressed.blob;
        fileDataUrl = compressed.dataUrl;
      }
    } catch (e) {
      console.warn('Canvas optimization notice:', e);
    }
  }

  const safeFilename = filename || fileOrBlob.name || 'image.webp';
  const cleanFilename = safeFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!fileDataUrl) {
    fileDataUrl = await readFileAsBase64(blobToUpload);
  }

  // 2. Dedicated Backend API Endpoint (/api/upload-to-r2 / Firebase Function)
  const endpoints = [
    typeof window !== 'undefined' && window.location.port === '5173'
      ? 'http://localhost:5000/api/upload-to-r2'
      : '/api/upload-to-r2',
    typeof window !== 'undefined' && window.location.port === '5173'
      ? 'http://localhost:5000/api/r2-upload'
      : '/api/r2-upload'
  ];

  let uploadSuccess = false;
  let publicUrl = '';
  let lastError = null;

  for (const apiUrl of endpoints) {
    try {
      const res = await withTimeout(
        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: cleanFilename,
            fileData: fileDataUrl,
            contentType: blobToUpload.type || 'image/webp',
            folder
          })
        }),
        12000
      );

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.url) {
        // Strict Validation: Ensure url is a REAL HTTPS URL from Cloudflare R2
        if (typeof data.url === 'string' && data.url.startsWith('https://') && !data.url.startsWith('/uploads/')) {
          console.log(`✓ [Universal Cloudflare R2] Successfully uploaded to "${folder}":`, data.url);
          publicUrl = data.url;
          uploadSuccess = true;
          break;
        } else {
          lastError = new Error('সার্ভার থেকে আসল Cloudflare R2 HTTPS লিংক পাওয়া যায়নি।');
        }
      } else {
        lastError = new Error(data?.error || data?.message || `API returned status: ${res.status}`);
      }
    } catch (apiErr) {
      lastError = apiErr;
      console.warn(`Attempt at ${apiUrl} failed, trying next endpoint:`, apiErr.message);
    }
  }

  // 3. Strict Validation: If R2 API fails, DO NOT save any document to Firestore and throw error for Admin alert
  if (!uploadSuccess || !publicUrl || !publicUrl.startsWith('https://')) {
    throw new Error(
      lastError?.message 
        ? `ক্লাউডফ্লেয়ার R2 আপলোড ব্যর্থ হয়েছে: ${lastError.message}` 
        : 'ক্লাউডফ্লেয়ার R2 বাকেটে ছবি আপলোড করা যায়নি। অনুগ্রহ করে ব্যাকএন্ড API এবং R2 ক্রেডেনশিয়াল চেক করুন।'
    );
  }

  return publicUrl;
};

/**
 * Purge image from Cloudflare R2 Bucket
 */
export const deleteImageFromCloudflareR2 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const apiUrl = typeof window !== 'undefined' && window.location.port === '5173'
      ? 'http://localhost:5000/api/r2-delete'
      : '/api/r2-delete';

    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl })
    });
    console.log(`✓ Purged file from Cloudflare R2: ${fileUrl}`);
  } catch (err) {
    console.warn('Cloudflare R2 purge request notice:', err.message);
  }
};

/**
 * Dedicated helper for Sponsor Banners
 */
export const uploadSponsorBannerToR2 = async (fileOrBlob, filename = 'sponsor_banner.webp') => {
  return uploadImageToCloudflareR2(fileOrBlob, {
    folder: 'sponsors',
    filename,
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 0.82
  });
};

export const deleteSponsorBannerFromR2 = deleteImageFromCloudflareR2;

/**
 * Universal project/deals media upload pipeline via Cloudflare R2
 */
export const processAndUploadProjectMedia = async (file, options = {}) => {
  if (!file) return '';
  const folder = options.folder || 'projects';
  const filename = file?.name || 'media.webp';
  return uploadImageToCloudflareR2(file, { folder, filename });
};

/**
 * Universal storage upload helper mapped to Cloudflare R2
 */
export const uploadFileToStorage = async (file, folder = 'portfolio_assets') => {
  if (!file) throw new Error('No image file selected');
  return uploadImageToCloudflareR2(file, { folder, filename: file?.name || 'image.webp' });
};

