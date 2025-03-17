// src/pages/properties/Properties.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { Search, Plus, Home } from 'lucide-react';

const Properties = () => {
  const { properties, loading } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Action button to add new property
  const AddButton = (
    <Button 
      variant="primary" 
      onClick={() => navigate('/properties/new')}
    >
      <Plus size={16} /> Add
    </Button>
  );

  if (loading) {
    return <Loading message="Loading properties..." />;
  }

  return (
    <div className="container">
      <Header title="Properties" action={AddButton} />
      
      {/* Search input */}
      <div className="search-container">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Properties list */}
      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <Home size={48} />
          <p>No properties found</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/properties/new')}
          >
            Add Property
          </Button>
        </div>
      ) : (
        <div className="properties-list">
          {filteredProperties.map(property => (
            <Card 
              key={property.id} 
              className="property-card"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="property-info">
                <h3 className="property-name">{property.name}</h3>
                <p className="property-address">{property.address}</p>
                <div className="property-meta">
                  <span>{property.units} Units</span>
                  <span>{property.buildingCount} Buildings</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;