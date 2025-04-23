import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import "./InterviewManagement.css";

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, [page, statusFilter, paymentFilter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query params
      let queryParams = `page=${page}&limit=10`;

      if (statusFilter !== "all") {
        queryParams += `&status=${statusFilter}`;
      }

      if (paymentFilter !== "all") {
        queryParams += `&paymentStatus=${paymentFilter}`;
      }

      if (searchTerm.trim()) {
        queryParams += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await api.get(`/api/admin/interviews?${queryParams}`);

      setInterviews(res.data.interviews);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError(err.response?.data?.message || "Failed to load interviews");
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchInterviews();
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled":
        return "badge-info";
      case "in-progress":
        return "badge-warning";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "verified":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="interview-management">
      <h2>Interview Management</h2>

      <div className="filters-container">
        <div className="filter-group">
          <label>Interview Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Interviews</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name or email"
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
        <div className="loading">Loading interviews...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : interviews.length === 0 ? (
        <div className="no-interviews">
          No interviews found matching your filters.
        </div>
      ) : (
        <>
          <div className="interviews-table-container">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Scheduled Date</th>
                  <th>Candidate</th>
                  <th>Interviewer</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview._id}>
                    <td>{interview._id.substring(0, 8)}...</td>
                    <td>{formatDate(interview.scheduledDate)}</td>
                    <td>{interview.candidate?.name || "Unknown"}</td>
                    <td>{interview.interviewer?.name || "Unknown"}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getPaymentBadgeClass(
                          interview.paymentStatus
                        )}`}
                      >
                        {interview.paymentStatus}
                      </span>
                    </td>
                    <td>₹{interview.price ? interview.price : "N/A"}</td>
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
    </div>
  );
};

export default InterviewManagement;
