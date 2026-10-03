import { initFirebase, firebaseConfig } from '../firebase/config';

const CACHED_INCREMENT_KEY = 'cached_subscriber_increment';
export const SUBSCRIBER_BASELINE = 10340; // 10.34K baseline
const LAUNCH_DATE_MS = new Date('2026-09-01T00:00:00Z').getTime();
const DAILY_SUBSCRIBER_RATE = 5; // +5 subscribers per day

// Clear any stale local duplicate keys from previous versions
try {
  localStorage.removeItem('local_subscribed_emails');
} catch (_) {}

/**
 * Calculate dynamic subscriber baseline with automated 5 subscribers/day growth
 */
export const getDynamicSubscriberBaseline = () => {
  const elapsedDays = Math.max(0, Math.floor((Date.now() - LAUNCH_DATE_MS) / (1000 * 60 * 60 * 24)));
  return SUBSCRIBER_BASELINE + (elapsedDays * DAILY_SUBSCRIBER_RATE);
};

/**
 * Format subscriber numbers to clean K format (e.g. 10340 -> "10.34K")
 */
export const formatSubscriberCount = (count) => {
  const dynamicBase = getDynamicSubscriberBaseline();
  const num = Math.max(dynamicBase, Number(count) || dynamicBase);
  if (num >= 1000) {
    const kVal = (num / 1000).toFixed(2);
    return `${kVal.replace(/\.?0+$/, '')}K`;
  }
  return num.toLocaleString();
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Send 6-digit OTP to user's email via Nodemailer Gmail SMTP (Netlify Serverless Function or Express /api/send-otp)
 */
export const sendSubscriptionOtp = async (rawEmail, otp) => {
  const cleanEmail = (rawEmail || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' };
  }

  try {
    // Netlify Serverless Function ও লোকাল Express উভয়ের সাথে সামঞ্জস্যপূর্ণ এন্ডপয়েন্ট
    const targetUrl = API_BASE_URL 
      ? `${API_BASE_URL}/api/send-otp` 
      : '/.netlify/functions/send-otp';

    let res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp })
    });

    // যদি /.netlify/functions/send-otp কোনো কারণে 404 দেয়, সরাসরি /api/send-otp এ কল করবে
    if (res.status === 404 && !API_BASE_URL) {
      res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp })
      });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || data.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
      };
    }
    return data;
  } catch (error) {
    console.error('Network/API Error:', error);
    return {
      success: false,
      message: 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। নেটওয়ার্ক চেক করুন।'
    };
  }
};

/**
 * Subscribe a new email directly with Cloud Firestore document verification & atomic counter increment
 */
export const subscribeEmail = async (rawEmail, extraData = {}) => {
  const cleanEmail = (rawEmail || '').trim().toLowerCase();
  
  // 1. Input email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      error: 'invalid_email',
      message: 'Please enter a valid email address.'
    };
  }

  try {
    const { db } = await initFirebase();

    if (!db) {
      throw new Error('Firestore database instance unavailable. Please verify network connection.');
    }

    const { doc, getDoc, setDoc, serverTimestamp, increment } = await import('firebase/firestore');
    const subscriberDocRef = doc(db, 'subscribers', cleanEmail);
    const counterRef = doc(db, 'analytics', 'subscribers_count');

    // 2. Direct truth verification from Cloud Firestore
    const docSnapshot = await getDoc(subscriberDocRef);
    if (docSnapshot.exists()) {
      if (extraData.isVerified) {
        await setDoc(subscriberDocRef, { isVerified: true, lastVerifiedAt: serverTimestamp() }, { merge: true });
      }
      return {
        success: true,
        alreadySubscribed: true,
        message: 'Your email is already subscribed!'
      };
    }

    // 3. Persist new subscriber record to Cloud Firestore
    await setDoc(subscriberDocRef, {
      email: cleanEmail,
      subscribedAt: serverTimestamp(),
      platform: 'portfolio_web',
      isVerified: extraData.isVerified ?? true,
      ...extraData
    });

    // 4. Increment subscriber analytics counter
    try {
      await setDoc(counterRef, {
        count: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (countErr) {
      console.warn('Analytics counter increment note:', countErr);
    }

    return {
      success: true,
      message: 'Thank you! You have successfully subscribed to all future updates.'
    };
  } catch (err) {
    console.error('🔥 Firestore Subscription Error:', err);
    return {
      success: false,
      error: err?.message || 'firestore_error',
      message: err?.message?.includes('permission') 
        ? 'Permission denied by Firestore security rules. Please ensure rules are published.'
        : `Subscription failed: ${err.message || 'Please check your connection and try again.'}`
    };
  }
};

/**
 * Check if an email is subscribed in Cloud Firestore
 * @param {string} rawEmail
 * @returns {Promise<boolean>}
 */
export const isEmailSubscribed = async (rawEmail) => {
  const cleanEmail = (rawEmail || '').trim().toLowerCase();
  if (!cleanEmail) return false;

  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      // 1. Direct document lookup (ID is cleanEmail)
      const subscriberDocRef = doc(db, 'subscribers', cleanEmail);
      const docSnapshot = await getDoc(subscriberDocRef);
      if (docSnapshot.exists()) return true;

      // 2. Query lookup by email field
      const q = query(collection(db, 'subscribers'), where('email', '==', cleanEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return true;
    }
  } catch (err) {
    console.warn('Firestore subscription check SDK notice:', err.message);
  }

  // 3. Fallback check via REST API
  try {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/subscribers/${cleanEmail}`;
    const res = await fetch(baseUrl);
    if (res.ok) return true;
  } catch (e) {
    console.warn('REST subscription check notice:', e.message);
  }

  return false;
};

/**
 * Real-time listener for subscriber count using Firestore onSnapshot
 */
export const listenSubscriberCount = (onCountUpdate) => {
  const cachedIncrement = Number(localStorage.getItem(CACHED_INCREMENT_KEY)) || 0;
  onCountUpdate(getDynamicSubscriberBaseline() + cachedIncrement);

  let unsubscribe = () => {};

  const setupListener = async () => {
    try {
      const { db } = await initFirebase();

      if (db) {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const countDocRef = doc(db, 'analytics', 'subscribers_count');

        unsubscribe = onSnapshot(
          countDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const rawIncrement = Number(data?.count) || 0;
              localStorage.setItem(CACHED_INCREMENT_KEY, String(rawIncrement));
              const totalCount = getDynamicSubscriberBaseline() + rawIncrement;
              onCountUpdate(totalCount);
            } else {
              onCountUpdate(getDynamicSubscriberBaseline());
            }
          },
          (error) => {
            console.warn('Subscriber stream listener notice:', error);
          }
        );
      }
    } catch (err) {
      console.warn('Subscriber count listener init notice:', err);
      onCountUpdate(getDynamicSubscriberBaseline());
    }
  };

  setupListener();

  return () => {
    try {
      unsubscribe();
    } catch (_) {}
  };
};
