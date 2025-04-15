import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/api";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [resendStatus, setResendStatus] = useState("");
  const { login, googleLogin, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendStatus("sending");
      await api.post("/api/auth/resend-verification", { email });
      setResendStatus("sent");
    } catch (err) {
      setResendStatus("error");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  const renderResendVerification = () => {
    if (error?.includes("verify your email")) {
      return (
        <div className="resend-verification">
          <p>Haven't received the verification email?</p>
          {resendStatus === "sending" ? (
            <p>Sending verification email...</p>
          ) : resendStatus === "sent" ? (
            <p className="success">
              Verification email sent! Please check your inbox.
            </p>
          ) : resendStatus === "error" ? (
            <p className="error">
              Failed to send verification email. Please try again.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              className="resend-button"
            >
              Resend Verification Email
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Your Account</h2>

        {error && <div className="auth-error">{error}</div>}
        {renderResendVerification()}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={formErrors.email ? "error" : ""}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={formErrors.password ? "error" : ""}
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const success = await googleLogin(credentialResponse);
              if (success) {
                navigate("/dashboard");
              }
            }}
            onError={() => {
              console.error("Google Login Failed");
            }}
            useOneTap
            theme="filled_black"
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
