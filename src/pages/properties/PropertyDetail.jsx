// src/pages/properties/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Edit, Trash2, Calendar, Building, Users, MapPin } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = useProperty();
  const { inspections } = useInspection();
  const [property, setProperty] = useState(null);
  const [propertyInspections, setPropertyInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get property details
    const propertyData = getProperty(id);
    if (!propertyData) {
      navigate('/properties');
      return;
    }
    setProperty(propertyData);
    
    // Get inspections for this property
    const relatedInspections = inspections.filter(
      inspection => inspection.propertyId === id
    );
    setPropertyInspections(relatedInspections);
    setLoading(false);
  }, [id, getProperty, inspections, navigate]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        navigate('/properties');
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property. Please try again.');
      }
    }
  };
  
  const handleNewInspection = () => {
    navigate('/inspections/new', { state: { propertyId: id } });
  };
  
  if (loading) {
    return <Loading message="Loading property details..." />;
  }
  
  if (!property) {
    return <div className="container">Property not found</div>;
  }
  
  return (
    <div className="container">
      <Header title={property.name} showBack={true} />
      
      <div className="property-detail">
        {/* Property info card */}
        <Card className="property-info-card">
          <div className="property-header">
            <h2>{property.name}</h2>
            <div className="action-buttons">
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/properties/${id}/edit`)}
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
          
          <div className="property-details">
            <div className="detail-item">
              <MapPin size={18} />
              <span>{property.address}</span>
            </div>
            <div className="detail-item">
              <Building size={18} />
              <span>{property.buildingCount} Buildings</span>
            </div>
            <div className="detail-item">
              <Users size={18} />
              <span>{property.units} Units</span>
            </div>
            {property.lastInspection && (
              <div className="detail-item">
                <Calendar size={18} />
                <span>Last inspection: {new Date(property.lastInspection).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>
        
        {/* Actions section */}
        <div className="actions-section">
          <Button 
            variant="primary" 
            block={true} 
            onClick={handleNewInspection}
          >
            <Calendar size={18} /> Start New Inspection
          </Button>
        </div>
        
        {/* Property inspections */}
        <div className="inspections-section">
          <h3>Inspections</h3>
          
          {propertyInspections.length === 0 ? (
            <div className="empty-inspections">
              <p>No inspections found for this property.</p>
            </div>
          ) : (
            <div className="inspection-list">
              {propertyInspections.map(inspection => (
                <Card 
                  key={inspection.id} 
                  className="inspection-card"
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                >
                  <div className="inspection-info">
                    <div className="inspection-date">
                      <Calendar size={16} />
                      <span>{new Date(inspection.date).toLocaleDateString()}</span>
                    </div>
                    <div className="inspection-meta">
                      <span>Inspector: {inspection.inspector}</span>
                      <span className={`status-badge status-${inspection.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {inspection.status}
                      </span>
                    </div>
                    <div className="inspection-findings">
                      {inspection.findings ? `${inspection.findings.length} issues found` : 'No findings recorded'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;