import { initFirebase } from '../firebase/config';

const SUBSCRIBER_CACHE_KEY = 'cached_subscriber_count';
export const SUBSCRIBER_BASELINE = 10340; // 10.34K baseline

// Clear any stale local duplicate keys from previous versions
try {
  localStorage.removeItem('local_subscribed_emails');
} catch (_) {}

/**
 * Format subscriber numbers to clean K format (e.g. 10340 -> "10.34K")
 */
export const formatSubscriberCount = (count) => {
  const num = Math.max(SUBSCRIBER_BASELINE, Number(count) || SUBSCRIBER_BASELINE);
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

    // Update local subscriber cache for instant counter response
    try {
      const prevCount = Number(localStorage.getItem(SUBSCRIBER_CACHE_KEY)) || SUBSCRIBER_BASELINE;
      localStorage.setItem(SUBSCRIBER_CACHE_KEY, String(prevCount + 1));
    } catch (_) {}

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
  const cachedCount = localStorage.getItem(SUBSCRIBER_CACHE_KEY);
  if (cachedCount && Number(cachedCount) >= SUBSCRIBER_BASELINE) {
    onCountUpdate(Number(cachedCount));
  } else {
    onCountUpdate(SUBSCRIBER_BASELINE);
  }

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
              const additionalCount = Number(data?.count) || 0;
              const totalCount = SUBSCRIBER_BASELINE + additionalCount;
              localStorage.setItem(SUBSCRIBER_CACHE_KEY, String(totalCount));
              onCountUpdate(totalCount);
            }
          },
          (error) => {
            console.warn('Subscriber stream listener notice:', error);
          }
        );
      }
    } catch (err) {
      console.warn('Subscriber count listener init notice:', err);
    }
  };

  setupListener();

  return () => {
    try {
      unsubscribe();
    } catch (_) {}
  };
};
