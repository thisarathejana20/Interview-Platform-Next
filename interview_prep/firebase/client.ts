import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY,
  authDomain: "interview-prep-next.firebaseapp.com",
  projectId: "interview-prep-next",
  storageBucket: "interview-prep-next.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
