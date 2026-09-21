// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// // Replace these values with your Firebase project config
// // Firebase Console → Project Settings → Your Apps → SDK setup
// const firebaseConfig = {
//   apiKey: "AIzaSyBvsr7E8ZLqX6PFVnktoC5CZOGKORKsVws",

//   authDomain: "aurix-your-gadget.firebaseapp.com",

//   projectId: "aurix-your-gadget",

//   storageBucket: "aurix-your-gadget.firebasestorage.app",

//   messagingSenderId: "279753760099",

//   appId: "1:279753760099:web:db1fa8a7fbbf57dd388756",
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);

// ............2

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
