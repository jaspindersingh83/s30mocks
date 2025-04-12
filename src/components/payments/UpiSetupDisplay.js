import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpiQrCodeUpload.css'; // Reusing the same CSS

const UpiSetupDisplay = () => {
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUpiSetup = async () => {
      try {
        setLoading(true);
        // Fetch the UPI setup from the admin user
        const response = await axios.get('/api/payments/upi-setup');
        console.log('UPI setup response:', response.data);
        
        if (response.data && response.data.upiId) {
          setUpiId(response.data.upiId);
          setQrCodeUrl(response.data.qrCodeUrl);
        } else {
          setError('No UPI setup found. Please contact the administrator.');
        }
      } catch (err) {
        console.error('Error fetching UPI setup:', err);
        setError('Failed to load UPI payment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUpiSetup();
  }, []);

  if (loading) {
    return <div className="upi-setup-loading">Loading payment details...</div>;
  }

  if (error) {
    return <div className="upi-setup-error">{error}</div>;
  }

  return (
    <div className="upi-setup-display">
      <h3>Payment Details</h3>
      
      {qrCodeUrl ? (
        <div className="current-upi-details">
          <div className="upi-id-display">
            <strong>UPI ID:</strong> {upiId}
          </div>
          <div className="qr-code-container">
            <img src={qrCodeUrl} alt="UPI QR Code" />
          </div>
          <p className="payment-instructions">
            Scan this QR code with any UPI app to make your payment.
            <br />
            After payment, please take a screenshot of the payment confirmation for verification.
          </p>
        </div>
      ) : (
        <div className="no-upi-setup">
          No payment details available. Please contact the administrator.
        </div>
      )}
    </div>
  );
};

export default UpiSetupDisplay;
