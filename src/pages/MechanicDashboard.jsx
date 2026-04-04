import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    orderBy,
    getDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { CheckCircle, XCircle, Wrench, MapPin } from "lucide-react";

export default function MechanicDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // 🔥 FETCH REQUESTS
    useEffect(() => {
        let unsubscribeSnapshot;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "requests"),
                where("mechanicEmail", "==", user.email),
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

    // 🔥 SAFE STATUS UPDATE (PRO)
    const updateStatus = async (id, newStatus) => {
        try {
            setUpdatingId(id);

            const ref = doc(db, "requests", id);
            const snap = await getDoc(ref);

            if (!snap.exists()) return;

            const currentData = snap.data();

            // 🚫 Prevent multiple accepts
            if (
                currentData.status === "accepted" &&
                newStatus === "accepted"
            ) {
                alert("Already accepted by another mechanic");
                return;
            }

            let updateData = { status: newStatus };

            // 🔥 Add timestamps
            if (newStatus === "accepted") {
                updateData.acceptedAt = new Date();
            }

            if (newStatus === "completed") {
                updateData.completedAt = new Date();
            }

            await updateDoc(ref, updateData);
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    // 🔥 LOADING UI
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="text-xl animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">🔧 Mechanic Dashboard</h1>

                <span className="text-sm text-gray-400">
                    Total Requests: {requests.length}
                </span>
            </div>

            {/* EMPTY */}
            {requests.length === 0 && (
                <div className="text-center mt-32 text-gray-400">
                    <p className="text-lg">No requests assigned yet 🚀</p>
                </div>
            )}

            {/* LIST */}
            <div className="grid md:grid-cols-2 gap-6">
                {requests.map((r) => (
                    <div
                        key={r.id}
                        className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition duration-300"
                    >
                        {/* SERVICE */}
                        <div className="flex items-center gap-2 mb-3 text-lg">
                            <Wrench size={20} />
                            <p className="font-semibold">
                                {r.serviceType || "General Service"}
                            </p>
                        </div>

                        {/* DETAILS */}
                        <p className="text-sm text-gray-300">
                            <b>Customer:</b> {r.customerEmail || "Unknown"}
                        </p>

                        <p className="text-sm text-gray-300">
                            <b>Price:</b> ₹{r.price || 0}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                            <MapPin size={16} />
                            {r.location || "📍 Location not available"}
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
                                {r.status?.toUpperCase() || "PENDING"}
                            </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 flex gap-3 flex-wrap">

                            {r.status === "pending" && (
                                <>
                                    <button
                                        disabled={updatingId === r.id}
                                        onClick={() => updateStatus(r.id, "accepted")}
                                        className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} />
                                        Accept
                                    </button>

                                    <button
                                        disabled={updatingId === r.id}
                                        onClick={() => updateStatus(r.id, "rejected")}
                                        className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </>
                            )}

                            {r.status === "accepted" && (
                                <button
                                    disabled={updatingId === r.id}
                                    onClick={() => updateStatus(r.id, "completed")}
                                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Mark Completed
                                </button>
                            )}

                            {r.status === "completed" && (
                                <span className="text-green-400 font-semibold">
                                    ✅ Completed
                                </span>
                            )}

                            {r.status === "rejected" && (
                                <span className="text-red-400 font-semibold">
                                    ❌ Rejected
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}