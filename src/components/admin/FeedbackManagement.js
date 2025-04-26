import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import FeedbackDetails from "../feedback/FeedbackDetails";
import "./InterviewManagement.css"; // Reuse existing admin styling

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [interviewTypeFilter, setInterviewTypeFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, interviewTypeFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all feedback from the server
      const res = await api.get("/api/feedback/all");
      
      // Filter by interview type if needed
      let filteredFeedbacks = res.data;
      if (interviewTypeFilter !== "all") {
        filteredFeedbacks = res.data.filter(
          feedback => feedback.interview && feedback.interview.interviewType === interviewTypeFilter
        );
      }
      
      // Filter by search term if provided
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredFeedbacks = filteredFeedbacks.filter(
          feedback => 
            (feedback.candidate && feedback.candidate.name.toLowerCase().includes(term)) ||
            (feedback.interviewer && feedback.interviewer.name.toLowerCase().includes(term))
        );
      }
      
      // Simple client-side pagination
      const itemsPerPage = 10;
      const totalItems = filteredFeedbacks.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      
      // Get current page items
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageItems = filteredFeedbacks.slice(startIndex, endIndex);
      
      setFeedbacks(currentPageItems);
      setTotalPages(calculatedTotalPages || 1); // Ensure at least 1 page even if empty
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError(err.response?.data?.message || "Failed to load feedback");
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchFeedbacks();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAverageScore = (feedback) => {
    if (!feedback) return "N/A";
    const scores = [
      feedback.codingAndDebugging,
      feedback.communicationScore,
      feedback.problemSolvingScore
    ];
    const sum = scores.reduce((total, score) => total + score, 0);
    return (sum / scores.length).toFixed(1);
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  return (
    <div className="interview-management">
      <h2>Feedback Management</h2>

      <div className="filters-container">
        <div className="filter-group">
          <label>Interview Type:</label>
          <select
            value={interviewTypeFilter}
            onChange={(e) => {
              setInterviewTypeFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="DSA">DSA</option>
            <option value="System Design">System Design</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by candidate or interviewer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading feedback...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : feedbacks.length === 0 ? (
        <div className="no-interviews">
          No feedback found matching your filters.
        </div>
      ) : (
        <>
          <div className="interviews-table-container">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate</th>
                  <th>Interviewer</th>
                  <th>Interview Type</th>
                  <th>Average Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback) => (
                  <tr key={feedback._id}>
                    <td>{formatDate(feedback.createdAt)}</td>
                    <td>{feedback.candidate?.name || "Unknown"}</td>
                    <td>{feedback.interviewer?.name || "Unknown"}</td>
                    <td>{feedback.interview?.interviewType || "N/A"}</td>
                    <td>{calculateAverageScore(feedback)}</td>
                    <td>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleViewFeedback(feedback)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedFeedback && (
        <FeedbackDetails 
          feedback={selectedFeedback} 
          onClose={() => setSelectedFeedback(null)} 
        />
      )}
    </div>
  );
};

export default FeedbackManagement;
