import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './InterviewFeedback.css';

const InterviewFeedback = ({ 
  interview, 
  onClose, 
  onSubmitSuccess, 
  isEditing = false, 
  existingFeedback = null 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    codingAndDebugging: 5,
    communicationScore: 5,
    problemSolvingScore: 5,
    strengths: '',
    areasOfImprovement: '',
    additionalComments: ''
  });

  useEffect(() => {
    // If editing existing feedback, populate the form
    if (isEditing && existingFeedback) {
      setFeedbackForm({
        codingAndDebugging: existingFeedback.codingAndDebugging,
        communicationScore: existingFeedback.communicationScore,
        problemSolvingScore: existingFeedback.problemSolvingScore,
        strengths: existingFeedback.strengths,
        areasOfImprovement: existingFeedback.areasOfImprovement,
        additionalComments: existingFeedback.additionalComments || ''
      });
    }
  }, [isEditing, existingFeedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm({
      ...feedbackForm,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackForm.strengths || !feedbackForm.areasOfImprovement) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing feedback
        await axios.put(`/api/feedback/${existingFeedback._id}`, {
          ...feedbackForm
        });
        toast.success('Feedback updated successfully');
      } else {
        // Create new feedback
        await axios.post('/api/feedback', {
          interviewId: interview._id,
          ...feedbackForm
        });
        toast.success('Feedback submitted successfully');
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err.response?.data?.message || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h3>{isEditing ? 'Edit Interview Feedback' : 'Provide Interview Feedback'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="feedback-modal-body">
          <p>
            {isEditing 
              ? `Edit feedback for ${interview.candidate.name}'s interview` 
              : `Provide feedback for ${interview.candidate.name}'s interview`}
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Coding & Debugging (1-10)</label>
                <input
                  type="number"
                  name="codingAndDebugging"
                  value={feedbackForm.codingAndDebugging}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Communication (1-10)</label>
                <input
                  type="number"
                  name="communicationScore"
                  value={feedbackForm.communicationScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Problem Solving (1-10)</label>
                <input
                  type="number"
                  name="problemSolvingScore"
                  value={feedbackForm.problemSolvingScore}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Strengths *</label>
              <textarea
                name="strengths"
                value={feedbackForm.strengths}
                onChange={handleChange}
                placeholder="What did the candidate do well?"
                rows={3}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Areas of Improvement *</label>
              <textarea
                name="areasOfImprovement"
                value={feedbackForm.areasOfImprovement}
                onChange={handleChange}
                placeholder="What could the candidate improve on?"
                rows={3}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Additional Comments</label>
              <textarea
                name="additionalComments"
                value={feedbackForm.additionalComments}
                onChange={handleChange}
                placeholder="Any other feedback or comments?"
                rows={3}
              ></textarea>
            </div>
            
            <div className="feedback-modal-actions">
              <button 
                type="button"
                className="btn-secondary" 
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : (isEditing ? 'Update Feedback' : 'Submit Feedback')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedback;
