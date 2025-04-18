import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import AuthContext from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isInterviewer, isCandidate, isAdmin, isAuthenticated } =
    useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    upcomingInterviews: 0,
    completedInterviews: 0,
    pendingPayments: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showLinkedInPrompt, setShowLinkedInPrompt] = useState(false);
  const [showMeetingUrlPrompt, setShowMeetingUrlPrompt] = useState(false);

  // Determine user role from both context and localStorage
  useEffect(() => {
    if (user && user.user) {
      setUserRole(user.user.role);
      
      // Check if LinkedIn profile is missing
      if (!user.user.linkedInUrl) {
        setShowLinkedInPrompt(true);
      }
      
      // Check if interviewer is missing default meeting URL
      if (user.user.role === 'interviewer' && !user.user.defaultMeetingLink) {
        setShowMeetingUrlPrompt(true);
      }
    } else {
      // Fallback to localStorage if context doesn't have role
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserRole(parsedUser.role);
          
          // Check if LinkedIn profile is missing
          if (!parsedUser.linkedInUrl) {
            setShowLinkedInPrompt(true);
          }
          
          // Check if interviewer is missing default meeting URL
          if (parsedUser.role === 'interviewer' && !parsedUser.defaultMeetingLink) {
            setShowMeetingUrlPrompt(true);
          }
        } catch (err) {
          console.error("Error parsing stored user data:", err);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user?.user?.name}</h2>
        <p className="user-role">{user?.user?.role}</p>
      </div>
      
      {/* Profile Completion Prompts */}
      {showLinkedInPrompt && (
        <div className="profile-prompt linkedin-prompt">
          <div className="prompt-content">
            <i className="fab fa-linkedin prompt-icon"></i>
            <div className="prompt-text">
              <h3>Add Your LinkedIn Profile</h3>
              <p>Connect with interviewers and candidates by adding your LinkedIn profile.</p>
            </div>
          </div>
          <Link to="/profile" className="prompt-action">Add Now</Link>
          <button className="prompt-dismiss" onClick={() => setShowLinkedInPrompt(false)}>×</button>
        </div>
      )}
      
      {showMeetingUrlPrompt && (
        <div className="profile-prompt meeting-prompt">
          <div className="prompt-content">
            <i className="fas fa-video prompt-icon"></i>
            <div className="prompt-text">
              <h3>Set Default Meeting URL</h3>
              <p>Make it easier to start interviews by setting a default meeting URL.</p>
            </div>
          </div>
          <Link to="/profile" className="prompt-action">Add Now</Link>
          <button className="prompt-dismiss" onClick={() => setShowMeetingUrlPrompt(false)}>×</button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Upcoming Interviews</h3>
          <p className="stat-value">{stats.upcomingInterviews}</p>
          <Link
            to="/interviews?status=scheduled"
            className="stat-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/interviews?status=scheduled";
            }}
          >
            View all
          </Link>
        </div>

        <div className="stat-card">
          <h3>Completed Interviews</h3>
          <p className="stat-value">{stats.completedInterviews}</p>
          <Link
            to="/interviews?status=completed"
            className="stat-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/interviews?status=completed";
            }}
          >
            View all
          </Link>
        </div>

        {(isInterviewer || userRole === "interviewer") && (
          <>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="stat-value">{stats.pendingPayments}</p>
              <Link
                to="/payments/verify"
                className="stat-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/payments/verify";
                }}
              >
                Verify payments
              </Link>
            </div>

            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p className="stat-value">₹{stats.totalEarnings}</p>
              <Link
                to="/earnings"
                className="stat-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/earnings";
                }}
              >
                View details
              </Link>
            </div>
          </>
        )}

        {(isCandidate || userRole === "candidate") && (
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <p className="stat-value">{stats.pendingPayments}</p>
            <Link to="/interviews" className="stat-link">
              Manage interviews & payments
            </Link>
          </div>
        )}
      </div>

      <div className="action-cards">
        {(isCandidate || userRole === "candidate") && (
          <>
            <div className="action-card">
              <h3>Book a Mock Interview</h3>
              <p>
                Browse available slots and schedule your next mock interview
              </p>
              <Link
                to="/slots/available"
                className="action-button"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/slots/available";
                }}
              >
                Available Slots
              </Link>
            </div>
          </>
        )}

        {(isInterviewer || userRole === "interviewer") && (
          <>
            <div className="action-card">
              <h3>Set Up UPI Payment</h3>
              <p>Upload your UPI QR code to receive payments from candidates</p>
              <Link
                to="/payments/setup"
                className="action-button"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/payments/setup";
                }}
              >
                Set Up UPI
              </Link>
            </div>

            <div className="action-card">
              <h3>Manage Interview Slots</h3>
              <p>
                Create and manage your available interview slots for candidates
              </p>
              <Link
                to="/slots/manage"
                className="action-button"
                onClick={(e) => {
                  // Force a page reload to ensure proper role-based access
                  e.preventDefault();
                  window.location.href = "/slots/manage";
                }}
              >
                Manage Slots
              </Link>
            </div>
          </>
        )}

        {(isAdmin || userRole === "admin") && (
          <div className="action-card">
            <h3>Admin Dashboard</h3>
            <p>Manage users, interviews, and system settings</p>
            <Link
              to="/admin"
              className="action-button"
              onClick={(e) => {
                // Force a page reload to ensure proper role-based access
                e.preventDefault();
                window.location.href = "/admin";
              }}
            >
              Go to Admin
            </Link>
          </div>
        )}

        <div className="action-card">
          <h3>Update Profile</h3>
          <p>Update your personal information and preferences</p>
          <Link to="/profile" className="action-button">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
