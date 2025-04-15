import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post("/api/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      // For security reasons, we don't show specific errors
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title mb-4">Check Your Email</h2>
                <div className="alert alert-success">
                  <p>
                    If an account exists with the email <strong>{email}</strong>,
                    we've sent instructions to reset your password.
                  </p>
                  <p>
                    Please check your inbox and follow the link in the email.
                  </p>
                </div>
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

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="form-text">
                    Enter the email address you used to register.
                  </div>
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
                        Sending...
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

export default ForgotPassword;
