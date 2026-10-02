/**
 * Multi-Factor Control Gateway Service
 * Dynamically binds to Firestore: Collection 'control_auth' / Document 'credentials'
 * Manages 6-Digit PIN, Device Lockout (5 attempts = 3 hours), and Single Active Session Tracking
 */
import { initFirebase } from '../firebase/config';

const FAILED_ATTEMPTS_KEY = 'rasedul_control_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'rasedul_control_lockout_until';
const ACTIVE_SESSION_KEY = 'rasedul_active_session_id';

const LOCKOUT_DURATION_MS = 3 * 60 * 60 * 1000; // 3 Hours
const MAX_FAILED_ATTEMPTS = 5;

// Default fallback PINs if document is offline or being initialized
const DEFAULT_PINS = ['871176', '123456', '998877'];

/**
 * Check if the current device is locked out
 */
export const getDeviceLockoutStatus = () => {
  try {
    const lockoutUntil = Number(localStorage.getItem(LOCKOUT_UNTIL_KEY)) || 0;
    const now = Date.now();
    
    if (lockoutUntil > now) {
      const remainingMs = lockoutUntil - now;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      return {
        isLocked: true,
        remainingMs,
        remainingFormatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      };
    } else if (lockoutUntil > 0 && lockoutUntil <= now) {
      // Lockout expired, reset attempts
      localStorage.removeItem(LOCKOUT_UNTIL_KEY);
      localStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
    }
  } catch (e) {
    console.error('Error checking lockout status:', e);
  }

  const failedAttempts = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY)) || 0;
  return {
    isLocked: false,
    remainingMs: 0,
    remainingFormatted: '00:00:00',
    failedAttempts,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts)
  };
};

/**
 * Record a failed PIN attempt on this device
 */
export const recordFailedAttempt = () => {
  try {
    const current = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY)) || 0;
    const updated = current + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, String(updated));

    if (updated >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_UNTIL_KEY, String(lockoutUntil));
      return { isLocked: true, lockoutUntil };
    }
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - updated };
  } catch (e) {
    console.error('Error recording failed attempt:', e);
    return { isLocked: false, remainingAttempts: 1 };
  }
};

/**
 * Reset failed attempts on successful verification
 */
export const resetFailedAttempts = () => {
  try {
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  } catch {}
};

/**
 * Fetch credentials dynamically from Firestore collection: control_auth, doc: credentials
 */
export const fetchControlCredentials = async () => {
  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const credDocRef = doc(db, 'control_auth', 'credentials');
      const snap = await getDoc(credDocRef);
      if (snap.exists()) {
        return snap.data();
      }
    }
  } catch (e) {
    console.warn('Firestore credentials fetch notice:', e.message);
  }
  return null;
};

/**
 * Verify 6-digit PIN against Firestore 'control_auth/credentials'
 */
export const verifyPinAgainstFirestore = async (inputPin) => {
  const normalized = (inputPin || '').trim();
  if (normalized.length !== 6) return false;

  try {
    const creds = await fetchControlCredentials();
    if (creds && creds.pin) {
      const dbPin = String(creds.pin).trim();
      return dbPin === normalized;
    }
  } catch (e) {
    console.warn('PIN check fallback to offline cache:', e.message);
  }

  // Fallback if Firestore doc is newly initializing
  return DEFAULT_PINS.includes(normalized);
};

/**
 * Verify Email & Password against Firestore 'control_auth/credentials'
 */
export const verifyCredentialsAgainstFirestore = async (email, password) => {
  const normEmail = (email || '').trim().toLowerCase();
  const normPass = (password || '').trim();

  try {
    const creds = await fetchControlCredentials();
    if (creds && creds.email && creds.password) {
      const dbEmail = String(creds.email).trim().toLowerCase();
      const dbPass = String(creds.password).trim();
      if (dbEmail === normEmail && dbPass === normPass) {
        return { isValid: true, matchedFirestore: true };
      }
    }
  } catch (e) {
    console.warn('Credentials check notice:', e.message);
  }

  return { isValid: false, matchedFirestore: false };
};

/**
 * Generate and register a single active session in Firestore (control_auth/credentials)
 */
export const registerActiveSession = async (userEmail) => {
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);

  try {
    const { db } = await initFirebase();
    if (db) {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const credDocRef = doc(db, 'control_auth', 'credentials');
      await setDoc(credDocRef, {
        activeSessionId: sessionId,
        lastActiveUser: userEmail,
        lastLoginTimestamp: Date.now()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Firestore session register notice:', e.message);
  }

  return sessionId;
};

/**
 * Real-time listener for active single device session on 'control_auth/credentials'
 * Automatically triggers onSessionInvalidated if another device logs in
 */
export const listenActiveSession = (onSessionInvalidated) => {
  let isUnmounted = false;
  let unsubscribe = null;
  const mySessionId = localStorage.getItem(ACTIVE_SESSION_KEY);

  if (!mySessionId) return () => {};

  initFirebase().then(async ({ db }) => {
    if (isUnmounted || !db) return;

    try {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const credDocRef = doc(db, 'control_auth', 'credentials');

      unsubscribe = onSnapshot(credDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.activeSessionId && data.activeSessionId !== mySessionId) {
            // Another device has claimed the active session!
            localStorage.removeItem(ACTIVE_SESSION_KEY);
            onSessionInvalidated && onSessionInvalidated();
          }
        }
      }, (err) => {
        console.warn('Session stream listener notice:', err.message);
      });
    } catch (e) {
      console.warn('Failed to listen to session changes:', e.message);
    }
  });

  return () => {
    isUnmounted = true;
    if (unsubscribe) unsubscribe();
  };
};

/**
 * Clear local session
 */
export const clearActiveSession = () => {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
};
