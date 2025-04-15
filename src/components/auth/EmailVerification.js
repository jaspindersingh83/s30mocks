import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./Auth.css";

const EmailVerification = () => {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/api/auth/verify/${token}`);
        setStatus("success");
        setMessage(response.data.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return <div className="loading">Verifying your email...</div>;
      case "success":
        return (
          <div className="success">
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p>Redirecting to login page...</p>
          </div>
        );
      case "error":
        return (
          <div className="error">
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">{renderContent()}</div>
    </div>
  );
};

export default EmailVerification;
