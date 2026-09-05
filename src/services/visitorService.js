import { initFirebase, firebaseConfig } from '../firebase/config';

const VISITOR_KEY = 'has_visited_portfolio';
const CACHED_COUNT_KEY = 'cached_visitor_count';
const BASELINE_COUNT = 1477;

/**
 * Record a unique visit in Firestore atomic transaction if first visit
 */
export const recordUniqueVisit = async () => {
  try {
    const hasVisited = localStorage.getItem(VISITOR_KEY);
    if (hasVisited) return;

    const { db } = await initFirebase();

    if (db) {
      const { doc, getDoc, setDoc, increment } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const visitorDocRef = doc(db, 'analytics', 'visitors');
      
      const snap = await getDoc(visitorDocRef);
      if (!snap.exists()) {
        await setDoc(visitorDocRef, { count: BASELINE_COUNT + 1, lastVisit: new Date().toISOString() });
      } else {
        const currentData = snap.data();
        if ((currentData?.count || 0) < BASELINE_COUNT) {
          await setDoc(visitorDocRef, { count: BASELINE_COUNT + 1, lastVisit: new Date().toISOString() }, { merge: true });
        } else {
          await setDoc(visitorDocRef, { count: increment(1), lastVisit: new Date().toISOString() }, { merge: true });
        }
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
 * Real-time listener for visitor count with calibrated baseline (1477)
 */
export const listenVisitorCount = (onCountUpdate) => {
  const cachedCount = localStorage.getItem(CACHED_COUNT_KEY);
  if (cachedCount && Number(cachedCount) >= BASELINE_COUNT) {
    onCountUpdate(Number(cachedCount));
  } else {
    onCountUpdate(BASELINE_COUNT);
  }

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
            const rawCount = Number(data?.count || 0);
            const finalCount = rawCount >= BASELINE_COUNT ? rawCount : BASELINE_COUNT + rawCount;
            localStorage.setItem(CACHED_COUNT_KEY, String(finalCount));
            onCountUpdate(finalCount);
          } else {
            onCountUpdate(BASELINE_COUNT);
          }
        }, (err) => {
          console.warn('Visitor stream listener notice:', err);
        });
      } else {
        // Fallback REST fetch
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/analytics/visitors`);
        if (res.ok) {
          const json = await res.json();
          const rawCount = Number(json.fields?.count?.integerValue || json.fields?.count?.stringValue || 0);
          const finalCount = rawCount >= BASELINE_COUNT ? rawCount : BASELINE_COUNT + rawCount;
          localStorage.setItem(CACHED_COUNT_KEY, String(finalCount));
          onCountUpdate(finalCount);
        } else {
          onCountUpdate(BASELINE_COUNT);
        }
      }
    } catch (err) {
      console.warn('Visitor counter fetch notice:', err);
      onCountUpdate(BASELINE_COUNT);
    }
  };

  setupListener();

  return () => {
    unsubscribe();
  };
};
