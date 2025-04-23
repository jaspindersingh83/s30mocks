import React, { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './InterviewFeedback.css';

const InterviewRating = ({ interview, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.post('/api/ratings', {
        interviewId: interview._id,
        rating,
        feedback
      });
      
      toast.success('Rating submitted successfully');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error(err.response?.data?.message || 'Error submitting rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h3>Rate Your Interview</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="feedback-modal-body">
          <p>How would you rate your interview with {interview.interviewer.name}?</p>
          
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={`star ${rating >= star ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          
          <div className="form-group">
            <label htmlFor="feedback">Feedback (optional)</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this interviewer..."
              maxLength={500}
              rows={4}
            ></textarea>
          </div>
          
          <div className="feedback-modal-actions">
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSubmitRating}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRating;
