import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyA6u-Gzn-MV0SiuL7bedvY69M5a7aKiy_E",
  authDomain: "rasedul-karim-portfolio.firebaseapp.com",
  databaseURL: "https://rasedul-karim-portfolio-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rasedul-karim-portfolio",
  storageBucket: "rasedul-karim-portfolio.firebasestorage.app",
  messagingSenderId: "786553224229",
  appId: "1:786553224229:web:f68b8082b8c9579ec253cc",
  measurementId: "G-G4QG91XY3R"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export { app };

export const initFirebase = async () => {
  return { app, db, auth, googleProvider, githubProvider };
};

export default app;
