import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useState } from "react";

export default function RoleSelection() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const selectRole = async (role) => {
        if (loading) return;

        setLoading(true);

        try {
            const user = auth.currentUser;

            // ❌ Not logged in
            if (!user) {
                alert("Please login first ❌");
                navigate("/");
                return;
            }

            const userRef = doc(db, "users", user.email); // ✅ match App.jsx

            // ✅ SAVE ROLE
            await setDoc(
                userRef,
                {
                    uid: user.uid,
                    name: user.displayName || "Anonymous",
                    email: user.email,
                    role: role,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            console.log("Role saved:", role);

            // ✅ CORRECT REDIRECTION
            if (role === "customer") {
                navigate("/home");
            } else if (role === "mechanic") {
                navigate("/mechanic-dashboard");
            }

        } catch (error) {
            console.error("Error saving role:", error);
            alert("Something went wrong ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400">

            <div className="w-full max-w-5xl text-center px-6">

                <h1 className="text-5xl font-extrabold text-white mb-4">
                    Choose Your Mode 🚀
                </h1>

                <p className="text-white text-lg mb-12">
                    Switch anytime — get service or earn money 💸
                </p>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* 🚗 CUSTOMER */}
                    <div
                        onClick={() => selectRole("customer")}
                        className="bg-white/20 p-10 rounded-3xl cursor-pointer hover:scale-105 transition"
                    >
                        <div className="text-7xl mb-6">🚗</div>

                        <h2 className="text-2xl font-bold text-white mb-3">
                            Need a Service
                        </h2>

                        <p className="text-white mb-6">
                            Repair, fuel, towing & emergency help
                        </p>

                        <button
                            disabled={loading}
                            className="bg-white text-red-500 px-6 py-3 rounded-lg w-full font-bold"
                        >
                            {loading ? "Loading..." : "Continue as Customer"}
                        </button>
                    </div>

                    {/* 🔧 MECHANIC */}
                    <div
                        onClick={() => selectRole("mechanic")}
                        className="bg-white/20 p-10 rounded-3xl cursor-pointer hover:scale-105 transition"
                    >
                        <div className="text-7xl mb-6">🔧</div>

                        <h2 className="text-2xl font-bold text-white mb-3">
                            Work as Mechanic
                        </h2>

                        <p className="text-white mb-6">
                            Accept jobs & earn instantly ⚡
                        </p>

                        <button
                            disabled={loading}
                            className="bg-white text-green-600 px-6 py-3 rounded-lg w-full font-bold"
                        >
                            {loading ? "Loading..." : "Continue as Mechanic"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}