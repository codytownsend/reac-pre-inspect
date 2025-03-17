// src/pages/properties/EditProperty.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, updateProperty } = useProperty();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    units: '',
    buildingCount: '',
  });
  
  useEffect(() => {
    const property = getProperty(id);
    if (!property) {
      navigate('/properties');
      return;
    }
    
    setFormData({
      name: property.name,
      address: property.address,
      units: property.units.toString(),
      buildingCount: property.buildingCount.toString(),
    });
    setInitialLoading(false);
  }, [id, getProperty, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate input
      if (!formData.name.trim()) {
        throw new Error('Property name is required');
      }
      
      if (!formData.address.trim()) {
        throw new Error('Property address is required');
      }
      
      const units = parseInt(formData.units);
      if (isNaN(units) || units <= 0) {
        throw new Error('Number of units must be a positive number');
      }
      
      const buildingCount = parseInt(formData.buildingCount);
      if (isNaN(buildingCount) || buildingCount <= 0) {
        throw new Error('Number of buildings must be a positive number');
      }
      
      // Update the property
      await updateProperty(id, {
        name: formData.name.trim(),
        address: formData.address.trim(),
        units,
        buildingCount,
      });
      
      // Redirect back to property details
      navigate(`/properties/${id}`);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return <Loading message="Loading property details..." />;
  }
  
  return (
    <div className="container">
      <Header title="Edit Property" showBack={true} />
      
      <Alert type="danger" message={error} />
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Property Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="units">Number of Units</label>
          <input
            id="units"
            name="units"
            type="number"
            className="form-control"
            value={formData.units}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="buildingCount">Number of Buildings</label>
          <input
            id="buildingCount"
            name="buildingCount"
            type="number"
            className="form-control"
            value={formData.buildingCount}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-actions">
          <Button 
            variant="secondary" 
            type="button" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;