import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate', // Fixed role - users can only register as candidates
    recaptchaToken: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { register, googleLogin, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.recaptchaToken) {
      errors.recaptcha = 'Please complete the reCAPTCHA verification';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userData = {
      name,
      email,
      password,
      role: 'candidate', // Always register as candidate
      recaptchaToken: formData.recaptchaToken
    };
    
    const success = await register(userData);
    if (success) {
      navigate('/dashboard');
    } else {
      // Reset reCAPTCHA on failure
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setFormData({ ...formData, recaptchaToken: '' });
    }
  };
  
  const handleRecaptchaChange = (token) => {
    setFormData({ ...formData, recaptchaToken: token });
    // Clear recaptcha error if it exists
    if (formErrors.recaptcha) {
      setFormErrors({ ...formErrors, recaptcha: '' });
    }
  };

  return (
    <div className="auth-container">
      
      <div className="auth-card">
          <div className="google-login-container">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const success = await googleLogin(credentialResponse);
              if (success) {
                navigate('/dashboard');
              }
            }}
            onError={() => {
              console.error('Google Login Failed');
            }}
            useOneTap
            theme="filled_black"
            text="signup_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>
        <div className="auth-divider">
          <span>OR</span>
        </div>
        <h2>Create an Account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
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
              className={formErrors.password ? 'error' : ''}
            />
            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={formErrors.confirmPassword ? 'error' : ''}
            />
            {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
          </div>
          
          <div className="form-group recaptcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LcqChsrAAAAAAyVppRW3nVUt6_exB7dR9EF0w0x'} 
              onChange={handleRecaptchaChange}
              theme="dark"
            />
            {formErrors.recaptcha && <div className="error-message">{formErrors.recaptcha}</div>}
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
