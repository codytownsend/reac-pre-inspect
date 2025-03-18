// src/pages/inspections/InsideAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Building,
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ArrowLeft,
  Search,
  Coffee,
  DoorOpen,
  Users,
  Wrench
} from 'lucide-react';

const InsideAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insideAreas, setInsideAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Same effect code as before
    // ...
  }, [id, getInspection, navigate]);
  
  // Helper to get icon for inside area type
  const getAreaIcon = (areaType) => {
    switch (areaType) {
      case 'hallway':
        return <DoorOpen size={20} />;
      case 'laundry':
        return <Wrench size={20} />;
      case 'community':
        return <Users size={20} />;
      case 'office':
        return <Coffee size={20} />;
      case 'mechanical':
        return <Wrench size={20} />;
      default:
        return <Building size={20} />;
    }
  };
  
  const getSeverityIcon = (area) => {
    // Same logic as previous function
    // ...
  };
  
  const getSeverityClass = (area) => {
    // Same logic structure but returning 'critical', 'serious', 'moderate', or 'minor'
    // ...
  };
  
  // Filter areas based on search term
  const filteredAreas = insideAreas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddArea = () => {
    navigate(`/inspections/${id}/inside/add`);
  };

  // Quick add buttons for common inside area types
  const quickAddButtons = [
    { type: 'hallway', label: 'Hallway', icon: <DoorOpen size={20} /> },
    { type: 'laundry', label: 'Laundry', icon: <Wrench size={20} /> },
    { type: 'community', label: 'Community', icon: <Users size={20} /> },
    { type: 'office', label: 'Office', icon: <Coffee size={20} /> }
  ];
  
  const handleQuickAdd = (type) => {
    navigate(`/inspections/${id}/inside/add?type=${type}`);
  };
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading inside areas...</p>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="modern-empty-state">
        <div className="modern-empty-state__icon">
          <AlertCircle size={32} />
        </div>
        <h2 className="modern-empty-state__title">Inspection Not Found</h2>
        <p className="modern-empty-state__description">
          {error || "The inspection you're looking for doesn't exist or has been removed."}
        </p>
        <button 
          className="modern-btn modern-btn--purple"
          onClick={() => navigate('/inspections')}
        >
          Back to Inspections
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Bar */}
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Inside Areas</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {insideAreas.length} Area{insideAreas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Quick Add Section */}
      {insideAreas.length > 0 && (
        <div className="modern-quick-actions">
          <h3 className="modern-quick-actions__title">Quick Add</h3>
          <div className="modern-quick-actions__grid">
            {quickAddButtons.map(item => (
              <button 
                key={item.type}
                className="modern-quick-action-button"
                onClick={() => handleQuickAdd(item.type)}
              >
                <div className="modern-quick-action-button__icon text-purple-500">
                  {item.icon}
                </div>
                <span className="modern-quick-action-button__label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="modern-search-container">
        <div className="modern-search-input-wrapper">
          <Search size={18} className="modern-search-icon" />
          <input
            type="text"
            className="modern-search-input"
            placeholder="Search inside areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Areas List */}
      <div className="px-4">
        {filteredAreas.length === 0 ? (
          <div className="modern-empty-state">
            {searchTerm ? (
              <>
                <div className="modern-empty-state__icon">
                  <Search size={24} />
                </div>
                <h2 className="modern-empty-state__title">No results found</h2>
                <p className="modern-empty-state__description">No inside areas found matching "{searchTerm}"</p>
                <button 
                  className="modern-btn modern-btn--secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="modern-empty-state__icon">
                  <Building size={24} className="text-purple-500" />
                </div>
                <h2 className="modern-empty-state__title">No inside areas added yet</h2>
                <p className="modern-empty-state__description">Add your first inside area to begin inspection</p>
                <button 
                  className="modern-btn modern-btn--purple"
                  onClick={handleAddArea}
                >
                  <Plus size={18} className="mr-2" /> Add First Area
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="modern-list">
            {filteredAreas.map((area) => (
              <div 
                key={area.id} 
                className="modern-list-item modern-list-item--interactive"
                onClick={() => navigate(`/inspections/${id}/inside/${area.id}`)}
              >
                <div className="modern-list-item__content">
                  <div className="modern-list-item__icon modern-list-item__icon--purple">
                    {getAreaIcon(area.type)}
                  </div>
                  <div className="modern-list-item__details">
                    <h3 className="modern-list-item__title">{area.name}</h3>
                    <p className="modern-list-item__subtitle">
                      {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="modern-list-item__action">
                    {getSeverityIcon(area)}
                    <ChevronRight size={20} className="text-gray-400 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className="fab fab--purple"
        onClick={handleAddArea}
        aria-label="Add Inside Area"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default InsideAreaPage;