import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import RoleSelection from "./pages/RoleSelection";
import ServicePage from "./pages/ServicePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ✅ ADD THIS */}
      <Route path="/role-selection" element={<RoleSelection />} />

      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/mechanic" element={<MechanicDashboard />} />
      <Route path="/service/:type" element={<ServicePage />} />
    </Routes>
  );
}

export default App;