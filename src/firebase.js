import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these values with your Firebase project config
// Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyBvsr7E8ZLqX6PFVnktoC5CZOGKORKsVws",

  authDomain: "aurix-your-gadget.firebaseapp.com",

  projectId: "aurix-your-gadget",

  storageBucket: "aurix-your-gadget.firebasestorage.app",

  messagingSenderId: "279753760099",

  appId: "1:279753760099:web:db1fa8a7fbbf57dd388756",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
