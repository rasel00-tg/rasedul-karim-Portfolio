/**
 * Real-Time Features Service for Rasedul Karim Portfolio
 * Manages 4 Dedicated Collections:
 * 1. features_design_projects
 * 2. features_upcoming_projects
 * 3. features_favorite_tools
 * 4. features_deals_discounts
 */

import { firebaseConfig, initFirebase } from '../firebase/config';

export const COLLECTIONS = {
  DESIGN_PROJECTS: 'features_design_projects',
  UPCOMING_PROJECTS: 'features_upcoming_projects',
  FAVORITE_TOOLS: 'features_favorite_tools',
  DEALS_DISCOUNTS: 'features_deals_discounts',
  COUPON_REDEMPTIONS: 'coupon_redemptions'
};

// 1. Baseline Seed Data for Design Projects
export const BASELINE_DESIGN_PROJECTS = [
  {
    id: 'design-seed-1',
    title: 'FinTech Mobile Banking App',
    subtitle: 'Modern UI/UX with Glassmorphism and Neon accents',
    description: 'A cutting-edge financial mobile application interface tailored with dark-mode glassmorphic cards and dynamic transaction charts.',
    imageUrl: '/app1.png',
    projectUrl: 'https://behance.net',
    status: 'Active',
    category: 'UI/UX Design',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'design-seed-2',
    title: 'Minimalist E-Commerce Platform',
    subtitle: 'Next-gen shopping experience with 3D product previews',
    description: 'Clean Scandinavian-inspired e-commerce checkout flow with zero-friction navigation and high conversion micro-interactions.',
    imageUrl: '/app2.png',
    projectUrl: 'https://figma.com',
    status: 'Active',
    category: 'Web Design',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'design-seed-3',
    title: 'Brand Identity & Visual System',
    subtitle: 'Futuristic vector brand typography & social assets',
    description: 'Comprehensive brand styleguide, vector logotype assets, and social community media kits.',
    imageUrl: '/about.png',
    projectUrl: 'https://drive.google.com',
    status: 'Active',
    category: 'Branding',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

// 2. Baseline Seed Data for Upcoming Projects
export const BASELINE_UPCOMING_PROJECTS = [
  {
    id: 'upcoming-seed-1',
    title: 'NafPay Digital Smart Wallet',
    name: 'NafPay Digital Smart Wallet',
    releaseDate: 'Nov 2026',
    progress: 75,
    description: 'Ultra-fast contactless QR payment gateway engineered for local merchants, transports, and youth in Teknaf.',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    status: 'In Development',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'upcoming-seed-2',
    title: 'Teknaf Smart Transport GPS',
    name: 'Teknaf Smart Transport GPS',
    releaseDate: 'Q1 2027',
    progress: 60,
    description: 'Real-time coastal bus schedule tracker, live telemetry, and passenger route navigation platform.',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    status: 'In Development',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'upcoming-seed-3',
    title: 'Coastline Fishery Marketplace',
    name: 'Coastline Fishery Marketplace',
    releaseDate: 'Q2 2027',
    progress: 40,
    description: 'Direct B2B auction portal connecting coastal boat owners directly with regional markets with transparent pricing.',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    status: 'Planning',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString()
  }
];

// 3. Baseline Seed Data for Favorite Tools
export const BASELINE_FAVORITE_TOOLS = [
  {
    id: 'tool-seed-1',
    name: 'Figma',
    title: 'Figma',
    category: 'Design',
    officialUrl: 'https://figma.com',
    rating: '5.0',
    thumbnailUrl: '/design project.png',
    description: 'Collaborative vector design, wireframing, and interactive prototyping standard.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'tool-seed-2',
    name: 'VS Code',
    title: 'VS Code',
    category: 'Coding',
    officialUrl: 'https://code.visualstudio.com',
    rating: '5.0',
    thumbnailUrl: '/app1.png',
    description: 'High-speed extensible code editor configured with modern React & Tailwind tooling.',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'tool-seed-3',
    name: 'Tailwind CSS',
    title: 'Tailwind CSS',
    category: 'Coding',
    officialUrl: 'https://tailwindcss.com',
    rating: '4.9',
    thumbnailUrl: '/about.png',
    description: 'Utility-first modern CSS framework for rapid and ultra-flexible UI engineering.',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'tool-seed-4',
    name: 'Notion',
    title: 'Notion',
    category: 'Productivity',
    officialUrl: 'https://notion.so',
    rating: '4.9',
    thumbnailUrl: '/app2.png',
    description: 'Unified workspace for roadmaps, sprint notes, and architectural documentation.',
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString()
  },
  {
    id: 'tool-seed-5',
    name: 'Linear',
    title: 'Linear',
    category: 'Productivity',
    officialUrl: 'https://linear.app',
    rating: '4.8',
    thumbnailUrl: '/see project.png',
    description: 'Streamlined issue tracking and release management built for modern engineering teams.',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString()
  }
];

// 4. Baseline Seed Data for Deals & Discounts
export const BASELINE_DEALS_DISCOUNTS = [
  {
    id: 'deal-seed-1',
    title: 'Hostinger Cloud Pro Hosting',
    discountCode: 'RASEDUL75',
    discountPercent: '75% OFF',
    expiryDate: '2026-12-31',
    partnerUrl: 'https://hostinger.com',
    bannerUrl: '/add1.png',
    description: 'Exclusive 75% off on high-performance cloud hosting with free domain name, SSL, and automated backups.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'deal-seed-2',
    title: 'Envato Elements Unlimited Pass',
    discountCode: 'CREATIVE35',
    discountPercent: '35% OFF',
    expiryDate: '2026-11-30',
    partnerUrl: 'https://elements.envato.com',
    bannerUrl: '/add2.png',
    description: 'Special 35% discount on millions of creative templates, fonts, 3D assets, and stock videography.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

export const getBaselineForCollection = (collectionName) => {
  switch (collectionName) {
    case COLLECTIONS.DESIGN_PROJECTS:
      return BASELINE_DESIGN_PROJECTS;
    case COLLECTIONS.UPCOMING_PROJECTS:
      return BASELINE_UPCOMING_PROJECTS;
    case COLLECTIONS.FAVORITE_TOOLS:
      return BASELINE_FAVORITE_TOOLS;
    case COLLECTIONS.DEALS_DISCOUNTS:
      return BASELINE_DEALS_DISCOUNTS;
    default:
      return [];
  }
};

const getCacheKey = (collectionName) => `portfolio_cache_${collectionName}`;

export const getCachedItems = (collectionName) => {
  try {
    const raw = localStorage.getItem(getCacheKey(collectionName));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getBaselineForCollection(collectionName);
};

export const setCachedItems = (collectionName, items) => {
  try {
    localStorage.setItem(getCacheKey(collectionName), JSON.stringify(items));
  } catch {}
};

/**
 * Dispatches a client-side broadcast to update any listener immediately
 */
export const notifyFeatureUpdate = (collectionName) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_feature_updated', { 
      detail: { collectionName, timestamp: Date.now() } 
    }));
  }
};

