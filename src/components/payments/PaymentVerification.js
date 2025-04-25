import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './PaymentVerification.css';

const PaymentVerification = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage({ text: '', type: '' });
      
      const res = await api.get('/api/payments/pending');
      setPendingPayments(res.data);
      
      if (res.data.length === 0) {
        setMessage({ text: 'No pending payments found', type: 'info' });
      }
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      setError(err.response?.data?.message || 'Failed to load pending payments');
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, verified) => {
    try {
      // Confirm before taking action
      if (!window.confirm(`Are you sure you want to ${verified ? 'verify' : 'reject'} this payment?`)) {
        return;
      }
      
      setProcessing(true);
      
      await api.post('/api/payments/verify', {
        paymentId,
        verified
      });
      
      const message = `Payment ${verified ? 'verified' : 'rejected'} successfully`;
      setMessage({ 
        text: message, 
        type: 'success' 
      });
      toast.success(message);
      
      // Remove the payment from the list
      setPendingPayments(pendingPayments.filter(payment => payment._id !== paymentId));
      
    } catch (err) {
      console.error('Error verifying payment:', err);
      const errorMessage = err.response?.data?.message || 'Error processing verification';
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="payment-verification-container">
        <h2>Pending Payment Verifications</h2>
        <div className="payment-verification-loading">Loading pending payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-verification-container">
        <h2>Pending Payment Verifications</h2>
        <div className="payment-verification-error">{error}</div>
        <div className="action-buttons">
          <button 
            className="refresh-button"
            onClick={fetchPendingPayments}
          >
            Try Again
          </button>
          <button 
            className="back-button"
            onClick={handleNavigateBack}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-verification-container">
      <h2>Pending Payment Verifications</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {pendingPayments.length === 0 ? (
        <div className="no-payments">
          <p>No pending payments to verify at this time.</p>
        </div>
      ) : (
        <div className="payments-list">
          {pendingPayments.map(payment => (
            <div className="payment-card" key={payment._id}>
              <div className="payment-header">
                <h3>Payment #{payment._id.substring(0, 8)}</h3>
                <span className="payment-date">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="payment-info">
                <p><strong>Amount:</strong> ₹{payment.amount}</p>
                <p><strong>Candidate:</strong> {payment.interview?.candidate?.name || 'Unknown'}</p>
                <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                <p><strong>Status:</strong> <span className="status-submitted">Submitted</span></p>
              </div>
              
              <div className="payment-proof">
                <h4>Payment Proof</h4>
                {payment.transactionScreenshotUrl ? (
                  <div 
                    className="proof-image-container"
                    onClick={() => window.open(payment.transactionScreenshotUrl, '_blank')}
                  >
                    <img 
                      src={payment.transactionScreenshotUrl} 
                      alt="Payment Screenshot" 
                      className="proof-image"
                    />
                    <div className="image-overlay">Click to enlarge</div>
                  </div>
                ) : (
                  <p className="no-proof">No screenshot provided</p>
                )}
              </div>
              
              <div className="verification-actions">
                <button 
                  className="verify-button"
                  onClick={() => handleVerify(payment._id, true)}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Verify Payment'}
                </button>
                <button 
                  className="reject-button"
                  onClick={() => handleVerify(payment._id, false)}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="refresh-button"
          onClick={fetchPendingPayments}
          disabled={loading || processing}
        >
          {loading ? 'Loading...' : 'Refresh Payments'}
        </button>
        <button 
          className="back-button"
          onClick={handleNavigateBack}
          disabled={processing}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentVerification;
