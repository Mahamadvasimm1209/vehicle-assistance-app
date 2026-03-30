import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaGoogle } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
    const navigate = useNavigate();

    // 🔥 Google Login + Save User
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 🔍 Check if user exists
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // ✅ New user → save
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    role: "customer", // default
                    createdAt: new Date()
                });

                console.log("User stored in Firestore ✅");
            } else {
                console.log("User already exists 👍");
            }

            navigate("/role-selection");

        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed ❌");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500">

            <div className="bg-white w-[350px] p-8 rounded-3xl shadow-2xl text-center">

                <h2 className="text-2xl font-bold mb-6">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-2 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                />

                <div className="text-right text-sm text-gray-500 mb-4 cursor-pointer hover:text-purple-500">
                    Forgot Password?
                </div>

                {/* ⚠️ TEMP LOGIN */}
                <button
                    onClick={() => navigate("/role-selection")}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
                >
                    LOGIN
                </button>

                <div className="flex items-center my-6">
                    <hr className="flex-1" />
                    <span className="px-2 text-gray-400 text-sm">Or Sign Up Using</span>
                    <hr className="flex-1" />
                </div>

                {/* 🔥 SOCIAL LOGIN */}
                <div className="flex justify-center gap-4 mb-6">

                    <div className="bg-blue-600 text-white p-3 rounded-full hover:scale-110 transition cursor-pointer">
                        <FaFacebookF />
                    </div>

                    <div className="bg-sky-400 text-white p-3 rounded-full hover:scale-110 transition cursor-pointer">
                        <FaTwitter />
                    </div>

                    {/* ✅ GOOGLE LOGIN (UPDATED LOGIC ONLY) */}
                    <div
                        onClick={handleGoogleLogin}
                        className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition cursor-pointer"
                    >
                        <FaGoogle />
                    </div>

                </div>

                <p className="text-sm text-gray-500">Or Sign Up Using</p>
                <p className="font-semibold cursor-pointer hover:text-purple-500 mt-1">
                    SIGN UP
                </p>

            </div>
        </div>
    );
}