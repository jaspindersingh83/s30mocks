import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import UpiSetupDisplay from './UpiSetupDisplay';
import './UpiPayment.css';

const UpiPayment = ({ onPaymentComplete }) => {
  const { interviewId } = useParams();
  const { user, isInterviewer } = useContext(AuthContext);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        console.log('Fetching payment details for interview:', interviewId);
        setLoading(true);
        
        // First check if payment already exists
        try {
          const existingPayment = await api.get(`/api/payments/interview/${interviewId}`);
          
          if (existingPayment.data && existingPayment.data.exists !== false) {
            console.log('Existing payment found:', existingPayment.data);
            setPayment(existingPayment.data);
            
            // If payment is already verified, notify parent component
            if (existingPayment.data.status === 'verified') {
              onPaymentComplete && onPaymentComplete();
            }
            
            setLoading(false);
            return;
          } else if (existingPayment.data.exists === false) {
            console.log('No existing payment found, creating new payment request');
            // Create a new payment request
            try {
              const res = await api.post('/api/payments/create-payment-request', { interviewId });
              console.log('New payment created:', res.data);
              // Ensure all required fields are present in the payment object
              setPayment({
                _id: res.data.paymentId,
                amount: res.data.amount,
                currency: res.data.currency,
                upiId: res.data.upiId,
                qrCodeUrl: res.data.qrCodeUrl,
                status: 'pending',
                interview: interviewId
              });
            } catch (createErr) {
              console.error('Error creating payment:', createErr);
              setError(createErr.response?.data?.message || 'Failed to create payment request');
            }
          }
        } catch (err) {
          console.error('Error checking existing payment:', err);
          // If there's an error fetching the payment, try to create a new one
          if (err.response?.status === 404) {
            try {
              console.log('Creating new payment request after 404');
              const res = await api.post('/api/payments/create-payment-request', { interviewId });
              console.log('New payment created after 404:', res.data);
              // Ensure all required fields are present in the payment object
              setPayment({
                _id: res.data.paymentId,
                amount: res.data.amount,
                currency: res.data.currency,
                upiId: res.data.upiId,
                qrCodeUrl: res.data.qrCodeUrl,
                status: 'pending',
                interview: interviewId
              });
            } catch (createErr) {
              console.error('Error creating payment after 404:', createErr);
              setError(createErr.response?.data?.message || 'Failed to create payment request');
            }
          } else {
            setError(err.response?.data?.message || 'Failed to load payment details');
          }
        }
      } catch (err) {
        console.error('Unexpected error in fetchPaymentDetails:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchPaymentDetails();
    }
  }, [interviewId, onPaymentComplete]);

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
      formData.append('paymentId', payment._id); // Use _id instead of paymentId
      formData.append('transactionId', transactionId);
      // Use the same field name as expected by multer on the server
      formData.append('transactionScreenshot', screenshot);
      
      console.log('Submitting payment proof:', {
        paymentId: payment._id,
        transactionId,
        hasScreenshot: !!screenshot
      });
      
      await api.post('/api/payments/submit-payment-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({ 
        text: 'Payment proof submitted successfully. The interviewer will verify your payment.', 
        type: 'success' 
      });
      
      // Refresh payment details
      const updatedPayment = await api.get(`/api/payments/interview/${interviewId}`);
      setPayment(updatedPayment.data);
      
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

  if (loading) {
    return <div className="upi-payment-loading">Loading payment details... Please wait while we retrieve your payment information.</div>;
  }

  if (error) {
    return <div className="upi-payment-error">{error}</div>;
  }

  const renderPaymentStatus = () => {
    switch(payment.status) {
      case 'pending':
        return (
          <div className="payment-status pending">
            <p>Please complete the payment using the UPI QR code below.</p>
          </div>
        );
      case 'submitted':
        return (
          <div className="payment-status submitted">
            <p>Your payment proof has been submitted and is awaiting verification.</p>
          </div>
        );
      case 'verified':
        return (
          <div className="payment-status verified">
            <p>Your payment has been verified. You're all set for the interview!</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="payment-status rejected">
            <p>Your payment proof was rejected. Please submit a new proof or contact support.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // If user is an interviewer, show the UPI setup display instead of payment form
  if (isInterviewer) {
    return (
      <div className="upi-payment-container">
        <h2>Interview Payment Details</h2>
        <p className="interviewer-info">
          These are the payment details that candidates will see when making a payment for this interview.
          You can update these details in your profile settings.
        </p>
        <UpiSetupDisplay />
      </div>
    );
  }

  return (
    <div className="upi-payment-container">
      <h2>Interview Payment</h2>
      
      {renderPaymentStatus()}
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="payment-details">
        {payment.amount ? (
          <>
            <p><strong>Amount:</strong> {payment.currency || '₹'}{payment.amount}</p>
          </>
        ) : (
          <p><strong>Amount:</strong> ₹{payment.amount}</p>
        )}
        <p><strong>UPI ID:</strong> {payment.upiId}</p>
      </div>
      
      {payment.qrCodeUrl && (payment.status === 'pending' || payment.status === 'rejected') && (
        <div className="qr-code-section">
          <h3>Scan QR Code to Pay</h3>
          <img src={payment.qrCodeUrl} alt="UPI QR Code" className="qr-code-image" />
          <p className="payment-instruction">
            Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.) 
            to make the payment. After payment, submit the transaction details below.
          </p>
        </div>
      )}
      
      {(payment.status === 'pending' || payment.status === 'rejected') && (
        <form onSubmit={handleSubmit} className="payment-proof-form">
          <h3>Submit Payment Proof</h3>
          
          <div className="form-group">
            <label htmlFor="transactionId">Transaction ID (Last 4 digits only)</label>
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
            <p className="form-text">For security reasons, please enter only the last 4 digits of your UPI transaction ID</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="screenshot">Payment Screenshot</label>
            <input
              type="file"
              id="screenshot"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleScreenshotChange}
              required
            />
            <p className="file-info">Upload a screenshot showing the successful payment (Max: 5MB)</p>
          </div>
          
          {previewUrl && (
            <div className="screenshot-preview">
              <h4>Preview:</h4>
              <img src={previewUrl} alt="Payment Screenshot Preview" />
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </form>
      )}
      
      {payment.status === 'submitted' && (
        <div className="verification-pending">
          <h3>Verification Pending</h3>
          <p>
            Your payment proof has been submitted and is awaiting verification by the interviewer.
            This usually takes 1-2 business days. You'll receive an email once it's verified.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpiPayment;
