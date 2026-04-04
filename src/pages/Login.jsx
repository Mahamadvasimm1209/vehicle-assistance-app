import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup
} from "firebase/auth";
import { auth, googleProvider, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ REDIRECT USER BASED ON ROLE
    const redirectUser = async (user) => {
        try {
            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                navigate("/role-selection");
                return;
            }

            const role = snapshot.data().role;

            if (role === "mechanic") {
                navigate("/mechanic-dashboard");
            } else if (role === "customer") {
                navigate("/home");
            } else {
                navigate("/role-selection");
            }
        } catch (err) {
            console.error(err);
            navigate("/");
        }
    };

    // ✅ GOOGLE LOGIN
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);

            // 👉 Create user if not exists
            if (!snapshot.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    role: "customer"
                });
            }

            await redirectUser(user);
        } catch (err) {
            setError("Google login failed");
        } finally {
            setLoading(false);
        }
    };

    // ✅ SIGNUP
    const handleSignup = async () => {
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role
            });

            await redirectUser(user);
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email already exists");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email");
            } else if (err.code === "auth/weak-password") {
                setError("Password must be at least 6 characters");
            } else {
                setError("Signup failed");
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ LOGIN
    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;

            await redirectUser(user);
        } catch (err) {
            if (err.code === "auth/user-not-found") {
                setError("No account found");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email");
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">

            <div className="w-[380px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

                {/* TITLE */}
                <h2 className="text-3xl font-bold text-center mb-6">
                    {isSignup ? "Create Account 🚀" : "Welcome Back 👋"}
                </h2>

                {/* ROLE SELECT */}
                {isSignup && (
                    <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setRole("customer")}
                            className={`flex-1 py-2 rounded-lg ${role === "customer" ? "bg-blue-500" : ""}`}
                        >
                            Customer
                        </button>
                        <button
                            onClick={() => setRole("mechanic")}
                            className={`flex-1 py-2 rounded-lg ${role === "mechanic" ? "bg-purple-500" : ""}`}
                        >
                            Mechanic
                        </button>
                    </div>
                )}

                {/* EMAIL */}
                <div className="relative mb-4">
                    <Mail className="absolute top-3 left-3 text-gray-300" size={18} />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full pl-10 p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* PASSWORD */}
                <div className="relative mb-4">
                    <Lock className="absolute top-3 left-3 text-gray-300" size={18} />
                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                        className="absolute top-3 right-3 cursor-pointer"
                        onClick={() => setShowPass(!showPass)}
                    >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                )}

                {/* BUTTON */}
                <button
                    onClick={isSignup ? handleSignup : handleLogin}
                    disabled={loading}
                    className="w-full p-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition transform duration-200 shadow-lg disabled:opacity-50"
                >
                    {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
                </button>

                {/* DIVIDER */}
                <div className="flex items-center my-4">
                    <div className="flex-1 h-[1px] bg-gray-500"></div>
                    <p className="mx-3 text-sm text-gray-300">OR</p>
                    <div className="flex-1 h-[1px] bg-gray-500"></div>
                </div>

                {/* GOOGLE LOGIN */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full p-3 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                    Continue with Google
                </button>

                {/* SWITCH */}
                <p
                    className="text-center mt-5 text-sm text-gray-300 cursor-pointer hover:text-white"
                    onClick={() => {
                        setIsSignup(!isSignup);
                        setError("");
                    }}
                >
                    {isSignup
                        ? "Already have an account? Login"
                        : "New here? Create account"}
                </p>
            </div>
        </div>
    );
}