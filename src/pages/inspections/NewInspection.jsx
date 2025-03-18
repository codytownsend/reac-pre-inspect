// src/pages/inspections/NewInspection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const NewInspection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { createInspection } = useInspection();
  const { properties, loading: propertiesLoading } = useProperty();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pre-select property if passed in state
  const preSelectedPropertyId = location.state?.propertyId;
  
  const [formData, setFormData] = useState({
    propertyId: preSelectedPropertyId || '',
    date: new Date().toISOString().split('T')[0],
    inspector: currentUser.displayName || currentUser.email,
    notes: '',
    status: 'In Progress'
  });
  
  // If there's only one property, auto-select it
  useEffect(() => {
    if (properties.length === 1 && !formData.propertyId) {
      setFormData(prev => ({
        ...prev,
        propertyId: properties[0].id
      }));
    }
  }, [properties, formData.propertyId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && !formData.propertyId) {
      setError('Please select a property');
      return;
    }
    
    setError('');
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Create the inspection
      const newInspection = await createInspection(formData);
      
      // Navigate to the inspection detail page
      navigate(`/inspections/${newInspection.id}`);
    } catch (error) {
      setError('Error creating inspection: ' + error.message);
      setLoading(false);
    }
  };
  
  if (propertiesLoading) {
    return <Loading message="Loading properties..." />;
  }
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3>Select Property</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="propertyId">Property</label>
              <select
                id="propertyId"
                name="propertyId"
                className="form-control"
                value={formData.propertyId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a property --</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="step-actions">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={handleNextStep}
              >
                Next
              </Button>
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <h3>Inspection Details</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="inspector">Inspector</label>
              <input
                id="inspector"
                name="inspector"
                type="text"
                className="form-control"
                value={formData.inspector}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="step-actions">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={handleNextStep}
              >
                Next
              </Button>
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h3>Additional Information</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes or instructions..."
              ></textarea>
            </div>
            
            <div className="step-actions">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Inspection'}
              </Button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="container">
      <Header title="New Inspection" showBack={true} />
      
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
      </div>
      
      <Alert type="danger" message={error} />
      
      <form onSubmit={handleSubmit}>
        {renderStep()}
      </form>
    </div>
  );
};

export default NewInspection;