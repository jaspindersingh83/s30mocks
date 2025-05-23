import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { DateTime } from "luxon";
import AuthContext from "../../context/AuthContext";
import "./Slots.css";

const InterviewerSlots = () => {
  const { user, isInterviewer } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [isRecurring, setIsRecurring] = useState(true); // Always true now as we're using the same logic
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [recurringWeeks, setRecurringWeeks] = useState(2); // Default to 2 weeks
  const [defaultMeetingLink, setDefaultMeetingLink] = useState("");
  const [showMeetingLinkForm, setShowMeetingLinkForm] = useState(false);

  const [interviewTypeFilter, setInterviewTypeFilter] = useState(""); // Empty string to show all types by default
  const [interviewType, setInterviewType] = useState("DSA"); // Default to DSA for creating new slots
  const [dateFilter, setDateFilter] = useState("");

  // Format date for input fields
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get current date for min attribute
  const currentDate = formatDateForInput(new Date());

  // Format date for display - Converts from UTC to local timezone with clear timezone indicator
  const formatDate = (dateString) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return DateTime.fromISO(dateString)
      .setZone(timezone)
      .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a (z)");
  };

  // Convert local datetime to UTC for sending to server using Luxon
  const convertToUTC = (date, timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date(date);
    localDate.setHours(hours, minutes, 0, 0);
    return localDate.toISOString();
  };

  // Load interviewer's slots
  const loadSlots = async () => {
    try {
      setLoading(true);
      let url = "/api/slots/interviewer";

      // Add query parameters if filters are set
      const params = [];

      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        const nextDay = new Date(filterDate);
        nextDay.setDate(filterDate.getDate() + 1);

        params.push(`startDate=${filterDate.toISOString()}`);
        params.push(`endDate=${nextDay.toISOString()}`);
      }

      if (interviewTypeFilter) {
        params.push(`interviewType=${interviewTypeFilter}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await api.get(url);
      setSlots(res.data);
    } catch (err) {
      console.error("Error loading slots:", err);
      toast.error("Failed to load your slots");
    } finally {
      setLoading(false);
    }
  };

  // Load slots on component mount and when date filter changes
  useEffect(() => {
    if (isInterviewer) {
      loadSlots();
      loadUserProfile();
    }
  }, [isInterviewer, dateFilter, interviewTypeFilter]);

  // Load user profile to get default meeting link
  const loadUserProfile = async () => {
    try {
      const res = await api.get("/api/users/me");
      if (res.data.defaultMeetingLink) {
        setDefaultMeetingLink(res.data.defaultMeetingLink);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      toast.error("Failed to load your profile settings");
    }
  };

  // Handle meeting link update
  const handleMeetingLinkUpdate = async (e) => {
    e.preventDefault();

    // Validate meeting link
    if (!defaultMeetingLink) {
      toast.error("Please enter a meeting link");
      return;
    }

    // Validate URL format
    try {
      new URL(defaultMeetingLink);
    } catch (err) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      await api.put("/api/users/profile", { defaultMeetingLink });
      toast.success("Default meeting link updated successfully");
      setShowMeetingLinkForm(false);
    } catch (err) {
      console.error("Error updating meeting link:", err);
      toast.error(
        err.response?.data?.message || "Failed to update meeting link"
      );
    }
  };

  // Handle slot creation
  const handleCreateSlot = async (e) => {
    e.preventDefault();

    // Validate form fields based on slot type
    if (isRecurring) {
      if (!dayOfWeek || !startHour || !interviewType || !recurringWeeks) {
        toast.error("Please fill in all required fields for recurring slot");
        return;
      }
    } else {
      // Single slot validation
      if (!startDate || !startHour || !interviewType) {
        toast.error("Please fill in all required fields for single slot");
        return;
      }
    }

    try {
      // Get interviewer's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = DateTime.now().setZone(timezone);
      const hourInt = parseInt(startHour);

      if (isNaN(hourInt) || hourInt < 0 || hourInt > 23) {
        toast.error("Please select a valid hour");
        return;
      }
      
      if (isRecurring) {
        // RECURRING SLOTS LOGIC
        const slots = [];
        const dayOfWeekInt = parseInt(dayOfWeek);
        
        // Find the next occurrence of the selected day
        // Luxon uses 1-7 for days (Monday-Sunday), but our UI uses 0-6 (Sunday-Saturday)
        // Convert 0 (Sunday) to 7 for Luxon
        const luxonDayOfWeek = dayOfWeekInt === 0 ? 7 : dayOfWeekInt;
        
        // Get the current day in the interviewer's timezone
        const currentDay = now.weekday;
        
        // Create a date object for the selected day of the week
        // We'll start by finding the next occurrence of this day
        let targetDate;
        
        if (luxonDayOfWeek === currentDay) {
          // If the selected day is today, use today's date but check if the hour has passed
          if (now.hour >= hourInt) {
            // If the hour has passed, schedule for next week
            targetDate = now.plus({ weeks: 1 });
          } else {
            // Otherwise use today
            targetDate = now;
          }
        } else if (luxonDayOfWeek > currentDay) {
          // If the selected day is later this week
          const daysToAdd = luxonDayOfWeek - currentDay;
          targetDate = now.plus({ days: daysToAdd });
        } else {
          // If the selected day is earlier in the week, go to next week
          const daysToAdd = 7 - (currentDay - luxonDayOfWeek);
          targetDate = now.plus({ days: daysToAdd });
        }
        
        // Create the date for the first slot with the correct day and hour
        let slotDate = targetDate.set({ 
          hour: hourInt, 
          minute: 0, 
          second: 0, 
          millisecond: 0 
        });
        
        // Check if the first slot is at least 24 hours in the future
        const minAllowedTime = now.plus({ hours: 24 });
        if (slotDate < minAllowedTime) {
          toast.error("Slots must be at least 24 hours in the future");
          return;
        }
        
        // Create slots for the specified number of weeks
        for (let i = 0; i < recurringWeeks; i++) {
          const startTime = slotDate.plus({ weeks: i });
          
          // Calculate end time based on interview type
          const duration = interviewType === "DSA" ? 40 : 50;
          const endTime = startTime.plus({ minutes: duration });
          
          // Store in UTC
          slots.push({
            start: startTime.toUTC().toISO(),
            end: endTime.toUTC().toISO(),
            timeZone: timezone
          });
        }

        // Create multiple slots
        await api.post("/api/slots/batch", {
          interviewType,
          slots,
        });

        toast.success(`Created ${slots.length} recurring slots successfully`);
        setDayOfWeek("");
        setRecurringWeeks(2);
        setStartHour("");
        loadSlots();
        return;
      } else {
        // SINGLE SLOT LOGIC
        // If a specific date was selected, use that date with the selected hour
        const localDate = new Date(startDate);
        localDate.setHours(hourInt, 0, 0, 0);
        
        // Convert to Luxon DateTime
        let slotDate = DateTime.fromJSDate(localDate).setZone(timezone);
        
        // Ensure it's at least 24 hours in the future
        const minAllowedTime = now.plus({ hours: 24 });
        if (slotDate < minAllowedTime) {
          toast.error("Slots must be at least 24 hours in the future");
          return;
        }
        
        // Calculate end time based on interview type
        const duration = interviewType === "DSA" ? 40 : 50;
        const endTime = slotDate.plus({ minutes: duration });
        
        // Create a single slot
        const slot = {
          start: slotDate.toUTC().toISO(),
          end: endTime.toUTC().toISO(),
          timeZone: timezone
        };

        // Use the same batch endpoint but with a single slot
        await api.post("/api/slots/batch", {
          interviewType,
          slots: [slot],
        });

        toast.success("Single slot created successfully");
        setStartDate(currentDate);
        setStartHour("");
        loadSlots();
        return;
      }
      
      // This code should never be reached due to the if/else structure above
      // Both branches have return statements
    } catch (err) {
      console.error("Error creating slot:", err);
      toast.error(err.response?.data?.message || "Failed to create slot");
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    try {
      await api.delete(`/api/slots/interviewer/${slotId}`);
      toast.success("Slot deleted successfully");

      // Update local state
      setSlots(slots.filter((slot) => slot._id !== slotId));
    } catch (err) {
      console.error("Error deleting slot:", err);
      toast.error(err.response?.data?.message || "Failed to delete slot");
    }
  };

  if (!isInterviewer) {
    return (
      <div className="container">
        You must be an interviewer to access this page.
      </div>
    );
  }

  return (
    <div className="slots-container">
      <h2>Manage Your Interview Slots</h2>

      <div className="interviewer-meeting-container">
        <div className="meeting-link-header">
         <h3>Default Meeting Link</h3> 
          <button
            type="button"
            className="btn-link"
            onClick={() => setShowMeetingLinkForm(!showMeetingLinkForm)}
          >
            {showMeetingLinkForm
              ? "Cancel"
              : defaultMeetingLink
              ? "Edit"
              : "Set Up"}
          </button>
        </div>

        {showMeetingLinkForm ? (
          <form
            onSubmit={handleMeetingLinkUpdate}
            className="meeting-link-form"
          >
            <div className="form-group">
              <label htmlFor="defaultMeetingLink">Meeting Link</label>
              <input
                type="url"
                id="defaultMeetingLink"
                value={defaultMeetingLink}
                onChange={(e) => setDefaultMeetingLink(e.target.value)}
                placeholder="Enter your default meeting link (e.g., Google Meet, Zoom)"
                required
              />
              <p className="form-help-text">
                This link will be used for all your interviews unless manually
                changed
              </p>
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <button type="submit" className="btn-primary">
                Save Meeting Link
              </button>
            </div>
          </form>
        ) : defaultMeetingLink ? (
          <div className="current-meeting-link">
            <p>
              <strong>Your current meeting link:</strong>
            </p>
            <a
              href={defaultMeetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="meeting-link"
            >
              {defaultMeetingLink}
            </a>
            <p className="meeting-link-info">
              This link will be automatically used when candidates book
              interviews with you.
            </p>
          </div>
        ) : (
          <div className="no-meeting-link-message">
            <p>You haven't set up a default meeting link yet.</p>
            <p>Setting up a default link will automatically use it for all your interviews.</p>
          </div>
        )}
      </div>

      <div className="slot-form-container">
        <h3>Create New Slot</h3>
        <form onSubmit={handleCreateSlot} className="slot-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interviewType">Interview Type</label>
              <select
                id="interviewType"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                required
              >
                <option value="DSA">DSA (40 minutes)</option>
                <option value="System Design">
                  System Design (50 minutes)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="slotType">Slot Type</label>
              <select
                id="slotType"
                value={startDate ? "specific" : "weekly"}
                onChange={(e) => {
                  if (e.target.value === "specific") {
                    setIsRecurring(false); // Set to single slot mode
                    setDayOfWeek(""); // Clear day of week when using specific date
                    setStartDate(currentDate); // Set to current date
                  } else {
                    setIsRecurring(true); // Set to recurring slot mode
                    setStartDate(""); // Clear specific date when using day of week
                    setDayOfWeek("1"); // Default to Monday
                  }
                }}
              >
                <option value="specific">Single Slot</option>
                <option value="weekly">Recurring</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {!startDate ? (
              <div className="form-group">
                <label htmlFor="dayOfWeek">Day of Week</label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  required={!startDate}
                >
                  <option value="">Select day</option>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="startDate">Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={currentDate}
                  required={!!startDate}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="startHour">Hour</label>
              <select
                id="startHour"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                required
              >
                <option value="">Select hour</option>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  const ampm = hour < 12 ? "AM" : "PM";
                  return (
                    <option key={hour} value={hour}>
                      {displayHour}:00 {ampm}
                    </option>
                  );
                })}
              </select>
            </div>

            {!startDate && (
              <div className="form-group">
                <label htmlFor="recurringWeeks">Number of Weeks</label>
                <select
                  id="recurringWeeks"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(parseInt(e.target.value))}
                  required={!startDate}
                >
                  {[1, 2, 3, 4, 8, 12].map((weeks) => (
                    <option key={weeks} value={weeks}>
                      {weeks} {weeks === 1 ? "week" : "weeks"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group button-group">
              <button type="submit" className="btn-primary">
                Create Slot{isRecurring ? "s" : ""}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="slots-list-container">
        <h3>Your Slots</h3>

        <div className="filter-container">
          <div className="form-group">
            <label htmlFor="dateFilter">Filter by Date:</label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="typeFilter">Filter by Type:</label>
            <select
              id="typeFilter"
              value={interviewTypeFilter}
              onChange={(e) => setInterviewTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="DSA">DSA</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
          
          {(dateFilter || interviewTypeFilter) && (
            <button className="btn-secondary" onClick={() => {
              setDateFilter("");
              setInterviewTypeFilter("");
            }}>
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="no-slots">
            No slots available. Create some slots to get started.
          </div>
        ) : (
          <div className="slots-list">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`slot-card ${
                  slot.isBooked ? "booked" : "available"
                }`}
              >
                <div className="slot-time">
                  <div>
                    <strong>Start:</strong> {formatDate(slot.startTime)}
                  </div>
                  <div>
                    <strong>End:</strong> {formatDate(slot.endTime)}
                  </div>
                </div>
                <div className="slot-type" data-type={slot.interviewType}>
                  <strong>Type:</strong> {slot.interviewType} (
                  {slot.interviewType === "DSA" ? "40 minutes" : "50 minutes"})
                </div>
                <div className="slot-status">
                  Status: {slot.isBooked ? "Booked" : "Available"}
                </div>
                {slot.isBooked && slot.interview && (
                  <div className="interview-info">
                    <div>Interview ID: {slot.interview._id}</div>
                    <div>Status: {slot.interview.status}</div>
                  </div>
                )}
                {!slot.isBooked && (
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteSlot(slot._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerSlots;
