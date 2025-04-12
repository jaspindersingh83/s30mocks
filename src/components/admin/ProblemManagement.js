import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProblemManagement.css';

const ProblemManagement = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    leetcodeUrl: '',
    solutionVideoUrl: '',
    difficulty: 'medium',
    hints: [''],
    solutions: [
      {
        language: 'java',
        code: '',
        description: '',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      }
    ]
  });
  
  useEffect(() => {
    fetchProblems();
  }, []);
  
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get('/api/problems');
      setProblems(res.data);
      
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError(err.response?.data?.message || 'Failed to load problems');
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleHintChange = (index, value) => {
    const updatedHints = [...formData.hints];
    updatedHints[index] = value;
    setFormData({
      ...formData,
      hints: updatedHints
    });
  };
  
  const addHint = () => {
    setFormData({
      ...formData,
      hints: [...formData.hints, '']
    });
  };
  
  const removeHint = (index) => {
    const updatedHints = [...formData.hints];
    updatedHints.splice(index, 1);
    setFormData({
      ...formData,
      hints: updatedHints
    });
  };
  
  const handleSolutionChange = (index, field, value) => {
    const updatedSolutions = [...formData.solutions];
    updatedSolutions[index] = {
      ...updatedSolutions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      solutions: updatedSolutions
    });
  };
  
  const addSolution = () => {
    setFormData({
      ...formData,
      solutions: [
        ...formData.solutions,
        {
          language: 'python',
          code: '',
          description: '',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)'
        }
      ]
    });
  };
  
  const removeSolution = (index) => {
    const updatedSolutions = [...formData.solutions];
    updatedSolutions.splice(index, 1);
    setFormData({
      ...formData,
      solutions: updatedSolutions
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty hints
      const filteredHints = formData.hints.filter(hint => hint.trim() !== '');
      
      // Validate solutions
      const validSolutions = formData.solutions.filter(solution => 
        solution.code.trim() !== '' && 
        solution.description.trim() !== ''
      );
      
      if (validSolutions.length === 0) {
        toast.error('At least one solution is required');
        return;
      }
      
      const submitData = {
        ...formData,
        hints: filteredHints,
        solutions: validSolutions
      };
      
      if (editingProblem) {
        await axios.put(`/api/problems/${editingProblem._id}`, submitData);
        toast.success('Problem updated successfully');
      } else {
        await axios.post('/api/problems', submitData);
        toast.success('Problem added successfully');
      }
      
      // Reset form and fetch updated problems
      resetForm();
      fetchProblems();
      
    } catch (err) {
      console.error('Error saving problem:', err);
      toast.error(err.response?.data?.message || 'Failed to save problem');
    }
  };
  
  const handleEdit = (problem) => {
    setEditingProblem(problem);
    
    // Ensure there's at least one solution
    const solutions = problem.solutions && problem.solutions.length > 0
      ? problem.solutions
      : [{
          language: 'java',
          code: '',
          description: '',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)'
        }];
    
    // Ensure there's at least one hint
    const hints = problem.hints && problem.hints.length > 0
      ? problem.hints
      : [''];
    
    setFormData({
      title: problem.title || '',
      leetcodeUrl: problem.leetcodeUrl || '',
      solutionVideoUrl: problem.solutionVideoUrl || '',
      difficulty: problem.difficulty || 'medium',
      hints,
      solutions
    });
    
    setShowForm(true);
  };
  
  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/problems/${problemId}`);
      toast.success('Problem deleted successfully');
      fetchProblems();
    } catch (err) {
      console.error('Error deleting problem:', err);
      toast.error(err.response?.data?.message || 'Failed to delete problem');
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      leetcodeUrl: '',
      solutionVideoUrl: '',
      difficulty: 'medium',
      hints: [''],
      solutions: [
        {
          language: 'java',
          code: '',
          description: '',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)'
        }
      ]
    });
    setEditingProblem(null);
    setShowForm(false);
  };
  
  return (
    <div className="problem-management">
      <div className="problem-management-header">
        <h2>Problem Management</h2>
        <button 
          className="add-problem-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Problem'}
        </button>
      </div>
      
      {showForm && (
        <div className="problem-form-container">
          <h3>{editingProblem ? 'Edit Problem' : 'Add New Problem'}</h3>
          <form onSubmit={handleSubmit} className="problem-form">
            <div className="form-group">
              <label htmlFor="title">Problem Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter problem title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="leetcodeUrl">LeetCode URL</label>
              <input
                type="url"
                id="leetcodeUrl"
                name="leetcodeUrl"
                value={formData.leetcodeUrl}
                onChange={handleInputChange}
                required
                placeholder="https://leetcode.com/problems/..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="solutionVideoUrl">Video Solution URL</label>
              <input
                type="url"
                id="solutionVideoUrl"
                name="solutionVideoUrl"
                value={formData.solutionVideoUrl}
                onChange={handleInputChange}
                required
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="form-section">
              <h4>Hints</h4>
              {formData.hints.map((hint, index) => (
                <div key={`hint-${index}`} className="hint-item">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => handleHintChange(index, e.target.value)}
                    placeholder="Enter a hint"
                  />
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => removeHint(index)}
                    disabled={formData.hints.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="add-button"
                onClick={addHint}
              >
                Add Hint
              </button>
            </div>
            
            <div className="form-section">
              <h4>Solutions</h4>
              {formData.solutions.map((solution, index) => (
                <div key={`solution-${index}`} className="solution-item">
                  <div className="solution-header">
                    <h5>Solution {index + 1}</h5>
                    <button 
                      type="button" 
                      className="remove-button"
                      onClick={() => removeSolution(index)}
                      disabled={formData.solutions.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={solution.language}
                      onChange={(e) => handleSolutionChange(index, 'language', e.target.value)}
                      required
                    >
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={solution.description}
                      onChange={(e) => handleSolutionChange(index, 'description', e.target.value)}
                      placeholder="Explain the approach used in this solution"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Code</label>
                    <textarea
                      className="code-textarea"
                      value={solution.code}
                      onChange={(e) => handleSolutionChange(index, 'code', e.target.value)}
                      placeholder={solution.language === 'java' ? 
                        "public class Solution {\n  public int example(int[] nums) {\n    // Your solution here\n  }\n}" : 
                        "def solution(nums):\n  # Your solution here\n  pass"
                      }
                      required
                    />
                  </div>
                  
                  <div className="complexity-group">
                    <div className="form-group">
                      <label>Time Complexity</label>
                      <input
                        type="text"
                        value={solution.timeComplexity}
                        onChange={(e) => handleSolutionChange(index, 'timeComplexity', e.target.value)}
                        placeholder="O(n)"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Space Complexity</label>
                      <input
                        type="text"
                        value={solution.spaceComplexity}
                        onChange={(e) => handleSolutionChange(index, 'spaceComplexity', e.target.value)}
                        placeholder="O(1)"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="add-button"
                onClick={addSolution}
              >
                Add Solution
              </button>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                {editingProblem ? 'Update Problem' : 'Add Problem'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading problems...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : problems.length === 0 ? (
        <div className="no-problems">No problems found. Add your first problem!</div>
      ) : (
        <div className="problems-table-container">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Solutions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem._id}>
                  <td>{problem.title}</td>
                  <td>
                    <span className={`difficulty-badge difficulty-${problem.difficulty}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </td>
                  <td>
                    {problem.solutions && problem.solutions.length > 0 ? (
                      <div className="solution-languages">
                        {problem.solutions.map((solution, index) => (
                          <span key={index} className={`language-badge language-${solution.language}`}>
                            {solution.language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-solutions">No solutions</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(problem)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(problem._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProblemManagement;
