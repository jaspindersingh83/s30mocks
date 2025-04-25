import React, { useState } from 'react';
import api from '../api';

const RecordingUpload = ({ interviewId, onRecordingUploaded }) => {
  const [recordingUrl, setRecordingUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recordingUrl) {
      setError('Please enter a YouTube URL for the recording');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await axios.put(`/api/problems/recording/${interviewId}`, {
        recordingUrl
      });
      
      setSuccess('Recording URL uploaded successfully');
      setRecordingUrl('');
      
      if (onRecordingUploaded) {
        onRecordingUploaded(res.data.interview);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading recording URL');
      console.error('Error uploading recording URL:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recording-upload-container">
      <h3>Upload Interview Recording</h3>
      <p>
        Once the interview is complete, please upload the YouTube URL of the recording.
        The candidate will be able to access this recording after the interview.
      </p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="recordingUrl" className="form-label">YouTube URL</label>
          <input
            type="url"
            className="form-control"
            id="recordingUrl"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Recording URL'}
        </button>
      </form>
    </div>
  );
};

export default RecordingUpload;
