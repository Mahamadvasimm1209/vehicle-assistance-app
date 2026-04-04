// firebase.js

import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔐 Use environment variables (IMPORTANT for security)
const firebaseConfig = {
    apiKey: "AIzaSyB-1GGmt4yuYvmjvIx3q1lnEh8w1igYujA",
    authDomain: "vehicle-assistance-app-b006e.firebaseapp.com",
    projectId: "vehicle-assistance-app-b006e",
    storageBucket: "vehicle-assistance-app-b006e.appspot.com",
    messagingSenderId: "158127625873",
    appId: "1:158127625873:web:fea142925d8853ad465130",
    measurementId: "G-BYC34F0BNH"
};

// 🚀 Initialize app
const app = initializeApp(firebaseConfig);

// 🔑 Auth
export const auth = getAuth(app);

// 🌐 Google Provider (customized)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});

// 🗄️ Firestore
export const db = getFirestore(app);

// (optional export)
export default app;