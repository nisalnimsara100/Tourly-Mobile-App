// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEgY0sX56jEztTRrwO7NUWqKFD1JOQzSE",
  authDomain: "tourly-39d1d.firebaseapp.com",
  projectId: "tourly-39d1d",
  storageBucket: "tourly-39d1d.firebasestorage.app",
  messagingSenderId: "369084853210",
  appId: "1:369084853210:web:5af84f3d4154b11c786ee3",
  measurementId: "G-4S0CK5ZL9M"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);