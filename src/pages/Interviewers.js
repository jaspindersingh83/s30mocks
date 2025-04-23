import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Interviewers.css';

const Interviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'dsa', 'system-design'

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/interviewers');
      setInterviewers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      toast.error('Failed to load interviewers');
      setLoading(false);
    }
  };

  const filteredInterviewers = interviewers.filter(interviewer => {
    if (filter === 'all') return true;
    if (filter === 'dsa' && interviewer.specializations?.includes('DSA')) return true;
    if (filter === 'system-design' && interviewer.specializations?.includes('System Design')) return true;
    return false;
  });

  return (
    <div className="dashboard-container">
      <h1>Our Interviewers</h1>
      
      <div className="filter-container">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'dsa' ? 'active' : ''}`}
          onClick={() => setFilter('dsa')}
        >
          DSA
        </button>
        <button 
          className={`filter-btn ${filter === 'system-design' ? 'active' : ''}`}
          onClick={() => setFilter('system-design')}
        >
          System Design
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading interviewers...</div>
      ) : filteredInterviewers.length === 0 ? (
        <div className="no-data">
          <p>No interviewers found for the selected filter.</p>
        </div>
      ) : (
        <div className="interviewers-grid">
          {filteredInterviewers.map((interviewer) => (
            <div key={interviewer._id} className="interviewer-card">
              <div className="interviewer-avatar">
                {interviewer.profileImage ? (
                  <img src={interviewer.profileImage} alt={interviewer.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {interviewer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="interviewer-info">
                <h3>{interviewer.name}</h3>
                <p className="interviewer-title">{interviewer.title || 'Software Engineer'}</p>
                
                {interviewer.company && (
                  <p className="interviewer-company">{interviewer.company}</p>
                )}
                
                {interviewer.specializations && interviewer.specializations.length > 0 && (
                  <div className="specializations">
                    {interviewer.specializations.map((spec, index) => (
                      <span key={index} className="specialization-badge">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
                
                {interviewer.experience && (
                  <p className="experience">
                    <strong>Experience:</strong> {interviewer.experience} years
                  </p>
                )}
                
                <a href={`/slots/interviewer/${interviewer._id}`} className="btn-primary view-slots">
                  View Available Slots
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviewers;
