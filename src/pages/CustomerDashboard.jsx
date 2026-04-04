import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp,
    query,
    where
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";


export default function CustomerDashboard() {
    const [requests, setRequests] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [loading, setLoading] = useState(true);

    const [serviceType, setServiceType] = useState("emergency");
    const [userLocation, setUserLocation] = useState("");



    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });

        return () => unsubscribe();
    }, []);
    // ✅ CHECK ACTIVE REQUEST
    const hasActive = requests.some((r) => r.status === "pending");

    // 💰 PRICE FUNCTION
    const getServicePrice = (type) => {
        switch (type) {
            case "repair": return 500;
            case "fuel": return 300;
            case "battery": return 400;
            case "emergency": return 700;
            default: return 250;
        }
    };

    // 📍 GET LOCATION
    const getLocation = () =>
        new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve(`${pos.coords.latitude}, ${pos.coords.longitude}`),
                () => resolve("Permission denied")
            );
        });

    // 🔥 SEND TO ONE MECHANIC
    const handleSendRequest = async () => {
        try {
            if (!user) return alert("Login first ❌");
            if (hasActive) return alert("Already have active request 🚧");
            if (!selectedMechanic) return alert("Select mechanic first 👨‍🔧");

            const location = await getLocation();
            const price = getServicePrice(serviceType);

            await addDoc(collection(db, "requests"), {
                customerEmail: user.email,
                userId: user.uid,

                mechanicEmail: selectedMechanic.email, // ✅ FIXED
                mechanicName: selectedMechanic.name,

                serviceType,
                price,
                location,

                status: "pending",
                createdAt: serverTimestamp(),
            });

            alert(`✅ Request sent to ${selectedMechanic.name}`);
            setSelectedMechanic(null);

        } catch (error) {
            console.error(error);
            alert("Error sending request");
        }
    };
    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/"; // 🔥 force redirect
    };

    // 🚀 SEND TO ALL (FASTEST WINS)
    const handleSendToAll = async () => {
        try {
            if (!user) return alert("Login first ❌");
            if (hasActive) return alert("Already have active request 🚧");

            const location = await getLocation();
            const price = getServicePrice(serviceType);

            await addDoc(collection(db, "requests"), {
                customerEmail: user.email,
                userId: user.uid,

                serviceType,
                location,
                price,

                mechanicEmail: "ALL", // 🔥 BROADCAST
                mechanicName: "Searching...",

                status: "pending",
                createdAt: serverTimestamp(),
            });

            alert("🚀 Request sent to all mechanics");

        } catch (err) {
            console.error(err);
        }
    };

    // 🔥 FETCH MECHANICS
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "mechanics"), (snapshot) => {
            let data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // ✅ Only available
            data = data.filter((m) => m.available);

            // ✅ Location filter
            if (userLocation) {
                data = data.filter((m) =>
                    m.location?.toLowerCase().includes(userLocation.toLowerCase())
                );
            }

            // ✅ Sort by ratings
            data.sort((a, b) => b.ratings - a.ratings);

            setMechanics(data.slice(0, 10));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userLocation]);

    // 🔥 FETCH USER REQUESTS
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "requests"),
            where("customerEmail", "==", user.email) // ✅ FIXED
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setRequests(data);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading)
        return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">

            {/* HEADER */}
            <div className="flex gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Enter area (BTM, HSR...)"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="p-2 rounded text-black"
                />

                <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="p-2 text-black"
                >
                    <option value="emergency">Emergency</option>
                    <option value="repair">Repair</option>
                    <option value="fuel">Fuel</option>
                    <option value="battery">Battery</option>
                </select>
            </div>

            {/* MECHANICS */}
            <h2 className="text-2xl mb-4">Top Mechanics ⭐</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {mechanics.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => setSelectedMechanic(m)}
                        className={`p-4 rounded cursor-pointer border ${selectedMechanic?.id === m.id
                            ? "bg-green-600"
                            : "bg-gray-800"
                            }`}
                    >
                        <p className="font-semibold text-lg">
                            {m.name} ⭐ {m.ratings} ({m.reviews})
                        </p>

                        <p className="text-sm text-gray-300">
                            {m.location || "📍 Not available"}
                        </p>
                    </div>
                ))}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
                <button
                    onClick={handleSendRequest}
                    className="bg-red-500 px-4 py-2 rounded"
                >
                    🚨 Call Selected Mechanic
                </button>

                <button
                    onClick={handleSendToAll}
                    className="bg-yellow-500 px-4 py-2 rounded"
                >
                    🚀 Send to All
                </button>
                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

            {/* REQUESTS */}
            <h2 className="text-2xl mt-10">My Requests</h2>

            {requests.length === 0 ? (
                <p className="text-gray-400 mt-3">No requests yet</p>
            ) : (
                requests.map((r) => (
                    <div key={r.id} className="p-4 bg-gray-800 mt-3 rounded">
                        <p>🔧 {r.serviceType}</p>
                        <p>💰 ₹{r.price}</p>
                        <p>👨‍🔧 {r.mechanicName}</p>
                        <p>
                            Status:
                            {r.status === "pending" && " ⏳ Waiting"}
                            {r.status === "accepted" && " ✅ Accepted"}
                            {r.status === "rejected" && " ❌ Rejected"}
                            {r.status === "completed" && " 🟢 Completed"}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}