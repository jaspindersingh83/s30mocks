import React from 'react';
import './InterviewFeedback.css';

const FeedbackDetails = ({ feedback, onClose }) => {
  if (!feedback) return null;

  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h3>Interview Feedback</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="feedback-modal-body">
          <div className="feedback-scores">
            <div className="feedback-score-item">
              <h4>Coding & Debugging</h4>
              <div className="score-display">{feedback.codingAndDebugging}/10</div>
            </div>
            <div className="feedback-score-item">
              <h4>Communication</h4>
              <div className="score-display">{feedback.communicationScore}/10</div>
            </div>
            <div className="feedback-score-item">
              <h4>Problem Solving</h4>
              <div className="score-display">{feedback.problemSolvingScore}/10</div>
            </div>
          </div>
          
          <div className="feedback-section">
            <h4>Strengths</h4>
            <p>{feedback.strengths}</p>
          </div>
          
          <div className="feedback-section">
            <h4>Areas of Improvement</h4>
            <p>{feedback.areasOfImprovement}</p>
          </div>
          
          {feedback.additionalComments && (
            <div className="feedback-section">
              <h4>Additional Comments</h4>
              <p>{feedback.additionalComments}</p>
            </div>
          )}
          
          <div className="feedback-modal-actions">
            <button 
              className="btn-primary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetails;
