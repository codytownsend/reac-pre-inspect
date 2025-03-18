// src/pages/inspections/UnitAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ArrowLeft,
  Search
} from 'lucide-react';

const UnitAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter units from areas
        const unitAreas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === 'unit')
          : [];
        
        setUnits(unitAreas);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleAddUnit = () => {
    navigate(`/inspections/${id}/units/add`);
  };
  
  const getSeverityClass = (unit) => {
    if (!unit.findings || unit.findings.length === 0) {
      return 'minor';
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = unit.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return 'critical';
    }
    
    // Check for severe findings
    const hasSevere = unit.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return 'serious';
    }
    
    // Check for moderate findings
    const hasModerate = unit.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return 'moderate';
    }
    
    return 'minor';
  };
  
  const getSeverityIcon = (unit) => {
    if (!unit.findings || unit.findings.length === 0) {
      return <CheckCircle size={20} className="text-green-500" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = unit.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="severity-icon--critical" />;
    }
    
    // Check for severe findings
    const hasSevere = unit.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="severity-icon--serious" />;
    }
    
    // Check for moderate findings
    const hasModerate = unit.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="severity-icon--moderate" />;
    }
    
    return <CheckCircle size={20} className="severity-icon--minor" />;
  };
  
  // Filter units based on search term
  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading units...</p>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="modern-empty-state">
          <div className="modern-empty-state__icon">
            <AlertCircle size={32} />
          </div>
          <h2 className="modern-empty-state__title">Inspection Not Found</h2>
          <p className="modern-empty-state__description">
            {error || "The inspection you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            className="modern-btn modern-btn--primary"
            onClick={() => navigate('/inspections')}
          >
            Back to Inspections
          </button>
        </div>
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
          <h1 className="app-bar__title">Units</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {units.length} Unit{units.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Search Bar */}
      <div className="modern-search-container">
        <div className="modern-search-input-wrapper">
          <Search size={18} className="modern-search-icon" />
          <input
            type="text"
            className="modern-search-input"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Units List */}
      <div className="px-4">
        {filteredUnits.length === 0 ? (
          <div className="modern-empty-state">
            {searchTerm ? (
              <>
                <div className="modern-empty-state__icon">
                  <Search size={24} />
                </div>
                <h2 className="modern-empty-state__title">No results found</h2>
                <p className="modern-empty-state__description">No units found matching "{searchTerm}"</p>
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
                  <Home size={24} className="text-blue-500" />
                </div>
                <h2 className="modern-empty-state__title">No units added yet</h2>
                <p className="modern-empty-state__description">Add your first unit to begin the inspection</p>
                <button 
                  className="modern-btn modern-btn--primary"
                  onClick={handleAddUnit}
                >
                  <Plus size={18} className="mr-2" /> Add First Unit
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="modern-list">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="modern-list-item modern-list-item--interactive"
                onClick={() => navigate(`/inspections/${id}/units/${unit.id}`)}
              >
                <div className="modern-list-item__content">
                  <div className="modern-list-item__icon modern-list-item__icon--blue">
                    <Home size={20} />
                  </div>
                  <div className="modern-list-item__details">
                    <h3 className="modern-list-item__title">{unit.name}</h3>
                    <p className="modern-list-item__subtitle">
                      {unit.findings?.length || 0} finding{unit.findings?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="modern-list-item__action">
                    {getSeverityIcon(unit)}
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
        className="fab fab--blue"
        onClick={handleAddUnit}
        aria-label="Add Unit"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default UnitAreaPage;