/**
 * Format JS object to Firestore Document REST fields format
 */
const toFirestoreFields = (obj) => {
  const fields = {};
  Object.keys(obj).forEach((key) => {
    if (key === 'id') return;
    const val = obj[key];
    if (val === undefined || val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(item => ({ stringValue: String(item) }))
        }
      };
    } else {
      fields[key] = { stringValue: String(val) };
    }
  });
  return { fields };
};

/**
 * Unpack REST Firestore Document to normal JS object
 */
export const unpackFirestoreDoc = (doc) => {
  if (!doc) return null;
  const nameParts = doc.name ? doc.name.split('/') : [];
  const id = nameParts.length > 0 ? nameParts[nameParts.length - 1] : doc.id;
  const fields = doc.fields || {};
  const unpacked = { id };

  Object.keys(fields).forEach((k) => {
    const valObj = fields[k];
    if (valObj.stringValue !== undefined) unpacked[k] = valObj.stringValue;
    else if (valObj.integerValue !== undefined) unpacked[k] = parseInt(valObj.integerValue, 10);
    else if (valObj.doubleValue !== undefined) unpacked[k] = parseFloat(valObj.doubleValue);
    else if (valObj.booleanValue !== undefined) unpacked[k] = valObj.booleanValue;
    else if (valObj.arrayValue?.values) {
      unpacked[k] = valObj.arrayValue.values.map(v => v.stringValue || v);
    } else {
      unpacked[k] = valObj;
    }
  });

  return unpacked;
};

/**
 * Save a new feature item to Firestore (SDK with REST Fallback)
 */
export const saveFeatureItem = async (collectionName, itemData, idToken = null) => {
  const now = new Date().toISOString();
  const id = itemData.id || `${collectionName.replace('features_', '')}_${Date.now()}`;
  const docData = {
    ...itemData,
    id,
    createdAt: itemData.createdAt || now,
    updatedAt: now
  };

  // 1. Try Firestore direct SDK
  let sdkSuccess = false;
  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, docData, { merge: true });
      sdkSuccess = true;
    }
  } catch (err) {
    console.warn(`Firestore SDK write notice for [${collectionName}]:`, err.message);
  }

  // 2. REST Fallback if SDK not ready
  if (!sdkSuccess) {
    try {
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}/${id}`;
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify(toFirestoreFields(docData))
      });
      if (!res.ok) {
        console.warn('REST save error:', await res.text().catch(() => ''));
      }
    } catch (e) {
      console.warn('REST fetch fallback error:', e.message);
    }
  }

  // 3. Update local cache & broadcast
  const cached = getCachedItems(collectionName);
  const existingIdx = cached.findIndex(item => item.id === id);
  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...cached];
    updatedList[existingIdx] = docData;
  } else {
    updatedList = [docData, ...cached];
  }
  setCachedItems(collectionName, updatedList);
  notifyFeatureUpdate(collectionName);

  return docData;
};

/**
 * Update an existing feature item
 */
export const updateFeatureItem = async (collectionName, itemId, itemData, idToken = null) => {
  return saveFeatureItem(collectionName, { ...itemData, id: itemId }, idToken);
};

/**
 * Delete a feature item from Firestore
 */
export const deleteFeatureItem = async (collectionName, itemId, idToken = null) => {
  // 1. Try Firestore direct SDK
  let sdkSuccess = false;
  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collectionName, itemId));
      sdkSuccess = true;
    }
  } catch (err) {
    console.warn(`Firestore SDK delete notice for [${collectionName}]:`, err.message);
  }

  // 2. REST Fallback
  if (!sdkSuccess) {
    try {
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}/${itemId}`;
      await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        }
      });
    } catch (e) {
      console.warn('REST delete fallback error:', e.message);
    }
  }

  // 3. Update local cache & broadcast
  const cached = getCachedItems(collectionName);
  const updatedList = cached.filter(item => item.id !== itemId);
  setCachedItems(collectionName, updatedList);
  notifyFeatureUpdate(collectionName);

  return true;
};

