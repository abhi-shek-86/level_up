// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhSeqKXjGxP1U_67Sij9F4xaSGUrMNRPg",
  authDomain: "level-up-1b915.firebaseapp.com",
  projectId: "level-up-1b915",
  storageBucket: "level-up-1b915.appspot.com", // ✅ fixed `.app` to `.appspot.com`
  messagingSenderId: "1021831033136",
  appId: "1:1021831033136:web:0c5cd88b0d2c65a41ed8f5",
  measurementId: "G-MC8DN8WWLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
