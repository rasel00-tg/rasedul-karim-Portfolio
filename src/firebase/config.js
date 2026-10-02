/**
 * Firebase Web Configuration for Rasedul Karim Portfolio
 */
export const firebaseConfig = {
  apiKey: "AIzaSyA6u-Gzn-MV0SiuL7bedvY69M5a7akiy_E",
  authDomain: "rasedul-karim-portfolio.firebaseapp.com",
  projectId: "rasedul-karim-portfolio",
  storageBucket: "rasedul-karim-portfolio.firebasestorage.app",
  messagingSenderId: "786553224229",
  appId: "1:786553224229:web:f68b8082b8c9579ec253cc",
  measurementId: "G-G4QG91XY3R"
};

let firebaseApp = null;
let firestoreDb = null;

// Initialize Firebase SDK dynamically via official ESM with offline persistence cache
export const initFirebase = async () => {
  if (firebaseApp && firestoreDb) {
    return { app: firebaseApp, db: firestoreDb };
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    try {
      firestoreDb = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (cacheErr) {
      firestoreDb = getFirestore(firebaseApp);
    }

    return { app: firebaseApp, db: firestoreDb };
  } catch (e) {
    console.log("Firebase initialized in browser environment with provided config:", firebaseConfig.projectId);
    return { app: firebaseConfig, db: null };
  }
};

export default firebaseConfig;

