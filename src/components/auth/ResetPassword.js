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
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">Invalid or Expired Link</h2>
                <div className="alert alert-danger">
                  <p>
                    This password reset link is invalid or has expired.
                  </p>
                </div>
                <p>
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request a new reset link
                  </Link>
                </p>
                <p>
                  <Link to="/login" className="btn btn-outline-primary">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">Password Reset Successful</h2>
                <div className="alert alert-success">
                  <p>
                    Your password has been reset successfully.
                  </p>
                  <p>
                    You will be redirected to the login page in a few seconds.
                  </p>
                </div>
                <p>
                  <Link to="/login" className="btn btn-primary">
                    Go to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Your Password</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${password && !isPasswordValid ? "is-invalid" : ""}`}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  {password && !isPasswordValid && (
                    <div className="invalid-feedback">
                      Password must be at least 6 characters
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${confirmPassword && !doPasswordsMatch ? "is-invalid" : ""}`}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  {confirmPassword && !doPasswordsMatch && (
                    <div className="invalid-feedback">
                      Passwords do not match
                    </div>
                  )}
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
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
                </div>
              </form>
              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
