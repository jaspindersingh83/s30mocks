import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/api';
import './UpiPayment.css';

const PreBookingPayment = ({ slotId, onPaymentComplete, onCancel }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const fetchSlotDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch slot details
        const slotResponse = await api.get(`/api/slots/${slotId}`);
        setSlot(slotResponse.data);
        
        // Create a pre-booking payment
        const paymentResponse = await api.post('/api/payments/create-prebooking-payment', { 
          slotId,
          interviewType: slotResponse.data.interviewType
        });
        
        setPayment({
          _id: paymentResponse.data.paymentId,
          amount: paymentResponse.data.amount,
          currency: paymentResponse.data.currency,
          upiId: paymentResponse.data.upiId,
          qrCodeUrl: paymentResponse.data.qrCodeUrl,
          status: 'pending'
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching slot details or creating payment:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment');
        setLoading(false);
      }
    };

    if (slotId) {
      fetchSlotDetails();
    }
  }, [slotId]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
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
    
    if (!transactionId.trim()) {
      setMessage({ text: 'Please enter the transaction ID', type: 'error' });
      return;
    }
    
    if (!screenshot) {
      setMessage({ text: 'Please upload a screenshot of the payment', type: 'error' });
      return;
    }
    
    setSubmitting(true);
    setMessage({ text: 'Uploading payment details... Please wait.', type: 'info' });
    
    try {
      // Create a new FormData instance
      const formData = new FormData();
      formData.append('paymentId', payment._id);
      formData.append('transactionId', transactionId);
      // Make sure the field name matches what the server expects
      formData.append('transactionScreenshot', screenshot);
      formData.append('slotId', slotId);
      
      // Log the form data for debugging (will be removed in production)
      console.log('Payment data being submitted:', {
        paymentId: payment._id,
        transactionId,
        slotId,
        screenshotName: screenshot.name,
        screenshotType: screenshot.type,
        screenshotSize: screenshot.size
      });
      
      // Submit payment proof with proper headers
      const paymentResponse = await api.post('/api/payments/submit-prebooking-payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Payment submission successful:', paymentResponse.data);
      // No need to book the slot separately - the submitPreBookingPayment endpoint already handles this
      
      toast.success('Payment submitted and slot booked successfully! The interviewer will verify your payment.');
      
      // Notify parent component that payment is complete
      if (onPaymentComplete) {
        onPaymentComplete();
      } else {
        // Navigate to interviews page if no callback provided
        navigate('/interviews');
      }
      
    } catch (err) {
      console.error('Error submitting payment proof:', err);
      // More detailed error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error submitting payment proof';
      
      setMessage({ 
        text: `Payment submission failed: ${errorMessage}`, 
        type: 'error' 
      });
      toast.error(`Payment submission failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/slots/available');
    }
  };

  if (loading) {
    return <div className="upi-payment-loading">Loading payment details... Please wait.</div>;
  }

  if (error) {
    return (
      <div className="upi-payment-error">
        <p>{error}</p>
        <button className="btn-secondary" onClick={handleCancel}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="upi-payment-container">
      <h2>Payment Required Before Booking</h2>
      
      {slot && (
        <div className="slot-details">
          <h3>Slot Details</h3>
          <p><strong>Interview Type:</strong> {slot.interviewType}</p>
          <p><strong>Date:</strong> {new Date(slot.startTime).toLocaleString()}</p>
          <p><strong>Duration:</strong> {slot.interviewType === 'DSA' ? '40' : '50'} minutes</p>
          <p><strong>Interviewer:</strong> {slot.interviewer?.name}</p>
        </div>
      )}
      
      {payment && (
        <div className="payment-details">
          <h3>Payment Information</h3>
          <p className="payment-amount">
            Amount: <strong>{payment.currency} {payment.amount}</strong>
          </p>
          
          <div className="payment-qr-container">
            <p>Scan this QR code to pay via UPI:</p>
            <div className="qr-code-wrapper">
              <img 
                src={payment.qrCodeUrl} 
                alt="UPI QR Code" 
                className="upi-qr-code"
                style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
            <p className="upi-id">UPI ID: <strong>{payment.upiId}</strong></p>
          </div>
          
          <form onSubmit={handleSubmit} className="payment-proof-form">
            <div className="form-group">
              <label htmlFor="transactionId">Transaction ID (Last 4 digits only):</label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => {
                  // Only allow up to 4 digits
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 4) {
                    setTransactionId(value);
                  }
                }}
                placeholder="Enter last 4 digits only"
                maxLength="4"
                pattern="[0-9]{4}"
                required
              />
              <small className="form-text">For security reasons, please enter only the last 4 digits of your UPI transaction ID</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="screenshot">Payment Screenshot:</label>
              <input
                type="file"
                id="screenshot"
                onChange={handleScreenshotChange}
                accept="image/png, image/jpeg, image/jpg"
                required
              />
              
              {previewUrl && (
                <div className="screenshot-preview">
                  <img src={previewUrl} alt="Payment Screenshot Preview" />
                </div>
              )}
            </div>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Payment & Book Slot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PreBookingPayment;
