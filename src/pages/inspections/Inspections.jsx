// src/pages/inspections/Inspections.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Plus, Calendar, Search, ClipboardList } from 'lucide-react';

const Inspections = () => {
  const navigate = useNavigate();
  const { inspections, loading } = useInspection();
  const { properties } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get property name by ID
  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Unknown Property';
  };
  
  // Filter inspections based on search term and status
  const filteredInspections = inspections.filter(inspection => {
    const propertyName = getPropertyName(inspection.propertyId);
    const matchesSearch = 
      propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort inspections by date (newest first)
  filteredInspections.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Action button to add new inspection
  const AddButton = (
    <Button 
      variant="primary" 
      onClick={() => navigate('/inspections/new')}
    >
      <Plus size={16} /> New
    </Button>
  );

  if (loading) {
    return <Loading message="Loading inspections..." />;
  }

  return (
    <div className="container">
      <Header title="Inspections" action={AddButton} />
      
      {/* Search and filter */}
      <div className="search-filter-container">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>
      
      {/* Inspections list */}
      {filteredInspections.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <p>No inspections found</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/inspections/new')}
          >
            Create Inspection
          </Button>
        </div>
      ) : (
        <div className="inspections-list">
          {filteredInspections.map(inspection => (
            <Card 
              key={inspection.id} 
              className="inspection-card"
              onClick={() => navigate(`/inspections/${inspection.id}`)}
            >
              <div className="inspection-info">
                <h3 className="property-name">{getPropertyName(inspection.propertyId)}</h3>
                <div className="inspection-meta">
                  <div className="inspection-date">
                    <Calendar size={16} />
                    <span>{new Date(inspection.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge status-${inspection.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {inspection.status}
                  </span>
                </div>
                <div className="inspection-details">
                  <span>Inspector: {inspection.inspector}</span>
                  <span>{inspection.findings ? `${inspection.findings.length} issues` : 'No findings'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspections;