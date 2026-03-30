import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB-1GGmt4yuYvmjvIx3q1lnEh8w1igYujA",
    authDomain: "vehicle-assistance-app-b006e.firebaseapp.com",
    projectId: "vehicle-assistance-app-b006e",
    storageBucket: "vehicle-assistance-app-b006e.appspot.com",
    messagingSenderId: "158127625873",
    appId: "1:158127625873:web:fea142925d8853ad465130",
    measurementId: "G-BYC34F0BNH"
};

// 🔥 Initialize
const app = initializeApp(firebaseConfig);

// 🔐 Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 🗄️ Firestore
const db = getFirestore(app);

// ✅ EXPORT ONLY
export { auth, db, app, googleProvider };