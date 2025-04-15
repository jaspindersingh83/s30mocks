import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./EmailVerification.css";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Verification failed");
        toast.error(err.response?.data?.message || "Verification failed");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    try {
      const email = localStorage.getItem("pendingVerificationEmail");
      if (!email) {
        toast.error("No email found for verification");
        return;
      }

      const response = await axios.post("/api/auth/resend-verification", {
        email,
      });
      toast.success(response.data.message);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification email"
      );
    }
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <h2>Email Verification</h2>

        {verifying ? (
          <>
            <div className="loading-spinner"></div>
            <p>Verifying your email...</p>
          </>
        ) : error ? (
          <div className="verification-error">
            <p>{error}</p>
            <button
              className="resend-button"
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </button>
            <button className="login-button" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        ) : (
          <div className="verification-success">
            <i className="fas fa-check-circle"></i>
            <p>Email verified successfully!</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
