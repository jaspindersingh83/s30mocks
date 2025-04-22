import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
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
        const slotResponse = await axios.get(`/api/slots/${slotId}`);
        setSlot(slotResponse.data);
        
        // Create a pre-booking payment
        const paymentResponse = await axios.post('/api/payments/create-prebooking-payment', { 
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
    
    try {
      const formData = new FormData();
      formData.append('paymentId', payment._id);
      formData.append('transactionId', transactionId);
      formData.append('transactionScreenshot', screenshot);
      formData.append('slotId', slotId);
      
      // Submit payment proof
      await axios.post('/api/payments/submit-prebooking-payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Book the slot now that payment is submitted
      await axios.post(`/api/slots/book/${slotId}?paymentSubmitted=true`);
      
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
      setMessage({ 
        text: err.response?.data?.message || 'Error submitting payment proof', 
        type: 'error' 
      });
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
              />
            </div>
            <p className="upi-id">UPI ID: <strong>{payment.upiId}</strong></p>
          </div>
          
          <form onSubmit={handleSubmit} className="payment-proof-form">
            <div className="form-group">
              <label htmlFor="transactionId">Transaction ID:</label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter UPI transaction ID"
                required
              />
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
