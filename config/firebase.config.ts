// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

//@ts-ignore
import { getReactNativePersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlzTH3EtuOxNv43U45B6hI_Knzm2HthBE",
  authDomain: "nika-9e341.firebaseapp.com",
  projectId: "nika-9e341",
  storageBucket: "nika-9e341.firebasestorage.app",
  messagingSenderId: "435871217259",
  appId: "1:435871217259:web:0f349200dfd3dbaff7232e",
  measurementId: "G-SV4CLTTBM8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
};

