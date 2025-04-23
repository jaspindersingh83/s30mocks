import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
import "./RatingManagement.css";

const RatingManagement = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const ratingsPerPage = 10;

  // Fetch ratings
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/ratings/all");
      setRatings(res.data);
      setTotalPages(Math.ceil(res.data.length / ratingsPerPage));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch ratings. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter ratings based on search term
  const filteredRatings = ratings.filter((rating) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (rating.candidate?.name?.toLowerCase().includes(searchTermLower) ||
        rating.interviewer?.name?.toLowerCase().includes(searchTermLower) ||
        rating.feedback?.toLowerCase().includes(searchTermLower))
    );
  });

  // Paginate ratings
  const indexOfLastRating = currentPage * ratingsPerPage;
  const indexOfFirstRating = indexOfLastRating - ratingsPerPage;
  const currentRatings = filteredRatings.slice(
    indexOfFirstRating,
    indexOfLastRating
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // View rating details
  const viewRatingDetails = (rating) => {
    setSelectedRating(rating);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRating(null);
  };

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "star filled" : "star"}
          style={{
            color: i <= rating ? "#ffc107" : "#e4e5e9",
            fontSize: "1.2rem",
            marginRight: "2px",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Ratings Management</h2>
      </div>

      {/* Search and filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by name or feedback..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Loading and error states */}
      {loading ? (
        <div className="admin-loading">Loading ratings...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Ratings table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate</th>
                  <th>Interviewer</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRatings.length > 0 ? (
                  currentRatings.map((rating) => (
                    <tr key={rating._id}>
                      <td>{formatDate(rating.createdAt)}</td>
                      <td>
                        {rating.candidate?.name || "Unknown"} <br />
                        <small>{rating.candidate?.email}</small>
                      </td>
                      <td>
                        {rating.interviewer?.name || "Unknown"} <br />
                        <small>{rating.interviewer?.email}</small>
                      </td>
                      <td>{renderStars(rating.rating)}</td>
                      <td>
                        {rating.feedback ? (
                          rating.feedback.length > 50 ? (
                            `${rating.feedback.substring(0, 50)}...`
                          ) : (
                            rating.feedback
                          )
                        ) : (
                          <em>No feedback provided</em>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => viewRatingDetails(rating)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No ratings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-link"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`page-link ${
                    currentPage === number + 1 ? "active" : ""
                  }`}
                >
                  {number + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-link"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Rating details modal */}
      {modalOpen && selectedRating && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Rating Details</h3>
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="rating-details">
                <div className="detail-row">
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedRating.createdAt)}
                </div>
                <div className="detail-row">
                  <strong>Candidate:</strong>{" "}
                  {selectedRating.candidate?.name || "Unknown"} (
                  {selectedRating.candidate?.email})
                </div>
                <div className="detail-row">
                  <strong>Interviewer:</strong>{" "}
                  {selectedRating.interviewer?.name || "Unknown"} (
                  {selectedRating.interviewer?.email})
                </div>
                <div className="detail-row">
                  <strong>Interview Type:</strong>{" "}
                  {selectedRating.interview?.interviewType || "Unknown"}
                </div>
                <div className="detail-row">
                  <strong>Interview Date:</strong>{" "}
                  {selectedRating.interview?.scheduledDate
                    ? formatDate(selectedRating.interview.scheduledDate)
                    : "Unknown"}
                </div>
                <div className="detail-row">
                  <strong>Rating:</strong> {selectedRating.rating}/5{" "}
                  {renderStars(selectedRating.rating)}
                </div>
                <div className="detail-row">
                  <strong>Feedback:</strong>
                  <p className="feedback-text">
                    {selectedRating.feedback || "No feedback provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingManagement;
