import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';
import { DateTime } from 'luxon';
import AuthContext from '../context/AuthContext';
import InterviewFeedback from '../components/feedback/InterviewFeedback';
import FeedbackDetails from '../components/feedback/FeedbackDetails';
import InterviewRating from '../components/feedback/InterviewRating';
import './Interviews.css';

const Interviews = () => {
  const { user, isCandidate, isInterviewer } = useContext(AuthContext);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [ratingInterview, setRatingInterview] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  // Removed feedbackStatus state as we're using interview.status directly
  const [feedbackDetails, setFeedbackDetails] = useState({});
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [updatingMeeting, setUpdatingMeeting] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  
  // Use location from react-router to detect URL changes
  const location = useLocation();

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      // Get status from URL query parameter using the location hook
      const urlParams = new URLSearchParams(location.search);
      const statusFilter = urlParams.get('status');
      
      // Get interviews from API with status filter if specified
      let url = '/api/interviews';
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await api.get(url);

      
      // Filter out cancelled interviews if they're somehow included
      const filteredInterviews = response.data.filter(interview => interview.status !== 'cancelled');
      setInterviews(filteredInterviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
      setLoading(false);
    }
  };
  
  const checkPaymentStatus = async () => {
    const statusMap = {};
    
    for (const interview of interviews) {
      try {

        const response = await api.get(`/api/payments/interview/${interview._id}`);
        
        // The server now returns an object with status even if no payment exists
        statusMap[interview._id] = response.data.status || 'pending';
        

      } catch (error) {
        console.error(`Error checking payment for interview ${interview._id}:`, error.message);
        // Default to pending if there's an error
        statusMap[interview._id] = 'pending';
      }
    }
    

    setPaymentStatus(statusMap);
  };

  useEffect(() => {

    fetchInterviews();

  }, [location.search]); // Re-run when URL search params change
  
  // Check payment status for each interview
  useEffect(() => {
    if (interviews.length > 0 && isCandidate) {
      checkPaymentStatus();
    }
  }, [interviews, isCandidate]);
  
  // Removed fetchFeedbackStatus function as we're using interview.status directly
  
  // Check feedback status for interviews
  // Removed fetchFeedbackStatus effect as we're using interview.status directly
  
  // Monitor interviews and their statuses
  useEffect(() => {
    if (interviews.length > 0) {
      // Interviews data is loaded and ready
    }
  }, [interviews, paymentStatus]);
  
  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview? This action cannot be undone.')) {
      return;
    }
    
    try {
      setCancelling(true);
      await api.put(`/api/interviews/${interviewId}/cancel`);
      toast.success('Interview cancelled successfully');
      
      // Update the interviews list
      fetchInterviews();
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel interview');
    } finally {
      setCancelling(false);
    }
  };
  
  // Handle starting an interview session
  const handleStartInterview = async (interview) => {
    try {
      setStartingInterview(interview._id);
      
      // Check if meeting details already exist
      if (interview.meetingLink) {
        // If meeting details exist, update interview status to 'in-progress'
        await api.put(`/api/interviews/${interview._id}/status`, { status: 'in-progress' });
        
        // Open meeting link in a new tab
        window.open(interview.meetingLink, '_blank');
        
        // Refresh the interviews list
        fetchInterviews();
        toast.success('Interview started successfully!');
      } else {
        // If no meeting details, prompt to add them first
        setEditingMeeting(interview);
        toast.info('Please add meeting details before starting the interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    } finally {
      setStartingInterview(false);
    }
  };

  // Determine meeting platform based on link
  const getMeetingPlatform = (link) => {
    if (!link) return null;
    
    if (link.includes('meet.google.com')) {
      return 'google';
    } else if (link.includes('zoom.us')) {
      return 'zoom';
    } else {
      return 'other';
    }
  };

  const handleViewDetails = (interviewId) => {
    // Redirect to interview details page or show details in a modal
    // For now, we'll just show a toast
    toast.info('Interview details feature coming soon!');
  };
  
  const handleViewFeedback = (interviewId) => {
    // Always fetch the latest feedback
    api.get(`/api/feedback/interview/${interviewId}`)
      .then(res => {
        // Store the feedback details for future reference
        const updatedDetails = { ...feedbackDetails };
        updatedDetails[interviewId] = res.data;
        setFeedbackDetails(updatedDetails);
        
        // Set the viewing feedback
        setViewingFeedback(res.data);
      })
      .catch(err => {
        console.error('Error fetching feedback:', err);
        toast.error('Error fetching feedback details');
      });
  };
  
  const handleProvideFeedback = (interview) => {
    setFeedbackInterview(interview);
  };
  
  const handleEditFeedback = (interview) => {
    // Fetch the existing feedback for this interview
    api.get(`/api/feedback/interview/${interview._id}`)
      .then(res => {
        if (res.data) {
          setEditingFeedback({
            interview,
            feedback: res.data
          });
        } else {
          toast.error('Feedback not found');
        }
      })
      .catch(err => {
        console.error('Error fetching feedback:', err);
        toast.error('Error fetching feedback details');
      });
  };
  
  const handleFeedbackSuccess = () => {
    // Refresh interviews after feedback submission/update
    fetchInterviews();
  };
  
  const handleOpenRatingModal = (interview) => {
    setRatingInterview(interview);
  };

  const handleEditMeeting = (interview) => {
    setEditingMeeting(interview._id);
    setMeetingLink(interview.meetingLink || '');
    setMeetingPassword(interview.meetingPassword || '');
  };

  const handleUpdateMeeting = async (interviewId) => {
    try {
      setUpdatingMeeting(true);
      const response = await api.put(`/api/interviews/${interviewId}/meeting`, {
        meetingLink
      });
      
      // Check if notification was sent to the candidate
      if (response.data.notificationSent) {
        toast.success('Meeting link updated successfully. Candidate has been notified.');
      } else {
        toast.success('Meeting link updated successfully');
      }
      
      fetchInterviews();
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error updating meeting link:', error);
      toast.error('Failed to update meeting link');
    } finally {
      setUpdatingMeeting(false);
    }
  };
  


  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      // Get the interview timezone if available, otherwise use browser's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Format using Luxon with clear timezone indicator (Option 1)
      return DateTime.fromISO(dateString)
        .setZone(timezone)
        .toFormat("EEEE, MMMM d, yyyy 'at' h:mm a (z)");
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'badge-primary';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  if (loading && interviews.length === 0) {
    return <div className="loading">Loading interviews...</div>;
  }

  // Check if user has any pending payments
  // Check if there are any completed interviews with pending status
  const hasPendingCompletedInterviews = isCandidate && interviews.some(
    interview => interview.status === 'completed' && paymentStatus[interview._id] === 'pending'
  );

  return (
    <div className="interviews-container">
      <h2>Your Interviews</h2>
      
      {/* Warning banner for pending completed interviews */}
      {hasPendingCompletedInterviews && (
        <div className="payment-warning-banner" id="payment-section">
          <div className="warning-icon">⚠️</div>
          <div className="warning-message">
            <h3>Payment Required</h3>
            <p>You have pending payments for completed interviews. Please make the payments to book new interviews.</p>
          </div>
        </div>
      )}
      
      <div className="interview-filters">
        <select 
          onChange={(e) => {
            const urlParams = new URLSearchParams(window.location.search);
            if (e.target.value === 'all') {
              urlParams.delete('status');
            } else {
              urlParams.set('status', e.target.value);
            }
            window.location.href = `/interviews${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
          }}
          value={location.search ? new URLSearchParams(location.search).get('status') || 'all' : 'all'}
        >
          <option value="all">All Interviews</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {interviews.length === 0 ? (
        <div className="no-interviews">
          <p>You don't have any interviews yet.</p>
          {isCandidate && (
            <p>
              Visit the <a href="/slots/available">Available Slots</a> page to book an interview.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="interviews-table-container">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>{isCandidate ? 'Interviewer' : 'Candidate'}</th>
                  <th>Type</th>
                  <th>Scheduled For</th>
                  <th>Duration</th>
                  <th>Status</th>
                  {isCandidate && <th>Payment Status</th>}
                  {isCandidate && <th>Feedback Status</th>}
                  <th>Meeting Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {interviews.map((interview) => (
                <tr key={interview._id} className={interview.status === 'scheduled' ? 'scheduled-row' : 'completed-row'}>
                  <td>
                    <div className="user-info">
                      {isCandidate 
                        ? interview.interviewer.name
                        : interview.candidate.name}
                      {isCandidate && interview.interviewer.linkedInUrl && (
                        <a 
                          href={interview.interviewer.linkedInUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="linkedin-icon"
                          title="View LinkedIn Profile"
                        >
                          <i className="fab fa-linkedin"></i>
                        </a>
                      )}
                      {isInterviewer && interview.candidate.linkedInUrl && (
                        <a 
                          href={interview.candidate.linkedInUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="linkedin-icon"
                          title="View LinkedIn Profile"
                        >
                          <i className="fab fa-linkedin"></i>
                        </a>
                      )}
                    </div>
                  </td>
                  <td>{interview.interviewType}</td>
                  <td>{formatDate(interview.scheduledDate)}</td>
                  <td>{interview.duration} minutes</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(interview.status)}`}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </td>
                  {isCandidate && (
                    <td>
                      {paymentStatus[interview._id] === 'pending' && (
                        <span className="payment-badge payment-pending">Pending</span>
                      )}
                      {paymentStatus[interview._id] === 'submitted' && (
                        <span className="payment-badge payment-submitted">Submitted</span>
                      )}
                      {paymentStatus[interview._id] === 'verified' && (
                        <span className="payment-badge payment-verified">Verified</span>
                      )}
                      {paymentStatus[interview._id] === 'rejected' && (
                        <span className="payment-badge payment-rejected">Rejected</span>
                      )}
                      {paymentStatus[interview._id] === 'refunded' && (
                        <span className="payment-badge payment-refunded">Refunded</span>
                      )}
                    </td>
                  )}
                  {isCandidate && (
                    <td>
                      {interview.status === 'scheduled' && (
                        <span className="feedback-badge feedback-pending">Pending</span>
                      )}
                      {interview.status === 'in-progress' && (
                        <span className="feedback-badge feedback-in-progress">In Progress</span>
                      )}
                      {interview.status === 'completed' && (
                        <span 
                          className="feedback-badge feedback-provided"
                          onClick={() => handleViewFeedback(interview._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          View Feedback
                        </span>
                      )}
                    </td>
                  )}
                  <td>
                    {isCandidate && interview.status === 'scheduled' && (
                      <>
                        {interview.meetingLink ? (
                          <div className="meeting-info">
                            <div className="meeting-link-container">
                              {getMeetingPlatform(interview.meetingLink) === 'google' && (
                                <span className="meeting-icon google-meet">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="#4285F4" d="M22 11v2h-2v-2h2zm-4 0v2h-3v3h-2v-3h-3v-2h3V8h2v3h3zm-13 5v-2H3v-2h2V9H3V7h4v9H5zm17.3-6.2l.7-1.7-1.7-.7-.7 1.7 1.7.7zm-16.9.7L4.7 9l-1.7.7.7 1.7 1.7-.7z"/>
                                  </svg>
                                </span>
                              )}
                              {getMeetingPlatform(interview.meetingLink) === 'zoom' && (
                                <span className="meeting-icon zoom">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="#2D8CFF" d="M16 7h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3v-2h2V9h-2V7zm-5 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm-5-5v2H4v2H2V9h2v2h2V9h2v2h-2z"/>
                                  </svg>
                                </span>
                              )}
                              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                                {interview.meetingLink.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="no-meeting">Meeting link will be provided by the interviewer</span>
                        )}
                      </>
                    )}
                    
                    {isInterviewer && interview.status === 'scheduled' && (
                      <>
                        {editingMeeting === interview._id ? (
                          <div className="meeting-edit-form">
                            <div className="form-group">
                              <input
                                type="text"
                                placeholder="Meeting Link"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                className="meeting-input"
                              />
                              <small className="form-text text-muted">
                                Updating this link will automatically notify the candidate via email.
                              </small>
                            </div>

                            <div className="form-actions">
                              <button
                                className="btn-primary"
                                onClick={() => handleUpdateMeeting(interview._id)}
                                disabled={updatingMeeting}
                              >
                                {updatingMeeting ? 'Saving...' : 'Save & Notify Candidate'}
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => setEditingMeeting(null)}
                                disabled={updatingMeeting}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="meeting-info">
                            {interview.meetingLink ? (
                              <div className="meeting-link-wrapper">
                                <div className="meeting-link-display">
                                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                                    {getMeetingPlatform(interview.meetingLink) === 'google' && (
                                      <span className="meeting-icon google-meet">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                          <path fill="#4285F4" d="M22 11v2h-2v-2h2zm-4 0v2h-3v3h-2v-3h-3v-2h3V8h2v3h3zm-13 5v-2H3v-2h2V9H3V7h4v9H5zm17.3-6.2l.7-1.7-1.7-.7-.7 1.7 1.7.7zm-16.9.7L4.7 9l-1.7.7.7 1.7 1.7-.7z"/>
                                        </svg>
                                      </span>
                                    )}
                                    {getMeetingPlatform(interview.meetingLink) === 'zoom' && (
                                      <span className="meeting-icon zoom">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                          <path fill="#2D8CFF" d="M16 7h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3v-2h2V9h-2V7zm-5 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm-5-5v2H4v2H2V9h2v2h2V9h2v2h-2z"/>
                                        </svg>
                                      </span>
                                    )}
                                    {getMeetingPlatform(interview.meetingLink) === 'other' && (
                                      <span className="meeting-icon other">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                          <path fill="#555" d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"/>
                                        </svg>
                                      </span>
                                    )}
                                    {interview.meetingLink.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                                <div className="meeting-actions">
                                  <button
                                    className="btn-warning btn-sm"
                                    onClick={() => handleEditMeeting(interview)}
                                    title="Update meeting link if technical issues occur"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Update Link
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="btn-primary"
                                onClick={() => handleEditMeeting(interview)}
                              >
                                Add Meeting Details
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  
                  <td className="interview-actions">
                    {interview.status === 'scheduled' && (
                      <div className="action-buttons">
                        {isCandidate && (
                          <>
                            <button 
                              className="btn-danger" 
                              onClick={() => handleCancelInterview(interview._id)}
                              disabled={cancelling}
                            >
                              {cancelling ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </>
                        )}
                        {isInterviewer && (
                          <button 
                            className="btn-primary" 
                            onClick={() => handleStartInterview(interview)}
                            disabled={startingInterview === interview._id}
                          >
                            {startingInterview === interview._id ? 'Starting...' : 'Start'}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {(interview.status === 'completed' || interview.status === 'in-progress') && (
                      <div className="action-buttons">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleViewDetails(interview._id)}
                        >
                          Details
                        </button>
                        {isInterviewer && (
                          <>
                            {interview.status === 'in-progress' ? (
                              <button 
                                className="btn-primary"
                                onClick={() => handleProvideFeedback(interview)}
                                style={{ marginLeft: '8px' }}
                              >
                                Provide Feedback
                              </button>
                            ) : interview.status === 'completed' ? (
                              <button 
                                className="btn-secondary"
                                onClick={() => handleEditFeedback(interview)}
                                style={{ marginLeft: '8px' }}
                              >
                                Edit Feedback
                              </button>
                            ) : null}
                          </>
                        )}
                        {isCandidate && (
                          <>
                            <button 
                              className="btn-primary"
                              onClick={() => handleOpenRatingModal(interview)}
                              style={{ marginLeft: '8px' }}
                            >
                              Rate
                            </button>
                            
                            {/* Show payment button for pending completed interviews */}
                            {paymentStatus[interview._id] === 'pending' && (
                              <button 
                                onClick={() => window.location.href = `/payments/${interview._id}`}
                                className="btn-primary"
                                style={{ marginLeft: '8px' }}
                                title="Pay for this completed interview"
                              >
                                Pay
                              </button>
                            )}
                          </>                          
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    
      {/* View Feedback Modal for Candidates */}
      {viewingFeedback && (
        <FeedbackDetails 
          feedback={viewingFeedback} 
          onClose={() => setViewingFeedback(null)} 
        />
      )}
      
      {/* Feedback Modal for Interviewers */}
      {feedbackInterview && (
        <InterviewFeedback 
          interview={feedbackInterview} 
          onClose={() => setFeedbackInterview(null)} 
          onSubmitSuccess={handleFeedbackSuccess} 
        />
      )}
      
      {/* Edit Feedback Modal for Interviewers */}
      {editingFeedback && (
        <InterviewFeedback 
          interview={editingFeedback.interview} 
          onClose={() => setEditingFeedback(null)} 
          onSubmitSuccess={handleFeedbackSuccess} 
          isEditing={true} 
          existingFeedback={editingFeedback.feedback} 
        />
      )}
      
      {/* Rating Modal */}
      {ratingInterview && (
        <InterviewRating 
          interview={ratingInterview} 
          onClose={() => setRatingInterview(null)} 
          onSubmitSuccess={fetchInterviews} 
        />
      )}
    </div>
  );
};

export default Interviews;
