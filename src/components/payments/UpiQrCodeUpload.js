import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './UpiQrCodeUpload.css';

const UpiQrCodeUpload = () => {
  const { user } = useContext(AuthContext);
  const [upiId, setUpiId] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentQrCode, setCurrentQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch current QR code if exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('/api/users/me');
        console.log('User profile data:', res.data);
        if (res.data.upiId) {
          setUpiId(res.data.upiId);
        }
        if (res.data.qrCodeUrl) {
          setCurrentQrCode(res.data.qrCodeUrl);
        }
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
        setMessage({
          text: 'Failed to load your UPI setup. Please try again later.',
          type: 'error'
        });
      }
    };

    fetchUserProfile();
  }, []);
  
  // This function will be called when the UPI setup is displayed to an interviewer
  const displayUpiSetupForInterviewer = () => {
    if (!currentQrCode || !upiId) return null;
    
    return (
      <div className="current-upi-details">
        <div className="upi-id-display">
          <strong>UPI ID:</strong> {upiId}
        </div>
        <div className="qr-code-container">
          <img src={currentQrCode} alt="Current QR Code" />
        </div>
        <p className="payment-instructions">
          This is the QR code that candidates will scan to make payments.
          <br />
          Make sure it's clearly visible and linked to your active UPI account.
        </p>
      </div>
    );
  };

  const handleQrCodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCode(file);
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      setMessage({ text: 'Please enter your UPI ID', type: 'error' });
      return;
    }
    
    if (!qrCode && !currentQrCode) {
      setMessage({ text: 'Please upload a QR code image', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('upiId', upiId);
      if (qrCode) {
        formData.append('qrCode', qrCode);
      }
      
      const res = await axios.post('/api/payments/upload-qr-code', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({ text: 'UPI QR code uploaded successfully', type: 'success' });
      setCurrentQrCode(res.data.qrCodeUrl);
      setPreviewUrl('');
      setQrCode(null);
    } catch (err) {
      console.error('Error uploading QR code:', err);
      setMessage({ 
        text: err.response?.data?.message || 'Error uploading QR code', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upi-qr-upload-container">
      <h2>UPI Payment Setup</h2>
      
      {currentQrCode && (
        <div className="current-setup-info">
          <div className="upi-setup-active">
            <span className="checkmark">✓</span>
            <span>UPI Payment Setup Active</span>
          </div>
        </div>
      )}
      
      <p className="info-text">
        {currentQrCode 
          ? 'Your UPI payment setup is active. You can update your details below if needed.'
          : 'Upload your UPI QR code to receive payments from candidates. This QR code will be shown to candidates when they need to make a payment.'}
      </p>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="upiId">UPI ID (e.g., name@upi)</label>
          <input
            type="text"
            id="upiId"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter your UPI ID"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="qrCode">UPI QR Code</label>
          <input
            type="file"
            id="qrCode"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleQrCodeChange}
          />
          <p className="file-info">Accepted formats: JPG, JPEG, PNG (Max: 5MB)</p>
        </div>
        
        {previewUrl && (
          <div className="qr-preview">
            <h3>Preview:</h3>
            <img src={previewUrl} alt="QR Code Preview" />
          </div>
        )}
        
        {currentQrCode && !previewUrl && (
          <div className="qr-preview current-qr">
            <h3>Current UPI Setup:</h3>
            {displayUpiSetupForInterviewer()}
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Save UPI Details'}
        </button>
      </form>
    </div>
  );
};

export default UpiQrCodeUpload;
