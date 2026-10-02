import { initFirebase } from '../firebase/config';

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

/**
 * Subscribe a new email directly with Cloud Firestore document verification & atomic counter increment
 */
export const subscribeEmail = async (rawEmail) => {
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

    const { doc, getDoc, setDoc, serverTimestamp, increment } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const subscriberDocRef = doc(db, 'subscribers', cleanEmail);
    const counterRef = doc(db, 'analytics', 'subscribers_count');

    // 2. Direct truth verification from Cloud Firestore
    const docSnapshot = await getDoc(subscriberDocRef);
    if (docSnapshot.exists()) {
      return {
        success: false,
        alreadySubscribed: true,
        message: 'Your email is already subscribed!'
      };
    }

    // 3. Persist new subscriber record to Cloud Firestore
    await setDoc(subscriberDocRef, {
      email: cleanEmail,
      subscribedAt: serverTimestamp(),
      platform: 'portfolio_web'
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
        const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
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
