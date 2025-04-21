import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Interviews from "./pages/Interviews";
import Interviewers from "./pages/Interviewers";
import Profile from "./pages/Profile";
import ProblemLibrary from "./pages/ProblemLibrary";

// Slot Components
import InterviewerSlots from "./components/slots/InterviewerSlots";
import AvailableSlots from "./components/slots/AvailableSlots";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Payment Components
import UpiPayment from "./components/payments/UpiPayment";
import UpiQrCodeUpload from "./components/payments/UpiQrCodeUpload";
import PaymentVerification from "./components/payments/PaymentVerification";

// Common Components
import WhatsAppChat from "./components/common/WhatsAppChat";
import EmailVerification from "./components/EmailVerification";

// CSS
import "./App.css";
import "./styles/responsive.css";
import "./styles/forms.css";
import "./styles/cards.css";
import "./styles/dashboard.css";
import "./styles/interviews.css";
import "./styles/payments.css";
import "./styles/admin.css";
import "./styles/problems.css";

// Set up axios defaults
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

// Auth guard component for protected routes
const ProtectedRoute = ({ children, requiredRole }) => {
  // Get token and user from localStorage
  const token = localStorage.getItem("token");
  const userFromStorage = localStorage.getItem("user");
  let user = null;

  // First check if we have a token - this is required for authentication
  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" />;
  }

  try {
    // Only parse if userFromStorage exists and is not the string "undefined"
    if (userFromStorage && userFromStorage !== "undefined") {
      const parsedUser = JSON.parse(userFromStorage);
      
      // Handle both possible data structures: direct user object or nested in user property
      if (parsedUser.role) {
        // Direct user object
        user = parsedUser;
      } else if (parsedUser.user && parsedUser.user.role) {
        // Nested user object
        user = parsedUser.user;
      }
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    // Clear invalid data from localStorage
    localStorage.removeItem('user');
  }

  if (!user) {
    console.log("No valid user data found, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (requiredRole) {
    console.log("Checking role requirement:", requiredRole, "vs user role:", user.role);
    // Special case for admin route
    if (requiredRole === "admin" && user.role === "admin") {
      return children;
    }

    // For non-admin routes, check if user has required role or is admin
    if (user.role !== requiredRole && user.role !== "admin") {
      console.log("User doesn't have required role, redirecting to dashboard");
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

function App() {
  const GOOGLE_CLIENT_ID =
    "789194923854-mlpbn58i58labctabg3n15p7o9kvv4ev.apps.googleusercontent.com"; // Get from .env file

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} onScriptLoadError={(err) => console.log("Google OAuth script load error:", err)} useOneTap={false}>
      <AuthProvider>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            toastClassName="toast-container"
            theme="colored"
            style={{ zIndex: 9999 }}
            toastStyle={{
              borderRadius: '4px',
              fontFamily: 'Arial, sans-serif'
            }}
            progressStyle={{
              height: '3px'
            }}
            progressClassName={{
              success: 'toast-progress-success'
            }}
          />
          <WhatsAppChat />
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Payment Routes */}
              <Route
                path="/payments/:interviewId"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <UpiPayment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/setup"
                element={
                  <ProtectedRoute requiredRole="interviewer">
                    <UpiQrCodeUpload />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments/verify"
                element={
                  <ProtectedRoute requiredRole="interviewer">
                    <PaymentVerification />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Slot Management Routes */}
              <Route
                path="/slots/manage"
                element={
                  <ProtectedRoute requiredRole="interviewer">
                    <InterviewerSlots />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/slots/available"
                element={
                  <ProtectedRoute>
                    <AvailableSlots />
                  </ProtectedRoute>
                }
              />

              {/* Interviews Route */}
              <Route
                path="/interviews"
                element={
                  <ProtectedRoute>
                    <Interviews />
                  </ProtectedRoute>
                }
              />

              {/* Redirect Interviewers Route to Available Slots */}
              <Route
                path="/interviewers"
                element={<Navigate to="/slots/available" />}
              />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Problem Library Routes - Admin Only */}
              <Route
                path="/problems"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ProblemLibrary />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/problems/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ProblemLibrary />
                  </ProtectedRoute>
                }
              />

              {/* Email Verification Route */}
              <Route
                path="/verify-email/:token"
                element={<EmailVerification />}
              />

              {/* Catch all - 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
