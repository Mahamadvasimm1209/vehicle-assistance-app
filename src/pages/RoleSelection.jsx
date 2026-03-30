import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function RoleSelection() {
    const navigate = useNavigate();

    const selectRole = async (role) => {
        try {
            const user = auth.currentUser;

            // ✅ Safety check
            if (!user) {
                alert("Please login first ❌");
                navigate("/");
                return;
            }

            const userRef = doc(db, "users", user.uid);

            // 🔥 SAVE CLEAN USER DATA
            await setDoc(
                userRef,
                {
                    name: user.displayName || "Anonymous",
                    email: user.email,
                    role: role,                // ✅ MAIN ROLE (important)
                    lastRole: role,            // optional tracking
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            console.log("Role saved:", role);

            // 🚀 Smart Navigation
            if (role === "customer") navigate("/customer");
            if (role === "mechanic") navigate("/mechanic");

        } catch (error) {
            console.error("Error saving role:", error);
            alert("Something went wrong ❌");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400">

            <div className="w-full max-w-5xl text-center px-6">

                <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                    Choose Your Mode 🚀
                </h1>

                <p className="text-white text-lg mb-12 opacity-90">
                    Switch anytime — get service or earn money 💸
                </p>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* CUSTOMER CARD */}
                    <div
                        onClick={() => selectRole("customer")}
                        className="backdrop-blur-lg bg-white/20 border border-white/30 p-10 rounded-3xl shadow-2xl cursor-pointer transform hover:scale-110 hover:shadow-red-500/50 transition duration-300"
                    >
                        <div className="text-7xl mb-6">🚗</div>

                        <h2 className="text-2xl font-bold mb-3 text-white">
                            Need a Service
                        </h2>

                        <p className="text-white/80 mb-6">
                            Repair, fuel, towing & emergency help
                        </p>

                        <button className="bg-white text-red-500 px-8 py-4 rounded-xl w-full text-lg font-bold hover:bg-red-500 hover:text-white transition duration-300 shadow-lg">
                            Continue as Customer
                        </button>
                    </div>

                    {/* MECHANIC CARD */}
                    <div
                        onClick={() => selectRole("mechanic")}
                        className="backdrop-blur-lg bg-white/20 border border-white/30 p-10 rounded-3xl shadow-2xl cursor-pointer transform hover:scale-110 hover:shadow-green-500/50 transition duration-300"
                    >
                        <div className="text-7xl mb-6">🔧</div>

                        <h2 className="text-2xl font-bold mb-3 text-white">
                            Work as Mechanic
                        </h2>

                        <p className="text-white/80 mb-6">
                            Accept jobs & earn instantly ⚡
                        </p>

                        <button className="bg-white text-green-600 px-8 py-4 rounded-xl w-full text-lg font-bold hover:bg-green-500 hover:text-white transition duration-300 shadow-lg">
                            Continue as Mechanic
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}