import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";

// Pages
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import RoleSelection from "./pages/RoleSelection";
import ServicePage from "./pages/ServicePage";
import CustomerRequests from "./pages/CustomerRequests";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    signOut(auth);
  }, []);

  // 🔥 AUTH + ROLE FETCH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      try {
        const ref = doc(db, "users", u.uid)
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ⏳ Loading Screen
  if (loading) {
    return (
      <div className="text-white text-center mt-20 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      {/* ✅ LOGIN PAGE */}
      <Route
        path="/"
        element={
          loading ? (
            <div>Loading...</div>
          ) : !user ? (
            <Login />
          ) : role === null ? (
            <Navigate to="/role-selection" />
          ) : role === "mechanic" ? (
            <Navigate to="/mechanic-dashboard" />
          ) : (
            <Navigate to="/home" />
          )
        }
      />

      {/* ✅ ROLE SELECTION */}
      <Route
        path="/role-selection"
        element={
          user ? (
            role ? (
              <Navigate to="/" />
            ) : (
              <RoleSelection />
            )
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* ✅ CUSTOMER ROUTES */}
      <Route
        path="/home"
        element={
          user && role === "customer" ? (
            <CustomerDashboard />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/my-requests"
        element={
          user && role === "customer" ? (
            <CustomerRequests />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* ✅ MECHANIC ROUTES */}
      <Route
        path="/mechanic-dashboard"
        element={
          user && role === "mechanic" ? (
            <MechanicDashboard />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* ✅ SERVICE PAGE */}
      <Route
        path="/service/:type"
        element={
          user ? <ServicePage /> : <Navigate to="/" />
        }
      />

      {/* ❌ UNKNOWN ROUTE */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;