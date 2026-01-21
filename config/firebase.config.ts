// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";


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
const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
};

