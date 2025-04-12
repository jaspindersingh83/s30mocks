import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isInterviewer, isCandidate, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="text">
            {"{ "}S30{" }"}
          </div>
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              
              <Link 
                to="/interviews" 
                className={`nav-link ${location.pathname === '/interviews' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Interviews
              </Link>
              
              {isCandidate && (
                <Link 
                  to="/slots/available" 
                  className={`nav-link ${location.pathname === '/slots/available' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Available Slots
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  to="/problems" 
                  className={`nav-link ${location.pathname.startsWith('/problems') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Problem Library
                </Link>
              )}
              
              {(isInterviewer || isAdmin) && (
                <Link 
                  to="/payments/verify" 
                  className={`nav-link ${location.pathname === '/payments/verify' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Verify Payments
                </Link>
              )}
              
              {isInterviewer && (
                <Link 
                  to="/payments/setup" 
                  className={`nav-link ${location.pathname === '/payments/setup' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  UPI Setup
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="admin-link"
                  onClick={closeMenu}
                >
                  Admin Panel
                </Link>
              )}
              
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
              
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
