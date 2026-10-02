import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyA6u-Gzn-MV0SiuL7bedvY69M5a7akiy_E",
  authDomain: "rasedul-karim-portfolio.firebaseapp.com",
  projectId: "rasedul-karim-portfolio",
  storageBucket: "rasedul-karim-portfolio.firebasestorage.app",
  messagingSenderId: "786553224229",
  appId: "1:786553224229:web:f68b8082b8c9579ec253cc",
  measurementId: "G-G4QG91XY3R"
};

// Initialize Firebase App & Firestore Database
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Asynchronous initializer maintaining backward compatibility
export const initFirebase = async () => {
  return { app, db };
};

export default firebaseConfig;

