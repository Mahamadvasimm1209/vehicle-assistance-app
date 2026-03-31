import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function MechanicDashboard() {
    const [requests, setRequests] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const [earnings, setEarnings] = useState(0); // 💰 NEW

    // 🔥 REAL-TIME FETCH
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const currentUser = auth.currentUser;

            // ✅ SHOW ONLY PENDING
            setRequests(data.filter((req) => req.status === "pending"));

            if (currentUser) {
                // ✅ ACTIVE JOB
                const myJob = data.find(
                    (req) =>
                        req.status === "accepted" &&
                        req.mechanicId === currentUser.uid
                );
                setActiveJob(myJob || null);

                // 💰 REAL EARNINGS CALCULATION
                const completedJobs = data.filter(
                    (req) =>
                        req.mechanicId === currentUser.uid &&
                        req.status === "completed" &&
                        req.paymentStatus === "paid"
                );

                const total = completedJobs.reduce(
                    (sum, job) => sum + (job.price || 0),
                    0
                );

                setEarnings(total);
            }
        });

        return () => unsubscribe();
    }, []);

    // ✅ ACCEPT REQUEST
    const acceptRequest = async (req) => {
        try {
            const user = auth.currentUser;

            if (activeJob) {
                alert("Finish current job first 🚧");
                return;
            }

            await updateDoc(doc(db, "requests", req.id), {
                status: "accepted",
                mechanicId: user.uid,
            });

            setActiveJob({ ...req, mechanicId: user.uid });
        } catch (error) {
            console.error(error);
        }
    };

    // ❌ REJECT
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

    // 💳 MARK AS PAID
    const markAsPaid = async () => {
        if (!activeJob) return;

        try {
            await updateDoc(doc(db, "requests", activeJob.id), {
                paymentStatus: "paid",
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* HEADER */}
            <h1 className="text-4xl font-bold text-center mb-6">
                🔧 Mechanic Dashboard
            </h1>

            {/* 🔥 ACTIVE JOB */}
            {activeJob && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">🚗 Active Job</h2>

                    <p>
                        <strong>🛠 Service:</strong>{" "}
                        {activeJob.serviceType?.toUpperCase()}
                    </p>

                    <p>
                        <strong>📍 Location:</strong>{" "}
                        {activeJob.location || "Unknown"}
                    </p>

                    <p>
                        <strong>📧 User:</strong> {activeJob.email}
                    </p>

                    <p className="mt-2">
                        💰 Price: ₹{activeJob.price}
                    </p>

                    <p>
                        💳 Payment: {activeJob.paymentStatus?.toUpperCase()}
                    </p>

                    <div className="flex gap-4 mt-4">
                        <button
                            className="px-6 py-3 bg-black text-white rounded-lg hover:scale-105 transition"
                            onClick={completeJob}
                        >
                            Complete ✅
                        </button>

                        {activeJob.paymentStatus !== "paid" && (
                            <button
                                onClick={markAsPaid}
                                className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:scale-105 transition"
                            >
                                Mark Paid 💳
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* REQUEST LIST */}
            <h2 className="text-2xl font-semibold mb-4">📥 Incoming Requests</h2>

            {requests.length === 0 ? (
                <p className="text-gray-400 text-center">
                    No requests available
                </p>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg flex flex-col md:flex-row justify-between items-center"
                        >
                            <div>
                                <h3 className="text-xl font-bold">
                                    🚨 {req.serviceType?.toUpperCase()} Service
                                </h3>

                                <p className="text-gray-300">
                                    📍 {req.location || "Unknown"}
                                </p>

                                <p className="text-gray-400">
                                    📧 {req.email}
                                </p>

                                <p className="text-yellow-400">
                                    💰 ₹{req.price}
                                </p>

                                <p className="text-yellow-400 font-semibold">
                                    Status: {req.status.toUpperCase()}
                                </p>
                            </div>

                            <div className="flex gap-4 mt-4 md:mt-0">
                                <button
                                    onClick={() => acceptRequest(req)}
                                    disabled={!!activeJob}
                                    className={`px-6 py-3 rounded-lg text-white font-semibold ${activeJob
                                            ? "bg-gray-500"
                                            : "bg-green-500 hover:scale-105"
                                        }`}
                                >
                                    Accept ✅
                                </button>

                                <button
                                    onClick={() => rejectRequest(req.id)}
                                    className="px-6 py-3 bg-red-500 rounded-lg text-white font-semibold hover:scale-105"
                                >
                                    Reject ❌
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 💰 REAL EARNINGS */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg text-black">
                <h2 className="text-2xl font-bold">💰 Earnings</h2>
                <p className="text-lg">Total Earnings: ₹{earnings}</p>
            </div>

        </div>
    );
}