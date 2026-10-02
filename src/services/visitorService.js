import { initFirebase, firebaseConfig } from '../firebase/config';

const VISITOR_KEY = 'has_visited_portfolio';
const CACHED_INCREMENT_KEY = 'cached_visitor_increment';
export const BASELINE_COUNT = 123300; // 123.3K Baseline
const LAUNCH_DATE_MS = new Date('2026-09-01T00:00:00Z').getTime();
const DAILY_VISITOR_RATE = 50; // +50 visitors per day

/**
 * Calculate dynamic baseline with automated 50 visitors/day growth
 */
export const getDynamicVisitorBaseline = () => {
  const elapsedDays = Math.max(0, Math.floor((Date.now() - LAUNCH_DATE_MS) / (1000 * 60 * 60 * 24)));
  return BASELINE_COUNT + (elapsedDays * DAILY_VISITOR_RATE);
};

/**
 * Format visitor numbers into clean 123.3K format
 */
export const formatVisitorCount = (count) => {
  const dynamicBase = getDynamicVisitorBaseline();
  const num = Math.max(dynamicBase, Number(count) || dynamicBase);
  return `${(num / 1000).toFixed(1)}K`;
};

/**
 * Record a unique visit in Firestore atomic transaction if first visit
 */
export const recordUniqueVisit = async () => {
  try {
    const hasVisited = localStorage.getItem(VISITOR_KEY);
    if (hasVisited) return;

    const { db } = await initFirebase();

    if (db) {
      const { doc, getDoc, setDoc, increment, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const visitorDocRef = doc(db, 'analytics', 'visitors');
      
      const snap = await getDoc(visitorDocRef);
      if (!snap.exists()) {
        await setDoc(visitorDocRef, { count: 1, lastVisit: serverTimestamp() });
      } else {
        await setDoc(visitorDocRef, { count: increment(1), lastVisit: serverTimestamp() }, { merge: true });
      }
      localStorage.setItem(VISITOR_KEY, 'true');
    } else {
      localStorage.setItem(VISITOR_KEY, 'true');
    }
  } catch (err) {
    console.warn('Visitor counter registration note:', err);
    localStorage.setItem(VISITOR_KEY, 'true');
  }
};

/**
 * Real-time listener for visitor count with automated daily growth (50/day) and Firestore real updates
 */
export const listenVisitorCount = (onCountUpdate) => {
  const cachedIncrement = Number(localStorage.getItem(CACHED_INCREMENT_KEY)) || 0;
  onCountUpdate(getDynamicVisitorBaseline() + cachedIncrement);

  let unsubscribe = () => {};

  const setupListener = async () => {
    try {
      const { db } = await initFirebase();

      if (db) {
        const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const visitorDocRef = doc(db, 'analytics', 'visitors');

        unsubscribe = onSnapshot(visitorDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const rawIncrement = Number(data?.count || 0);
            localStorage.setItem(CACHED_INCREMENT_KEY, String(rawIncrement));
            const finalCount = getDynamicVisitorBaseline() + rawIncrement;
            onCountUpdate(finalCount);
          } else {
            onCountUpdate(getDynamicVisitorBaseline());
          }
        }, (err) => {
          console.warn('Visitor stream listener notice:', err);
        });
      } else {
        // Fallback REST fetch
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/analytics/visitors`);
        if (res.ok) {
          const json = await res.json();
          const rawIncrement = Number(json.fields?.count?.integerValue || json.fields?.count?.stringValue || 0);
          localStorage.setItem(CACHED_INCREMENT_KEY, String(rawIncrement));
          const finalCount = getDynamicVisitorBaseline() + rawIncrement;
          onCountUpdate(finalCount);
        } else {
          onCountUpdate(getDynamicVisitorBaseline());
        }
      }
    } catch (err) {
      console.warn('Visitor counter fetch notice:', err);
      onCountUpdate(getDynamicVisitorBaseline());
    }
  };

  setupListener();

  return () => {
    try {
      unsubscribe();
    } catch (_) {}
  };
};
