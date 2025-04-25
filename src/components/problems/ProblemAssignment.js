import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const ProblemAssignment = ({ interviewId, onProblemAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const assignRandomProblem = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.post(`/api/problems/assign/${interviewId}`);
      
      if (res.data) {
        if (onProblemAssigned) {
          onProblemAssigned(res.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error assigning problem');
      console.error('Error assigning problem:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="problem-assignment-container">
      <h3>Assign Problem</h3>
      <p>
        Click the button below to assign a random problem to this interview.
        Once assigned, you'll be able to see the problem details.
      </p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <button 
        className="btn btn-primary" 
        onClick={assignRandomProblem}
        disabled={loading}
      >
        {loading ? 'Assigning...' : 'Assign Random Problem'}
      </button>
    </div>
  );
};

export default ProblemAssignment;
