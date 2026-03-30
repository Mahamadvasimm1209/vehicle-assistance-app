import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function MechanicDashboard() {
    const [requests, setRequests] = useState([]);
    const [activeJob, setActiveJob] = useState(null);

    // 🔥 REAL-TIME FETCH
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // ✅ Only pending requests
            setRequests(data.filter((req) => req.status === "pending"));

            // ✅ Restore active job (if already accepted)
            const currentUser = auth.currentUser;
            if (currentUser) {
                const myJob = data.find(
                    (req) =>
                        req.status === "accepted" &&
                        req.mechanicId === currentUser.uid
                );
                setActiveJob(myJob || null);
            }
        });

        return () => unsubscribe();
    }, []);

    // ✅ ACCEPT REQUEST (SAFE)
    const acceptRequest = async (req) => {
        try {
            const user = auth.currentUser;

            await updateDoc(doc(db, "requests", req.id), {
                status: "accepted",
                mechanicId: user.uid, // 🔥 assign mechanic
            });

            setActiveJob(req);
        } catch (error) {
            console.error(error);
        }
    };

    // ❌ REJECT REQUEST
    const rejectRequest = async (id) => {
        try {
            await updateDoc(doc(db, "requests", id), {
                status: "rejected",
            });
        } catch (error) {
            console.error(error);
        }
    };

    // ✅ COMPLETE JOB
    const completeJob = async () => {
        if (!activeJob) return;

        try {
            await updateDoc(doc(db, "requests", activeJob.id), {
                status: "completed",
            });

            setActiveJob(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* HEADER */}
            <h1 className="text-4xl font-bold text-center mb-6">
                🔧 Mechanic Dashboard
            </h1>

            {/* ACTIVE JOB */}
            {activeJob && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">🚗 Active Job</h2>
                    <p><strong>Service:</strong> {activeJob.serviceType}</p>
                    <p><strong>Location:</strong> {activeJob.location || "Unknown"}</p>

                    <button
                        className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:scale-105 transition"
                        onClick={completeJob}
                    >
                        Mark as Completed ✅
                    </button>
                </div>
            )}

            {/* REQUESTS */}
            <h2 className="text-2xl font-semibold mb-4">📥 Incoming Requests</h2>

            {requests.length === 0 ? (
                <p className="text-gray-400 text-center">No requests available</p>
            ) : (
                <div className="grid gap-6">

                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg flex flex-col md:flex-row justify-between items-center"
                        >
                            <div>
                                <h3 className="text-xl font-bold">{req.serviceType}</h3>
                                <p className="text-gray-300">📍 {req.location || "Unknown"}</p>
                                <p className="text-gray-400">Status: {req.status}</p>
                            </div>

                            <div className="flex gap-4 mt-4 md:mt-0">
                                <button
                                    onClick={() => acceptRequest(req)}
                                    className="px-6 py-3 bg-green-500 rounded-lg text-white font-semibold hover:scale-105 transition shadow-lg"
                                >
                                    Accept ✅
                                </button>

                                <button
                                    onClick={() => rejectRequest(req.id)}
                                    className="px-6 py-3 bg-red-500 rounded-lg text-white font-semibold hover:scale-105 transition shadow-lg"
                                >
                                    Reject ❌
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {/* EARNINGS */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg text-black">
                <h2 className="text-2xl font-bold">💰 Earnings</h2>
                <p className="text-lg">Today: ₹500</p>
                <p className="text-lg">This Week: ₹3200</p>
            </div>

        </div>
    );
}