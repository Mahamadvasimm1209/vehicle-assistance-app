import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useState } from "react";

export default function ServicePage() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;

            if (!user) {
                alert("Please login first ❌");
                navigate("/");
                return;
            }

            // 🔥 CHECK IF USER ALREADY HAS ACTIVE REQUEST
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

            // 📍 OPTIONAL: GET LOCATION (BASIC)
            let location = "Unknown";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    location = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                });
            }

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

            <h1 className="text-4xl font-bold mb-4">
                🚗 {type.toUpperCase()} SERVICE
            </h1>

            <p className="mb-6 text-gray-300">
                You selected: <span className="font-bold">{type}</span>
            </p>

            <button
                onClick={handleRequest}
                disabled={loading}
                className={`px-8 py-4 text-xl font-bold rounded-xl 
                ${loading ? "bg-gray-500" : "bg-green-500 hover:scale-105"} transition`}
            >
                {loading ? "Sending..." : "Request Service 🚀"}
            </button>

            <button
                onClick={() => navigate("/customer")}
                className="mt-4 px-6 py-3 bg-red-500 rounded-lg"
            >
                Cancel ❌
            </button>
        </div>
    );
}