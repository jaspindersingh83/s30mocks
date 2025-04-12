import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedInUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedInUrl: user.linkedInUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for update
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        linkedInUrl: formData.linkedInUrl
      };
      
      // Add password fields if in password change mode
      if (passwordChangeMode) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          setLoading(false);
          return;
        }
        
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await axios.put('/api/users/profile', updateData);
      
      // Update user in context
      updateUser(response.data);
      
      toast.success('Profile updated successfully');
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordChangeMode(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="linkedInUrl">LinkedIn Profile URL</label>
            <input
              type="url"
              id="linkedInUrl"
              name="linkedInUrl"
              value={formData.linkedInUrl}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/yourprofile"
            />
            <small>Share your LinkedIn profile to connect with interviewers</small>
          </div>
        </div>
        
        <div className="form-section">
          <div className="password-section-header">
            <h2>Password</h2>
            {!passwordChangeMode && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setPasswordChangeMode(true)}
              >
                Change Password
              </button>
            )}
          </div>
          
          {passwordChangeMode && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setPasswordChangeMode(false);
                  setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel Password Change
              </button>
            </>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
