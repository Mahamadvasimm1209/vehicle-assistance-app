import { useParams, useNavigate } from "react-router-dom";
import {
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useState } from "react";

export default function ServicePage() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 🔥 ICONS FOR BETTER UI
    const serviceIcons = {
        battery: "🔋",
        fuel: "⛽",
        repair: "🛠️",
        towing: "🚚"
    };

    // 📍 GET LOCATION (FIXED ASYNC)
    const getLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve("Unknown");
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve(
                            `${pos.coords.latitude}, ${pos.coords.longitude}`
                        );
                    },
                    () => resolve("Unknown")
                );
            }
        });
    };

    const handleRequest = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user) {
                alert("Please login first ❌");
                navigate("/");
                return;
            }

            // 🔥 CHECK ACTIVE REQUEST
            const q = query(
                collection(db, "requests"),
                where("userId", "==", user.uid),
                where("status", "in", ["pending", "accepted"])
            );

            const existing = await getDocs(q);

            if (!existing.empty) {
                alert("You already have an active request 🚧");
                navigate("/customer");
                return;
            }

            // 📍 GET LOCATION
            const location = await getLocation();

            // 🔥 CREATE REQUEST
            await addDoc(collection(db, "requests"), {
                userId: user.uid,
                email: user.email,
                serviceType: type,
                status: "pending",
                location,
                createdAt: serverTimestamp(),
            });

            alert(`Request for ${type} sent 🚗`);
            navigate("/customer");

        } catch (error) {
            console.error(error);
            alert("Failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center 
        bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* 🔥 TITLE */}
            <h1 className="text-4xl font-bold mb-4 text-center">
                {serviceIcons[type] || "🚗"} {type.toUpperCase()} SERVICE
            </h1>

            {/* 🔥 SUBTEXT */}
            <p className="mb-6 text-gray-300 text-center">
                You selected: <span className="font-bold">{type}</span>
            </p>

            {/* 🔥 REQUEST BUTTON */}
            <button
                onClick={handleRequest}
                disabled={loading}
                className={`px-8 py-4 text-xl font-bold rounded-xl 
                ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:scale-105"}
                transition`}
            >
                {loading ? "Sending..." : "Request Service 🚀"}
            </button>

            {/* 🔥 CANCEL BUTTON */}
            <button
                onClick={() => navigate("/customer")}
                className="mt-4 px-6 py-3 bg-red-500 rounded-lg hover:scale-105 transition"
            >
                Cancel ❌
            </button>
        </div>
    );
}