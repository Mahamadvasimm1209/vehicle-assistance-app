import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function CustomerDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 SERVICE TYPE
    const [serviceType, setServiceType] = useState("emergency");

    // ✅ CHECK ACTIVE REQUEST
    const hasActive = requests.some(
        (r) => r.status === "pending"
    );

    // 💰 PRICE FUNCTION (MOVE OUTSIDE CALL)
    const getServicePrice = (type) => {
        switch (type) {
            case "repair": return 500;
            case "fuel": return 300;
            case "battery": return 400;
            case "emergency": return 700;
            default: return 250;
        }
    };

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "requests"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRequests(data);
                setLoading(false);
            });

            return () => unsubscribe();
        });

        return () => unsubscribeAuth();
    }, []);

    // 🔥 CALL MECHANIC
    const callMechanic = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                alert("Login first ❌");
                return;
            }

            if (hasActive) {
                alert("You already have a pending request 🚧");
                return;
            }

            // 📍 LOCATION
            const getLocation = () => {
                return new Promise((resolve) => {
                    if (!navigator.geolocation) {
                        resolve("Location not supported");
                    } else {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                resolve(
                                    `${pos.coords.latitude}, ${pos.coords.longitude}`
                                );
                            },
                            () => resolve("Permission denied")
                        );
                    }
                });
            };

            const location = await getLocation();

            // 💰 CALCULATE PRICE
            const price = getServicePrice(serviceType);

            // 🔥 SAVE REQUEST WITH PAYMENT
            await addDoc(collection(db, "requests"), {
                userId: user.uid,
                email: user.email,
                serviceType,
                price, // ✅ NEW
                paymentStatus: "unpaid", // ✅ NEW
                status: "pending",
                location,
                createdAt: serverTimestamp(),
            });

            alert(`🚨 ${serviceType.toUpperCase()} request sent! Price: ₹${price}`);

        } catch (err) {
            console.error(err);
            alert("Something went wrong ❌");
        }
    };

    // 🔥 LOADING
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">
                    🚗 My Requests
                </h1>

                <div className="flex gap-4 items-center">
                    <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
                    >
                        <option value="emergency">🚨 Emergency</option>
                        <option value="repair">🔧 Repair</option>
                        <option value="fuel">⛽ Fuel</option>
                        <option value="battery">🔋 Battery</option>
                        <option value="other">🧰 Other</option>
                    </select>

                    <button
                        onClick={callMechanic}
                        disabled={hasActive}
                        className={`px-6 py-3 rounded-xl font-bold ${hasActive ? "bg-gray-500" : "bg-red-500"
                            }`}
                    >
                        🚨 Request {serviceType.toUpperCase()}
                    </button>
                </div>
            </div>

            {/* EMPTY */}
            {requests.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-400 mb-4 text-lg">
                        No requests yet
                    </p>

                    <button
                        onClick={callMechanic}
                        disabled={hasActive}
                        className={`px-8 py-4 rounded-xl text-lg font-bold ${hasActive ? "bg-gray-500" : "bg-red-500"
                            }`}
                    >
                        🚨 Request {serviceType.toUpperCase()}
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
                        >
                            <h2 className="text-xl font-bold">
                                🚨 {req.serviceType?.toUpperCase()} Service
                            </h2>

                            <p className="text-gray-400 mt-1">
                                🛠 Service: {req.serviceType?.toUpperCase()}
                            </p>

                            <p className="text-yellow-400">
                                💰 Price: ₹{req.price}
                            </p>

                            <p className="text-gray-400">
                                💳 Payment: {req.paymentStatus?.toUpperCase()}
                            </p>

                            <p className="text-gray-300">
                                📍 {req.location || "Unknown"}
                            </p>

                            <p className={`mt-3 font-semibold 
                                ${req.status === "pending" && "text-yellow-400"}
                                ${req.status === "accepted" && "text-green-400"}
                                ${req.status === "completed" && "text-blue-400"}
                                ${req.status === "rejected" && "text-red-400"}
                            `}>
                                Status: {req.status.toUpperCase()}
                            </p>

                            {req.status === "accepted" && (
                                <p className="mt-2 text-green-300">
                                    👨‍🔧 Mechanic is on the way!
                                </p>
                            )}

                            {req.paymentStatus === "paid" && (
                                <p className="mt-2 text-green-400 font-bold">
                                    ✅ Payment Completed
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}