import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/api";
import PreBookingPayment from "../payments/PreBookingPayment";
import "./Slots.css";

const AvailableSlots = () => {
  const { user, isCandidate } = useContext(AuthContext);
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [interviewerRatings, setInterviewerRatings] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  // Format date for display - Converts from UTC to local timezone with clear timezone indicator
  const formatDate = (dateString, timezone) => {
    // Use slot's timezone if available, otherwise use browser's timezone
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return DateTime.fromISO(dateString)
      .setZone(tz)
      .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a (z)");
  };

  // Load available slots
  const loadSlots = async () => {
    try {
      setLoading(true);
      let url = "/api/slots/available";

      // Add query parameters
      const params = [];

      if (dateFilter) {
        // Convert local date to UTC for server query
        const filterDate = new Date(dateFilter);
        const nextDay = new Date(filterDate);
        nextDay.setDate(filterDate.getDate() + 1);

        params.push(`startDate=${filterDate.toISOString()}`);
        params.push(`endDate=${nextDay.toISOString()}`);
      }

      if (selectedInterviewer) {
        params.push(`interviewerId=${selectedInterviewer}`);
      }

      if (selectedType) {
        params.push(`interviewType=${selectedType}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await api.get(url);
      setSlots(res.data);

      // Extract unique interviewers from slots
      const uniqueInterviewers = [];
      const interviewerIds = new Set();

      res.data.forEach((slot) => {
        if (slot.interviewer && !interviewerIds.has(slot.interviewer._id)) {
          interviewerIds.add(slot.interviewer._id);

          // Store interviewer details, checking for different possible field names
          const linkedInField =
            slot.interviewer.linkedInUrl ||
            slot.interviewer.linkedinProfile ||
            slot.interviewer.linkedInProfile ||
            slot.interviewer.linkedinUrl ||
            slot.interviewer.linkedin ||
            "";

          uniqueInterviewers.push({
            id: slot.interviewer._id,
            name: slot.interviewer.name,
            email: slot.interviewer.email,
            linkedInUrl: linkedInField,
            averageRating: slot.interviewer.averageRating || 0,
            ratingsCount: slot.interviewer.ratingsCount || 0,
          });
        }
      });

      setInterviewers(uniqueInterviewers);

      // Fetch ratings for interviewers if not included in the response
      uniqueInterviewers.forEach(async (interviewer) => {
        if (interviewer.averageRating === 0) {
          try {
            const ratingRes = await api.get(
              `/api/ratings/interviewer/${interviewer.id}/average`
            );
            setInterviewerRatings((prev) => ({
              ...prev,
              [interviewer.id]: ratingRes.data,
            }));
          } catch (error) {
            // Error handling without console.log
          }
        }
      });
    } catch (err) {
      console.error("Failed to load slots:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  // Load slots on component mount and when filters change
  useEffect(() => {
    loadSlots();
  }, [dateFilter, selectedInterviewer, selectedType]);

  // Handle initiating the booking process
  const handleInitiateBooking = (slot) => {
    if (!window.confirm("You'll need to complete payment before this slot is booked. Proceed?")) {
      return;
    }

    // Set the selected slot and show payment component
    setSelectedSlot(slot);
    setShowPayment(true);
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    toast.success("Payment submitted and slot booked successfully! Check your interviews page for details.");
    
    // Update local state to remove the booked slot
    if (selectedSlot) {
      setSlots(slots.filter((slot) => slot._id !== selectedSlot._id));
    }
    
    // Reset state and navigate to interviews page
    setSelectedSlot(null);
    setShowPayment(false);
    navigate('/interviews');
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setSelectedSlot(null);
    setShowPayment(false);
  };

  // Render star rating
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star filled">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star half-filled">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">
            ☆
          </span>
        ))}
        <span className="rating-value">
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      </div>
    );
  };

  // Render interviewer name with LinkedIn profile link if available
  const renderInterviewerName = (interviewer) => {
    // Check if LinkedIn URL exists and is a valid URL
    if (interviewer.linkedInUrl && isValidUrl(interviewer.linkedInUrl)) {
      return (
        <a
          href={interviewer.linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="interviewer-name-link"
          title="View LinkedIn Profile"
        >
          {interviewer.name}{" "}
          <img
            src="/linkedin-icon.png"
            alt="LinkedIn"
            className="linkedin-icon"
          />
        </a>
      );
    }
    return interviewer.name;
  };

  // Helper function to validate URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Group slots by date - using local date for display grouping
  const groupSlotsByDate = () => {
    const grouped = {};

    slots.forEach((slot) => {
      // Convert UTC to local date for grouping
      const slotDate = new Date(slot.startTime);
      // Format date as YYYY-MM-DD to use as a key for grouping
      const dateKey = slotDate.toISOString().split("T")[0];
      // Store the actual date object for display
      const displayDate = slotDate;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          slots: [],
          displayDate: displayDate,
        };
      }
      grouped[dateKey].slots.push(slot);
    });

    return grouped;
  };

  // If showing payment component, render it instead of the slots list
  if (showPayment && selectedSlot) {
    return (
      <div className="slots-container">
        <h2>Complete Payment to Book Slot</h2>
        <PreBookingPayment 
          slotId={selectedSlot._id} 
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  return (
    <div className="slots-container">
      <h2>Available Interview Slots</h2>

      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="dateFilter">Filter by Date:</label>
          <input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="interviewerFilter">Filter by Interviewer:</label>
          <select
            id="interviewerFilter"
            value={selectedInterviewer}
            onChange={(e) => setSelectedInterviewer(e.target.value)}
          >
            <option value="">All Interviewers</option>
            {interviewers.map((interviewer) => (
              <option key={interviewer.id} value={interviewer.id}>
                {interviewer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="typeFilter">Filter by Interview Type:</label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="DSA">DSA (40 minutes)</option>
            <option value="System Design">System Design (50 minutes)</option>
          </select>
        </div>

        {(dateFilter || selectedInterviewer || selectedType) && (
          <button
            className="btn-secondary"
            onClick={() => {
              setDateFilter("");
              setSelectedInterviewer("");
              setSelectedType("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading available slots...</div>
      ) : slots.length === 0 ? (
        <div className="no-slots">
          No available slots found. Please check back later or adjust your
          filters.
        </div>
      ) : (
        <div className="slots-by-date">
          {Object.entries(groupSlotsByDate()).map(([dateKey, groupData]) => (
            <div key={dateKey} className="date-group">
              <h3 className="date-header">
                {groupData.displayDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="slots-list">
                {groupData.slots.map((slot) => (
                  <div key={slot._id} className="slot-card available">
                    <div className="slot-time">
                      <div>
                        <strong>Start:</strong> {formatDate(slot.startTime, slot.timeZone)}
                      </div>
                      <div>
                        <strong>End:</strong> {formatDate(slot.endTime, slot.timeZone)}
                      </div>
                    </div>
                    <div className="slot-type" data-type={slot.interviewType}>
                      <strong>Interview:</strong> {slot.interviewType} (
                      {slot.interviewType === "DSA"
                        ? "40 minutes"
                        : "50 minutes"}
                      )
                    </div>

                    <div className="interviewer-info">
                      <strong>Interviewer:</strong>{" "}
                      {renderInterviewerName(slot.interviewer)}
                      {/* <div className="interviewer-rating">
                        {renderRating(
                          slot.interviewer.averageRating ||
                            interviewerRatings[slot.interviewer._id]
                              ?.averageRating ||
                            0
                        )}
                        <span className="rating-count">
                          {slot.interviewer.ratingsCount ||
                            interviewerRatings[slot.interviewer._id]?.count ||
                            0}{" "}
                          {(slot.interviewer.ratingsCount ||
                            interviewerRatings[slot.interviewer._id]?.count ||
                            0) === 1
                            ? "review"
                            : "reviews"}
                        </span>
                      </div> */}
                    </div>

                    <div className="slot-duration">
                      <strong>Duration:</strong>{" "}
                      {Math.round(
                        (new Date(slot.endTime) - new Date(slot.startTime)) /
                          (1000 * 60)
                      )}{" "}
                      minutes
                    </div>
                    <div className="slot-price">
                      <strong>Price:</strong>{" "}
                      {(() => {
                        const basePrice = slot.price;
                        return `${basePrice} ${slot.currency || "INR"}`;
                      })()}
                    </div>
                    {isCandidate && (
                      <button
                        className="btn-primary"
                        onClick={() => handleInitiateBooking(slot)}
                      >
                        Book & Pay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableSlots;
