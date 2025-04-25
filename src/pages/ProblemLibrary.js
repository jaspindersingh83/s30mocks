import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import ProblemDetails from '../components/problems/ProblemDetails';
import './ProblemLibrary.css';

const ProblemLibrary = () => {
  const { id } = useParams();
  const { isAuthenticated, isInterviewer, isAdmin, loading } = useContext(AuthContext);
  
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    difficulty: '',
    searchTerm: ''
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchProblems();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchProblemById(id);
    }
  }, [id, isAuthenticated]);
  
  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      setError('');
      
      const res = await api.get('/api/problems');
      setProblems(res.data);
      
      // If no problem is selected and we have problems, select the first one
      if (!selectedProblem && res.data.length > 0 && !id) {
        setSelectedProblem(res.data[0]);
      }
      
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems. Please try again later.');
      toast.error('Failed to load problems');
    } finally {
      setLoadingProblems(false);
    }
  };
  
  const fetchProblemById = async (problemId) => {
    try {
      setLoadingProblem(true);
      setError('');
      
      const res = await api.get(`/api/problems/${problemId}`);
      setSelectedProblem(res.data);
      
    } catch (err) {
      console.error('Error fetching problem:', err);
      setError('Failed to load problem details. Please try again later.');
      toast.error('Failed to load problem details');
    } finally {
      setLoadingProblem(false);
    }
  };
  
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };
  
  const filteredProblems = problems.filter(problem => {
    // Filter by difficulty
    if (filter.difficulty && problem.difficulty !== filter.difficulty) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm && !problem.title.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="not-authenticated">
        <h2>Access Denied</h2>
        <p>You must be logged in to view the problem library.</p>
        <Link to="/login" className="login-link">Login</Link>
      </div>
    );
  }
  
  return (
    <div className="problem-library-container">
      <h1>Problem Library</h1>
      
      <div className="problem-library-layout">
        <div className="problem-sidebar">
          <div className="problem-filters">
            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={filter.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="searchTerm">Search</label>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                value={filter.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search by title..."
              />
            </div>
          </div>
          
          <div className="problems-list">
            {loadingProblems ? (
              <div className="loading-problems">Loading problems...</div>
            ) : filteredProblems.length === 0 ? (
              <div className="no-problems">No problems found</div>
            ) : (
              filteredProblems.map(problem => (
                <div
                  key={problem._id}
                  className={`problem-item ${selectedProblem && selectedProblem._id === problem._id ? 'active' : ''}`}
                  onClick={() => handleProblemSelect(problem)}
                >
                  <div className="problem-item-title">{problem.title}</div>
                  <div className="problem-item-meta">
                    <span className={`difficulty-badge difficulty-${problem.difficulty}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                    {problem.solutions && (
                      <span className="solutions-count">
                        {problem.solutions.length} solution{problem.solutions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="problem-main-content">
          {loadingProblem ? (
            <div className="loading-problem">Loading problem details...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : selectedProblem ? (
            <ProblemDetails 
              problem={selectedProblem} 
              isInterviewer={isInterviewer || isAdmin} 
            />
          ) : (
            <div className="no-problem-selected">
              <h3>No problem selected</h3>
              <p>Please select a problem from the list to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemLibrary;
