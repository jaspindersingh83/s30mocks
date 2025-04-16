import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  // Password validation
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!doPasswordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      
      if (err.response?.status === 400) {
        setIsTokenValid(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Invalid or Expired Link</h2>
          <div className="error-message">
            <p>
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="auth-actions">
            <Link to="/forgot-password" className="auth-button">
              Request a new reset link
            </Link>
          </div>
          <div className="auth-links">
            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Password Reset Successful</h2>
          <div className="success-message">
            <p>
              Your password has been reset successfully.
            </p>
            <p>
              You will be redirected to the login page in a few seconds.
            </p>
          </div>
          <div className="auth-actions">
            <Link to="/login" className="auth-button">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              className={password && !isPasswordValid ? "error" : ""}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
            {password && !isPasswordValid && (
              <span className="error-message">
                Password must be at least 6 characters
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className={confirmPassword && !doPasswordsMatch ? "error" : ""}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
            {confirmPassword && !doPasswordsMatch && (
              <span className="error-message">
                Passwords do not match
              </span>
            )}
          </div>
          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        <div className="auth-links">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
