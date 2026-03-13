import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  // @ts-ignore — getReactNativePersistence is not yet in the public TS types
  getReactNativePersistence,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import dotenv from "dotenv";

// dotenv.config();

// ---------------------------------------------------------------------------
// All values must be prefixed with EXPO_PUBLIC_ so that Expo / Metro bakes
// them into the client bundle at build time (both local and EAS builds).
// Never put secret server-side keys here — only Firebase client-side config.
// ---------------------------------------------------------------------------
const requiredVars = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
] as const;

// Fail fast in development if any required variable is missing.
if (__DEV__) {
  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(
        `[Firebase] Missing environment variable: ${key}\n` +
          `Make sure it is defined in your .env file and prefixed with EXPO_PUBLIC_.`,
      );
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // Optional — only needed if you use Firebase Analytics
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  createUserWithEmailAndPassword,
  db,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  storage,
  User,
};
