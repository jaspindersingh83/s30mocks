import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './PaymentManagement.css';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments/all');
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Failed to load payments');
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (confirmDelete === paymentId) {
      try {
        await api.delete(`/api/payments/${paymentId}`);
        toast.success('Payment deleted successfully');
        // Refresh the payments list
        fetchPayments();
      } catch (err) {
        console.error('Error deleting payment:', err);
        toast.error(err.response?.data?.message || 'Failed to delete payment');
      } finally {
        setConfirmDelete(null);
      }
    } else {
      // First click - ask for confirmation
      setConfirmDelete(paymentId);
      // Auto-reset after 5 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'submitted':
        return 'status-badge submitted';
      case 'verified':
        return 'status-badge verified';
      case 'rejected':
        return 'status-badge rejected';
      case 'refunded':
        return 'status-badge refunded';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading payments...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="payment-management">
      <h2>Payment Management</h2>
      
      <div className="admin-actions">
        <button 
          className="refresh-button"
          onClick={fetchPayments}
        >
          Refresh Payments
        </button>
      </div>
      
      {payments.length === 0 ? (
        <p className="no-data">No payments found</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Created</th>
                <th>Verified By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td title={payment._id}>
                    {payment._id.substring(payment._id.length - 6)}
                  </td>
                  <td>
                    {payment.paidBy ? (
                      <span title={payment.paidBy.email}>{payment.paidBy.name}</span>
                    ) : 'Unknown'}
                  </td>
                  <td>
                    {payment.currency} {payment.amount}
                  </td>
                  <td>
                    {payment.isPreBooking ? 'Pre-booking' : 'Regular'}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(payment.status)}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.transactionId || 'N/A'}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    {payment.verifiedBy ? payment.verifiedBy.name : 'N/A'}
                  </td>
                  <td>
                    <button
                      className={`delete-button ${confirmDelete === payment._id ? 'confirm' : ''}`}
                      onClick={() => handleDeletePayment(payment._id)}
                    >
                      {confirmDelete === payment._id ? 'Confirm' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
