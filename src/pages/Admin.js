import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import PriceManagement from '../components/admin/PriceManagement';
import InterviewManagement from '../components/admin/InterviewManagement';
import ProblemManagement from '../components/admin/ProblemManagement';
import RatingManagement from '../components/admin/RatingManagement';
import PaymentManagement from '../components/admin/PaymentManagement';
import './Admin.css';

const Admin = () => {
  const {   isAdmin, isAuthenticated, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');

  // Redirect if not admin
  if (!loading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          Price Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          Interview Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Problem Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          Rating Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Management
        </button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'prices' && <PriceManagement />}
        {activeTab === 'interviews' && <InterviewManagement />}
        {activeTab === 'problems' && <ProblemManagement />}
        {activeTab === 'ratings' && <RatingManagement />}
        {activeTab === 'payments' && <PaymentManagement />}
      </div>
    </div>
  );
};

export default Admin;
