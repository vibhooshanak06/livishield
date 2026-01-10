import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import About from "./pages/About";
import CarInsurance from "./pages/CarInsurance";
import HealthInsurance from "./pages/HealthInsurance";
import HealthInsurancePlans from "./pages/HealthInsurancePlans";
import HealthInsurancePlanDetails from "./pages/HealthInsurancePlanDetails";
import HealthInsuranceQuote from "./pages/HealthInsuranceQuote";
import ProposalSuccess from "./pages/ProposalSuccess";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/car-insurance"
            element={
              <ProtectedRoute>
                <CarInsurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-insurance"
            element={
              <ProtectedRoute>
                <HealthInsurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-insurance/plans"
            element={
              <ProtectedRoute>
                <HealthInsurancePlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-insurance/plan/:id"
            element={
              <ProtectedRoute>
                <HealthInsurancePlanDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-insurance/quote/:id"
            element={
              <ProtectedRoute>
                <HealthInsuranceQuote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-insurance/proposal-success"
            element={
              <ProtectedRoute>
                <ProposalSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}