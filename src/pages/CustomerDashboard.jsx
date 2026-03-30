import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function CustomerDashboard() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) return;

        // 🔥 Only fetch current user's requests
        const q = query(
            collection(db, "requests"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRequests(data);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            <h1 className="text-4xl font-bold text-center mb-8">
                🚗 My Service Requests
            </h1>

            {requests.length === 0 ? (
                <p className="text-center text-gray-400">
                    No requests yet
                </p>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
                        >
                            <h2 className="text-xl font-bold">
                                {req.serviceType}
                            </h2>

                            <p className="text-gray-300">
                                📍 {req.location || "Unknown"}
                            </p>

                            {/* 🔥 STATUS BADGE */}
                            <p className={`mt-3 font-semibold 
                                ${req.status === "pending" && "text-yellow-400"}
                                ${req.status === "accepted" && "text-green-400"}
                                ${req.status === "completed" && "text-blue-400"}
                                ${req.status === "rejected" && "text-red-400"}
                            `}>
                                Status: {req.status.toUpperCase()}
                            </p>

                            {/* 🔥 TRACKING UI */}
                            {req.status === "accepted" && (
                                <p className="mt-2 text-green-300">
                                    👨‍🔧 Mechanic is on the way!
                                </p>
                            )}

                            {req.status === "completed" && (
                                <p className="mt-2 text-blue-300">
                                    ✅ Service Completed
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}