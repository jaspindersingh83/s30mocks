import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './ResponsiveNavbar.css';

const ResponsiveNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin, isInterviewer, isCandidate } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          S30 Mocks
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={isOpen ? 'hamburger-icon open' : 'hamburger-icon'}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  Dashboard
                </Link>
              </li>
              
              {isAdmin && (
                <>
                  <li className="nav-item">
                    <Link to="/admin/problems" className="nav-link" onClick={closeMenu}>
                      Manage Problems
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/slots" className="nav-link" onClick={closeMenu}>
                      Manage Slots
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/users" className="nav-link" onClick={closeMenu}>
                      Manage Users
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/prices" className="nav-link" onClick={closeMenu}>
                      Manage Prices
                    </Link>
                  </li>
                </>
              )}
              {isCandidate && (
                <>
                  <li className="nav-item">
                    <Link to="/slots" className="nav-link" onClick={closeMenu}>
                      Book Slot
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/interviews" className="nav-link" onClick={closeMenu}>
                      My Interviews
                    </Link>
                  </li>
                </>
              )}
              
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  Profile
                </Link>
              </li>
              
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link-btn">
                  Logout
                </button>
              </li>
              
              <li className="nav-item user-info">
                <span>
                  {user?.user?.name || user?.name || 'User'}
                </span>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={closeMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;
