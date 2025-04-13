import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResponsiveTable from '../common/ResponsiveTable';
import { toast } from 'react-toastify';
// Using global admin styles from styles/admin.css

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
      <div className="admin-section-header">
        <h2 className="admin-section-title">Interview Price Management</h2>
      </div>
      
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Current Prices</h3>
          </div>
          <div className="admin-card-body">
          {loading ? (
            <p>Loading prices...</p>
          ) : prices.length === 0 ? (
            <p>No prices set yet</p>
          ) : (
            <ResponsiveTable 
              headers={['Interview Type', 'Price', 'Currency', 'Last Updated']}
              data={prices}
              renderRow={(price, index) => (
                <tr key={price._id}>
                  <td>{price.interviewType}</td>
                  <td>{price.price}</td>
                  <td>{price.currency || 'INR'}</td>
                  <td>{new Date(price.updatedAt).toLocaleString()}</td>
                </tr>
              )}
            />
          )}
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Update Price</h3>
          </div>
          <div className="admin-card-body">
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
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
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
    </div>
  );
};

export default PriceManagement;
