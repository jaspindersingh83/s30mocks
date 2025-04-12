import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

const PriceManagement = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    interviewType: 'DSA',
    price: '',
    currency: 'INR'
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/prices');
      setPrices(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prices:', err);
      toast.error('Failed to fetch prices');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        return toast.error('Price must be a positive number');
      }
      
      const res = await axios.put('/api/prices', {
        interviewType: formData.interviewType,
        price,
        currency: formData.currency
      });
      
      toast.success(`Price for ${formData.interviewType} interviews updated successfully`);
      fetchPrices();
      
      // Reset form
      setFormData({
        interviewType: 'DSA',
        price: '',
        currency: 'INR'
      });
    } catch (err) {
      console.error('Error updating price:', err);
      toast.error(err.response?.data?.message || 'Failed to update price');
    }
  };

  return (
    <div className="admin-section">
      <h2>Interview Price Management</h2>
      
      <div className="price-management">
        <div className="current-prices">
          <h3>Current Prices</h3>
          {loading ? (
            <p>Loading prices...</p>
          ) : prices.length === 0 ? (
            <p>No prices set yet</p>
          ) : (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Interview Type</th>
                  <th>Base Price</th>
                  <th>GST (18%)</th>
                  <th>Total Price</th>
                  <th>Currency</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => {
                  const gstAmount = parseFloat((price.price * 0.18).toFixed(2));
                  const totalPrice = parseFloat((price.price + gstAmount).toFixed(2));
                  return (
                    <tr key={price._id}>
                      <td>{price.interviewType}</td>
                      <td>{price.price}</td>
                      <td>{gstAmount}</td>
                      <td><strong>{price.price} {price.currency} + 18% GST</strong></td>
                      <td>{price.currency}</td>
                      <td>{new Date(price.updatedAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="update-price">
          <h3>Update Price</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="interviewType">Interview Type</label>
              <select
                id="interviewType"
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                required
              >
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Base Price (excluding GST)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter base price (GST will be added)"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Update Price
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PriceManagement;
