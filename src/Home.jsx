
import { useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
    const [serviceType, setServiceType] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔥 SEND REQUEST
    const sendRequest = async () => {
        if (!serviceType || !location || !price) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const user = auth.currentUser;

            await addDoc(collection(db, "requests"), {
                serviceType,
                location,
                price,
                status: "pending",
                email: user.email,
                userId: user.uid,

                // 🔥 TEMP: assign manually (later we do nearby mechanic)
                mechanicId: "REPLACE_WITH_MECHANIC_UID",

                createdAt: new Date()
            });

            alert("✅ Request Sent Successfully");

            setServiceType("");
            setLocation("");
            setPrice("");

        } catch (err) {
            console.error(err);
            alert("Error sending request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex items-center justify-center">

            <div className="w-[400px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

                <h1 className="text-3xl font-bold text-center mb-6">
                    🚗 Request Mechanic
                </h1>

                {/* SERVICE TYPE */}
                <input
                    type="text"
                    placeholder="Service (Flat tyre, Engine issue...)"
                    className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                />

                {/* LOCATION */}
                <input
                    type="text"
                    placeholder="Your Location"
                    className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                {/* PRICE */}
                <input
                    type="number"
                    placeholder="Offer Price ₹"
                    className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                {/* BUTTON */}
                <button
                    onClick={sendRequest}
                    disabled={loading}
                    className="w-full p-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition"
                >
                    {loading ? "Sending..." : "Send Request"}
                </button>
                <button
                    onClick={() => navigate("/my-requests")}
                    className="bg-blue-600 px-4 py-2 rounded mt-4"
                >
                    📄 View My Requests
                </button>
            </div>
        </div>
    );
}