/**
 * Check if a coupon code has already been redeemed by a specific email for a specific deal
 * @param {string} email
 * @param {string} couponCode
 * @param {string} dealId
 * @returns {Promise<{ alreadyRedeemed: boolean, details?: object }>}
 */
export const checkCouponRedemption = async (email, couponCode, dealId = '') => {
  if (!email || !couponCode) return { alreadyRedeemed: false };
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = couponCode.trim().toUpperCase();
  const cleanDealId = (dealId || '').trim();

  // Primary key tracks per-email per-deal redemption
  const perDealKey = cleanDealId 
    ? `${cleanEmail}_${cleanDealId}_${cleanCode}`.replace(/[^a-zA-Z0-9_]/g, '_')
    : `${cleanEmail}_${cleanCode}`.replace(/[^a-zA-Z0-9_]/g, '_');

  // 1. Check local client cache
  try {
    const localStore = JSON.parse(localStorage.getItem('coupon_redemptions') || '{}');
    if (localStore[perDealKey]) {
      return { alreadyRedeemed: true, details: localStore[perDealKey] };
    }
  } catch (e) {
    // ignore local storage error
  }

  // 2. Check Firestore via SDK
  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      
      // Check document by key
      const docRef = doc(db, COLLECTIONS.COUPON_REDEMPTIONS, perDealKey);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { alreadyRedeemed: true, details: data };
      }

      // Check query with dealId and email
      if (cleanDealId) {
        const q = query(
          collection(db, COLLECTIONS.COUPON_REDEMPTIONS),
          where('email', '==', cleanEmail),
          where('dealId', '==', cleanDealId)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          return { alreadyRedeemed: true, details: querySnap.docs[0].data() };
        }
      }
    }
  } catch (err) {
    console.warn('Firestore SDK redemption check notice:', err.message);
  }

  // 3. Check Firestore via REST
  try {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${COLLECTIONS.COUPON_REDEMPTIONS}/${perDealKey}`;
    const res = await fetch(baseUrl);
    if (res.ok) {
      const doc = await res.json();
      const unpacked = unpackFirestoreDoc(doc);
      return { alreadyRedeemed: true, details: unpacked };
    }
  } catch (err) {
    console.warn('Firestore REST redemption check error:', err.message);
  }

  return { alreadyRedeemed: false };
};

/**
 * Record a coupon redemption for an email (Enforcing single-use per email per deal post)
 */
export const recordCouponRedemption = async ({ dealId = '', email, couponCode, dealTitle, discountPercent, clientName = '', message = '', idToken = null }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = couponCode.trim().toUpperCase();
  const cleanDealId = (dealId || '').trim();

  const redemptionKey = cleanDealId 
    ? `${cleanEmail}_${cleanDealId}_${cleanCode}`.replace(/[^a-zA-Z0-9_]/g, '_')
    : `${cleanEmail}_${cleanCode}`.replace(/[^a-zA-Z0-9_]/g, '_');

  const now = new Date().toISOString();

  // First verify if already redeemed
  const check = await checkCouponRedemption(cleanEmail, cleanCode, cleanDealId);
  if (check.alreadyRedeemed) {
    throw new Error('This coupon code has already been redeemed with this email address for this deal.');
  }

  const redemptionData = {
    id: redemptionKey,
    dealId: cleanDealId,
    email: cleanEmail,
    couponCode: cleanCode,
    dealTitle: dealTitle || 'Exclusive Deal',
    discountPercent: discountPercent || 'Special Offer',
    clientName,
    message,
    redeemedAt: now
  };

  // 1. Save to local storage cache immediately
  try {
    const localStore = JSON.parse(localStorage.getItem('coupon_redemptions') || '{}');
    localStore[redemptionKey] = redemptionData;
    localStorage.setItem('coupon_redemptions', JSON.stringify(localStore));
  } catch (e) {
    // ignore
  }

  // 2. Save to Firestore
  await saveFeatureItem(COLLECTIONS.COUPON_REDEMPTIONS, redemptionData, idToken);

  return redemptionData;
};

