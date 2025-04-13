import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Interviews from './pages/Interviews';
import Interviewers from './pages/Interviewers';
import Profile from './pages/Profile';
import ProblemLibrary from './pages/ProblemLibrary';

// Slot Components
import InterviewerSlots from './components/slots/InterviewerSlots';
import AvailableSlots from './components/slots/AvailableSlots';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Payment Components
import UpiPayment from './components/payments/UpiPayment';
import UpiQrCodeUpload from './components/payments/UpiQrCodeUpload';
import PaymentVerification from './components/payments/PaymentVerification';

// Common Components
import WhatsAppChat from './components/common/WhatsAppChat';

// CSS
import './App.css';

// Set up axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Auth guard component for protected routes
const ProtectedRoute = ({ children, requiredRole }) => {
  // Get user from localStorage and context
  const userFromStorage = localStorage.getItem('user');
  let user = null;
  
  try {
    if (userFromStorage) {
      user = JSON.parse(userFromStorage);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (requiredRole) {
    // Special case for admin route
    if (requiredRole === 'admin' && user.role === 'admin') {
      return children;
    }
    
    // For non-admin routes, check if user has required role or is admin
    if (user.role !== requiredRole && user.role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
};

function App() {
  const GOOGLE_CLIENT_ID = '789194923854-mlpbn58i58labctabg3n15p7o9kvv4ev.apps.googleusercontent.com'; // Get from .env file
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        <WhatsAppChat />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
              element={
                <Navigate to="/slots/available" />
              } 
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
