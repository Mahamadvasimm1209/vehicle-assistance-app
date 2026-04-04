import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { Wrench, MapPin } from "lucide-react";

export default function CustomerRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "requests"),
                where("customerEmail", "==", user.email),
                orderBy("createdAt", "desc")
            );

            unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRequests(data);
                setLoading(false);
            });
        });

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            unsubscribeAuth();
        };
    }, []);

    // 🔥 LOADING
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="animate-pulse text-xl">Loading your requests...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* HEADER */}
            <h1 className="text-3xl font-bold mb-6">
                🚗 Your Service Requests
            </h1>

            {/* EMPTY */}
            {requests.length === 0 && (
                <p className="text-gray-400">No requests yet</p>
            )}

            {/* LIST */}
            <div className="space-y-4">
                {requests.map((r) => (
                    <div
                        key={r.id}
                        className="p-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg"
                    >
                        {/* MECHANIC */}
                        <div className="flex items-center gap-2 text-lg mb-2">
                            <Wrench size={18} />
                            <span className="font-semibold">
                                {r.mechanicName || "Mechanic"}
                            </span>
                        </div>

                        {/* DETAILS */}
                        <p className="text-sm text-gray-300">
                            Service: {r.serviceType || "General"}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                            <MapPin size={14} />
                            {r.location || "📍 Not available"}
                        </div>

                        {/* STATUS */}
                        <div className="mt-3">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold
                ${r.status === "pending"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : r.status === "accepted"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : r.status === "completed"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                    }`}
                            >
                                {r.status?.toUpperCase()}
                            </span>
                        </div>

                        {/* LIVE MESSAGE */}
                        <p className="mt-2 text-sm">
                            {r.status === "pending" && "⏳ Waiting for mechanic..."}
                            {r.status === "accepted" && "🚀 Mechanic is on the way!"}
                            {r.status === "completed" && "✅ Service completed"}
                            {r.status === "rejected" && "❌ Request rejected"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}