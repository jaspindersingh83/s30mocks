import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useParams } from 'react-router-dom';

const CompletedInterviewDetails = () => {
  const { interviewId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewData, setInterviewData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch problem and solution
        const problemRes = await api.get(`/api/problems/interview/${interviewId}`);
        
        // Fetch feedback if available
        try {
          const feedbackRes = await api.get(`/api/feedback/interview/${interviewId}`);
          setFeedback(feedbackRes.data);
        } catch (feedbackErr) {
          console.log('No feedback available yet');
        }
        
        setInterviewData(problemRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching interview details');
        console.error('Error fetching interview details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewId]);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        {error}
        {error.includes('not yet completed') && (
          <p className="mt-2">
            The interview must be completed before you can view the problem solution and recording.
          </p>
        )}
      </div>
    );
  }

  if (!interviewData) {
    return <div className="alert alert-warning mt-4">No interview data available</div>;
  }

  const { interview, problem } = interviewData;

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const embedUrl = getYouTubeEmbedUrl(interview.recordingUrl);

  return (
    <div className="completed-interview-container">
      <h2>Completed Interview Details</h2>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Problem: {problem.title}</h3>
        </div>
        <div className="card-body">
          <div className="problem-metadata mb-3">
            <span className={`badge bg-${problem.difficulty === 'easy' ? 'success' : problem.difficulty === 'medium' ? 'warning' : 'danger'}`}>
              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </span>
            <span className="badge bg-info ms-2">{problem.category}</span>
          </div>
          
          <h4>Problem Description</h4>
          <div className="card mb-4">
            <div className="card-body">
              <pre className="problem-text">{problem.description}</pre>
            </div>
          </div>
          
          <h4>Solution</h4>
          <div className="solution-container mb-4">
            <a 
              href={problem.solutionUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-success"
            >
              View Solution
            </a>
          </div>
          
          <h4>Interview Recording</h4>
          {embedUrl ? (
            <div className="ratio ratio-16x9 mb-3">
              <iframe 
                src={embedUrl} 
                title="Interview Recording" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="alert alert-warning">
              Recording not available or invalid URL format
            </div>
          )}
        </div>
      </div>
      
      {feedback && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white">
            <h3 className="mb-0">Feedback</h3>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h5>Coding & Debugging</h5>
                    <div className="display-4">{feedback.codingAndDebugging}/10</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h5>Communication</h5>
                    <div className="display-4">{feedback.communicationScore}/10</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h5>Problem Solving</h5>
                    <div className="display-4">{feedback.problemSolvingScore}/10</div>
                  </div>
                </div>
              </div>
            </div>
            
            <h5>Strengths</h5>
            <p>{feedback.strengths}</p>
            
            <h5>Areas of Improvement</h5>
            <p>{feedback.areasOfImprovement}</p>
            
            {feedback.additionalComments && (
              <>
                <h5>Additional Comments</h5>
                <p>{feedback.additionalComments}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedInterviewDetails;
