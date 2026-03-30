import { useState } from "react";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Signup successful ✅");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSignup} className="p-6 bg-white shadow rounded">
                <h2 className="text-xl font-bold mb-4">Signup</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 mb-3 w-full"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 mb-3 w-full"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="bg-blue-500 text-white px-4 py-2 w-full">
                    Signup
                </button>
            </form>
        </div>
    );
}

export default Signup;