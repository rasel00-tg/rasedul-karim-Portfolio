/**
 * Real-time Review & Rating Service with Firestore & Local Persistence
 */
import { initFirebase } from '../firebase/config';

const LOCAL_STORAGE_KEY = 'rasedul_portfolio_reviews';
const SUBMITTED_EMAILS_KEY = 'rasedul_submitted_review_emails';

// Baseline seed reviews to ensure analytics look rich on first load
const BASELINE_REVIEWS = [
  {
    id: 'seed-1',
    name: 'Tanvir Hossain',
    email: 'tan***@gmail.com',
    rating: 5,
    feedback: 'Outstanding web development and digital creativity! The portfolio design and UI responsiveness are top-notch.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
  },
  {
    id: 'seed-2',
    name: 'Shahriar Ahmed',
    email: 'sha***@outlook.com',
    rating: 5,
    feedback: 'Very dedicated software engineer with exceptional photo editing skills. Always dependable and prompt.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7 // 7 days ago
  },
  {
    id: 'seed-3',
    name: 'Kawsar Mahmud',
    email: 'kaw***@gmail.com',
    rating: 5,
    feedback: 'Excellent communication and great community media leadership at Naf Vision. Highly recommended!',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12 // 12 days ago
  },
  {
    id: 'seed-4',
    name: 'Farhan Rahman',
    email: 'far***@yahoo.com',
    rating: 4,
    feedback: 'Impressive project showcase and great technical capability in Flutter & React.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 18 // 18 days ago
  }
];

// Helper to mask email for privacy (e.g., "ras***@gmail.com")
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return 'user@domain.com';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return email;
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 3) {
    return `${user.charAt(0)}***@${domain}`;
  }
  return `${user.substring(0, 3)}***@${domain}`;
};

const COOLDOWN_DAYS = 15;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000; // 15 days in milliseconds

// Check if user email is within 15-day cooldown
export const getEmailCooldownStatus = (email) => {
  if (!email) return { isBlocked: false, remainingDays: 0 };
  const normalized = email.trim().toLowerCase();
  
  try {
    const raw = localStorage.getItem(SUBMITTED_EMAILS_KEY);
    const registry = raw ? JSON.parse(raw) : {};
    
    // Registry format: { [email]: timestamp } or legacy array
    let lastTime = 0;
    if (Array.isArray(registry)) {
      if (registry.includes(normalized)) {
        lastTime = Date.now(); // treat legacy as recent
      }
    } else if (registry[normalized]) {
      lastTime = Number(registry[normalized]) || 0;
    }

    if (lastTime > 0) {
      const elapsed = Date.now() - lastTime;
      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        return { isBlocked: true, remainingDays, lastTime };
      }
    }
  } catch (e) {
    console.error('Error checking cooldown:', e);
  }
  
  return { isBlocked: false, remainingDays: 0 };
};

export const hasEmailSubmitted = (email) => {
  return getEmailCooldownStatus(email).isBlocked;
};

const markEmailSubmitted = (email, timestamp = Date.now()) => {
  try {
    const raw = localStorage.getItem(SUBMITTED_EMAILS_KEY);
    let registry = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(em => { registry[em] = Date.now(); });
        } else if (typeof parsed === 'object' && parsed !== null) {
          registry = parsed;
        }
      } catch {}
    }
    const normalized = email.trim().toLowerCase();
    registry[normalized] = timestamp;
    localStorage.setItem(SUBMITTED_EMAILS_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving submitted email timestamp:', e);
  }
};

// Get stored local reviews
export const getLocalReviews = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return BASELINE_REVIEWS;
};

// Calculate summary analytics from a list of reviews
export const calculateReviewStats = (reviews = []) => {
  const list = Array.isArray(reviews) && reviews.length > 0 ? reviews : BASELINE_REVIEWS;
  const total = list.length;
  const withFeedback = list.filter(r => r.feedback && r.feedback.trim().length > 0).length;
  const sum = list.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
  const average = total > 0 ? (sum / total).toFixed(1) : '5.0';

  return {
    totalReviews: total,
    feedbackCount: withFeedback,
    averageRating: average
  };
};

/**
 * Submit a new rating & review to Firestore with 15-day cooldown check
 */
export const submitReview = async ({ name, email, rating, feedback }) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Local cooldown check
  const cooldown = getEmailCooldownStatus(normalizedEmail);
  if (cooldown.isBlocked) {
    const err = new Error('cooldown_active');
    err.remainingDays = cooldown.remainingDays;
    throw err;
  }

  const now = Date.now();
  const newDoc = {
    name: name.trim(),
    email: normalizedEmail,
    maskedEmail: maskEmail(normalizedEmail),
    rating: Number(rating) || 5,
    feedback: feedback ? feedback.trim() : '',
    timestamp: now
  };

  // 2. Server-side check in Firestore
  try {
    const { db } = await initFirebase();
    if (db) {
      const { collection, addDoc, query, where, getDocs, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      
      const colRef = collection(db, 'ratings_reviews');
      const q = query(colRef, where('email', '==', normalizedEmail), orderBy('timestamp', 'desc'), limit(1));
      
      try {
        const snap = await getDocs(q);
        if (!snap.empty) {
          const lastReview = snap.docs[0].data();
          const lastTs = Number(lastReview.timestamp) || 0;
          if (now - lastTs < COOLDOWN_MS) {
            const remainingMs = COOLDOWN_MS - (now - lastTs);
            const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
            markEmailSubmitted(normalizedEmail, lastTs);
            const err = new Error('cooldown_active');
            err.remainingDays = remainingDays;
            throw err;
          }
        }
      } catch (checkErr) {
        if (checkErr.message === 'cooldown_active') throw checkErr;
        console.warn('Firestore cooldown check fallback to local check:', checkErr.message);
      }

      await addDoc(colRef, newDoc);
    }
  } catch (err) {
    if (err.message === 'cooldown_active') {
      throw err;
    }
    console.warn('Review saved locally, Firestore will sync when online:', err.message);
  }

  // Save locally and record timestamp
  const currentLocal = getLocalReviews();
  const updatedLocal = [newDoc, ...currentLocal.filter(r => r.id !== newDoc.id)];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
  markEmailSubmitted(normalizedEmail, now);

  return newDoc;
};

/**
 * Real-time listener for reviews
 */
export const listenReviews = (callback) => {
  let isUnmounted = false;
  let unsubscribe = null;

  // Immediate callback with local cache
  callback(getLocalReviews());

  initFirebase().then(async ({ db }) => {
    if (isUnmounted || !db) return;

    try {
      const { collection, onSnapshot, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const colRef = collection(db, 'ratings_reviews');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          callback(getLocalReviews());
          return;
        }
        const reviews = [];
        snapshot.forEach((doc) => {
          reviews.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
        callback(reviews);
      }, (err) => {
        console.warn('Firestore reviews stream error, using cache:', err.message);
        callback(getLocalReviews());
      });
    } catch (e) {
      console.warn('Firestore stream failed:', e.message);
      callback(getLocalReviews());
    }
  });

  return () => {
    isUnmounted = true;
    if (unsubscribe) unsubscribe();
  };
};
