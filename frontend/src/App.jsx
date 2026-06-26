import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import About from "./pages/About";
import HealthInsurance from "./pages/HealthInsurance";
import HealthInsurancePlans from "./pages/HealthInsurancePlans";
import HealthInsurancePlanDetails from "./pages/HealthInsurancePlanDetails";
import HealthInsuranceQuote from "./pages/HealthInsuranceQuote";
import ProposalSuccess from "./pages/ProposalSuccess";
import ProposalDetail from "./pages/ProposalDetail";
import CustomerDashboard from "./pages/CustomerDashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProposalDetail from "./pages/admin/AdminProposalDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/home'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Customer routes ── */}
          <Route path="/home"                              element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/about"                             element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/health-insurance"                  element={<ProtectedRoute><HealthInsurance /></ProtectedRoute>} />
          <Route path="/health-insurance/plans"            element={<ProtectedRoute><HealthInsurancePlans /></ProtectedRoute>} />
          <Route path="/health-insurance/plan/:id"         element={<ProtectedRoute><HealthInsurancePlanDetails /></ProtectedRoute>} />
          <Route path="/health-insurance/quote/:id"        element={<ProtectedRoute><HealthInsuranceQuote /></ProtectedRoute>} />
          <Route path="/health-insurance/proposal-success" element={<ProtectedRoute><ProposalSuccess /></ProtectedRoute>} />
          <Route path="/proposals/:id"                     element={<ProtectedRoute><ProposalDetail /></ProtectedRoute>} />
          <Route path="/dashboard"                         element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/profile"                           element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* ── Admin routes ── */}
          <Route path="/admin"                    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/proposals/:id"      element={<AdminRoute><AdminProposalDetail /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}