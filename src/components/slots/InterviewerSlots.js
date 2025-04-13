import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import './Slots.css';

const InterviewerSlots = () => {
  const { user, isInterviewer } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [recurringWeeks, setRecurringWeeks] = useState(4); // Default to 4 weeks

  const [interviewType, setInterviewType] = useState('DSA');
  const [dateFilter, setDateFilter] = useState('');

  // Format date for input fields
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Get current date for min attribute
  const currentDate = formatDateForInput(new Date());
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Load interviewer's slots
  const loadSlots = async () => {
    try {
      setLoading(true);
      let url = '/api/slots/interviewer';
      
      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        const nextDay = new Date(filterDate);
        nextDay.setDate(filterDate.getDate() + 1);
        
        url += `?startDate=${filterDate.toISOString()}&endDate=${nextDay.toISOString()}`;
      }
      
      const res = await axios.get(url);
      setSlots(res.data);
    } catch (err) {
      console.error('Error loading slots:', err);
      toast.error('Failed to load your slots');
    } finally {
      setLoading(false);
    }
  };

  // Load slots on component mount and when date filter changes
  useEffect(() => {
    if (isInterviewer) {
      loadSlots();
    }
  }, [isInterviewer, dateFilter]);


  

  
  // Handle slot creation
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    
    if (isRecurring) {
      if (!dayOfWeek || !startHour || !interviewType || !recurringWeeks) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      if (!startDate || !startHour || !interviewType) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    try {
      if (isRecurring) {
        // Create recurring slots
        const slots = [];
        const today = new Date();
        const dayOfWeekInt = parseInt(dayOfWeek);
        const hourInt = parseInt(startHour);
        
        // Find the next occurrence of the selected day of week
        let nextDate = new Date();
        const daysToAdd = (7 + dayOfWeekInt - nextDate.getDay()) % 7;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        nextDate.setHours(hourInt, 0, 0, 0);
        
        // If the calculated date is in the past, add 7 days
        if (nextDate < today) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        
        // Create slots for the specified number of weeks
        for (let i = 0; i < recurringWeeks; i++) {
          const slotDate = new Date(nextDate);
          slotDate.setDate(slotDate.getDate() + (i * 7));
          
          const endDate = new Date(slotDate);
          if (interviewType === 'DSA') {
            endDate.setMinutes(endDate.getMinutes() + 40);
          } else {
            endDate.setMinutes(endDate.getMinutes() + 50);
          }
          
          slots.push({
            start: slotDate.toISOString(),
            end: endDate.toISOString()
          });
        }
        
        // Create multiple slots
        const response = await axios.post('/api/slots/batch', {
          interviewType,
          slots
        });
        
        toast.success(`Created ${slots.length} recurring slots successfully`);
        setIsRecurring(false);
        setDayOfWeek('');
        setRecurringWeeks(4);
        setStartHour('');
        loadSlots();
        return;
      }
      
      // For single slot
      // Use a more reliable approach to create the date
      // First create a date string in ISO format
      const dateStr = `${startDate}T${startHour.padStart(2, '0')}:00:00`;
      
      // Create JavaScript Date objects
      const start = new Date(dateStr);
      const end = new Date(dateStr);
      
      // Validate the date
      if (isNaN(start.getTime())) {
        toast.error('Invalid date or time');
        return;
      }
      
      // Calculate end time based on interview type
      if (interviewType === 'DSA') {
        end.setMinutes(start.getMinutes() + 40);
      } else {
        end.setMinutes(start.getMinutes() + 50);
      }
      
      const res = await axios.post('/api/slots/interviewer', {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        interviewType
      });
      
      toast.success('Slot created successfully');
      setSlots([...slots, res.data.slot]);
      
      // Reset form
      setStartDate('');
      setStartHour('');
      setIsRecurring(false);
      setDayOfWeek('');
      setRecurringWeeks(4);
      
      // Reload slots to ensure we have the latest data
      loadSlots();
    } catch (err) {
      console.error('Error creating slot:', err);
      toast.error(err.response?.data?.message || 'Failed to create slot');
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/slots/interviewer/${slotId}`);
      toast.success('Slot deleted successfully');
      
      // Update local state
      setSlots(slots.filter(slot => slot._id !== slotId));
    } catch (err) {
      console.error('Error deleting slot:', err);
      toast.error(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  if (!isInterviewer) {
    return <div className="container">You must be an interviewer to access this page.</div>;
  }

  return (
    <div className="slots-container">
      <h2>Manage Your Interview Slots</h2>
      
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
                <option value="System Design">System Design (50 minutes)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="recurring">Slot Type</label>
              <select
                id="recurring"
                value={isRecurring ? "recurring" : "single"}
                onChange={(e) => setIsRecurring(e.target.value === "recurring")}
              >
                <option value="single">Single Slot</option>
                <option value="recurring">Recurring Weekly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {isRecurring ? (
              <div className="form-group">
                <label htmlFor="dayOfWeek">Day of Week</label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  required={isRecurring}
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
                  required={!isRecurring}
                  disabled={isRecurring}
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
                  const ampm = hour < 12 ? 'AM' : 'PM';
                  return (
                    <option key={hour} value={hour}>
                      {displayHour}:00 {ampm}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {isRecurring && (
              <div className="form-group">
                <label htmlFor="recurringWeeks">Number of Weeks</label>
                <select
                  id="recurringWeeks"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(parseInt(e.target.value))}
                  required={isRecurring}
                >
                  {[1, 2, 3, 4, 8, 12].map(weeks => (
                    <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? 'week' : 'weeks'}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group button-group">
              <button type="submit" className="btn-primary">Create Slot{isRecurring ? 's' : ''}</button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="slots-list-container">
        <h3>Your Slots</h3>
        
        <div className="filter-container">
          <label htmlFor="dateFilter">Filter by Date:</label>
          <input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button 
              className="btn-secondary" 
              onClick={() => setDateFilter('')}
            >
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
            {slots.map(slot => (
              <div key={slot._id} className={`slot-card ${slot.isBooked ? 'booked' : 'available'}`}>
                <div className="slot-time">
                  <div><strong>Start:</strong> {formatDate(slot.startTime)}</div>
                  <div><strong>End:</strong> {formatDate(slot.endTime)}</div>
                </div>
                <div className="slot-type" data-type={slot.interviewType}>
                  <strong>Type:</strong> {slot.interviewType} ({slot.interviewType === 'DSA' ? '40 minutes' : '50 minutes'})
                </div>
                <div className="slot-status">
                  Status: {slot.isBooked ? 'Booked' : 'Available'}
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
