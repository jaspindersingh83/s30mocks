import React, { createContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // First check localStorage for user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          // If we have stored user data, use it immediately
          const userData = JSON.parse(storedUser);
          setUser({ user: userData });
        }
        
        // Then fetch the latest user data from the server
        const res = await axios.get('/api/auth/me');
        console.log('Loaded user data:', res.data);
        setUser(res.data);
        
        // Update localStorage with the latest data
        if (res.data && res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/register', userData);
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data);
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      // Remove user data from localStorage
      localStorage.removeItem('user');
      // Clear any Google OAuth tokens
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.put('/api/users/profile', userData);
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const googleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      // Decode the credential to get user info
      const decodedToken = jwtDecode(credentialResponse.credential);
      
      // Send the token to the backend for verification and user creation/login
      const res = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });
      
      setUser(res.data);
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Use useMemo to derive authentication state values
  // This ensures they're updated whenever user changes
  const authValues = useMemo(() => {
    // Extract the role from the user object structure
    const userRole = user?.user?.role || user?.role;
    
    return {
      user,
      loading,
      error,
      register,
      login,
      logout,
      updateProfile,
      googleLogin,
      isAuthenticated: !!user,
      isInterviewer: userRole === 'interviewer',
      isCandidate: userRole === 'candidate',
      isAdmin: userRole === 'admin'
    };
  }, [user, loading, error]);

  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthContext;
