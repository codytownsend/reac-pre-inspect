// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA0OrxI4tJXefpDAmgC72pHkEKI7RFyGNk",
  authDomain: "reac-e6474.firebaseapp.com",
  projectId: "reac-e6474",
  storageBucket: "reac-e6474.firebasestorage.app",
  messagingSenderId: "335570149492",
  appId: "1:335570149492:web:f2193b23ea8eaec3907121"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;