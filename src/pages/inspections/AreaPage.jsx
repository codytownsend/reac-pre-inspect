// src/pages/inspections/AreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Building, 
  Grid, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ArrowLeft,
  Search,
  DoorOpen,
  Wrench,
  Users,
  Coffee,
  ParkingSquare,
  TreePine,
  Wind
} from 'lucide-react';

const AreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Determine area type from URL path
  const areaType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
  // Configuration based on area type
  const config = {
    unit: {
      title: 'Units',
      icon: <Home size={24} />,
      color: 'blue',
      addPath: `/inspections/${id}/units/add`,
      quickAddOptions: [
        { type: '101', label: '101', icon: <Home size={20} /> },
        { type: '102', label: '102', icon: <Home size={20} /> },
        { type: '201', label: '201', icon: <Home size={20} /> },
        { type: '202', label: '202', icon: <Home size={20} /> }
      ],
      getItemIcon: () => <Home size={20} />
    },
    inside: {
      title: 'Inside Areas',
      icon: <Building size={24} />,
      color: 'purple',
      addPath: `/inspections/${id}/inside/add`,
      quickAddOptions: [
        { type: 'hallway', label: 'Hallway', icon: <DoorOpen size={20} /> },
        { type: 'laundry', label: 'Laundry', icon: <Wrench size={20} /> },
        { type: 'community', label: 'Community', icon: <Users size={20} /> },
        { type: 'office', label: 'Office', icon: <Coffee size={20} /> }
      ],
      getItemIcon: (type) => {
        switch(type) {
          case 'hallway': return <DoorOpen size={20} />;
          case 'laundry': return <Wrench size={20} />;
          case 'community': return <Users size={20} />;
          case 'office': return <Coffee size={20} />;
          default: return <Building size={20} />;
        }
      }
    },
    outside: {
      title: 'Outside Areas',
      icon: <Grid size={24} />,
      color: 'green',
      addPath: `/inspections/${id}/outside/add`,
      quickAddOptions: [
        { type: 'building', label: 'Building', icon: <Home size={20} /> },
        { type: 'parking', label: 'Parking', icon: <ParkingSquare size={20} /> },
        { type: 'grounds', label: 'Grounds', icon: <TreePine size={20} /> },
        { type: 'playground', label: 'Playground', icon: <Wind size={20} /> }
      ],
      getItemIcon: (type) => {
        switch(type) {
          case 'building': return <Home size={20} />;
          case 'parking': return <ParkingSquare size={20} />;
          case 'grounds': return <TreePine size={20} />;
          case 'playground': return <Wind size={20} />;
          default: return <Grid size={20} />;
        }
      }
    }
  }[areaType];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter areas by type
        const filteredAreas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === areaType)
          : [];
        
        setAreas(filteredAreas);
      } catch (error) {
        console.error(`Error loading ${areaType} areas:`, error);
        setError(`Error loading ${areaType} areas`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate, areaType]);
  
  // Get severity icon based on findings in an area
  const getSeverityIcon = (area) => {
    if (!area.findings || area.findings.length === 0) {
      return <CheckCircle size={20} className="text-green-500" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="text-red-500" />;
    }
    
    // Check for severe findings
    const hasSevere = area.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="text-orange-500" />;
    }
    
    // Check for moderate findings
    const hasModerate = area.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={20} className="text-green-500" />;
  };
  
  // Filter areas based on search term
  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddArea = () => {
    navigate(config.addPath);
  };
  
  const handleQuickAdd = (quickAddType) => {
    navigate(`${config.addPath}?type=${quickAddType}`);
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner"></div>
        <p>Loading {config.title.toLowerCase()}...</p>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="page-container">
        <div className="error-message">
          <AlertCircle size={20} />
          {error || `Inspection not found`}
        </div>
        <button 
          className="button button--primary"
          onClick={() => navigate('/inspections')}
        >
          Back to Inspections
        </button>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar__left">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">{config.title}</h1>
        </div>
        
        <div className="app-bar__right">
          <span className="badge badge--default">
            {areas.length} {areas.length === 1 ? areaType : `${areaType}s`}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {/* Quick Add Section */}
      {areas.length > 0 && (
        <div className="card card--padded">
          <h3 className="form-label">Quick Add</h3>
          <div className="grid">
            {config.quickAddOptions.map(option => (
              <button 
                key={option.type}
                className={`button button--${config.color}`}
                onClick={() => handleQuickAdd(option.type)}
              >
                <span className="button__icon">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Areas List */}
      {filteredAreas.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <div className="empty-state__icon">
                <Search size={24} />
              </div>
              <h2 className="empty-state__title">No results found</h2>
              <p className="empty-state__description">
                No {areaType} areas found matching "{searchTerm}"
              </p>
              <button 
                className="button button--secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <div className="empty-state__icon">
                {config.icon}
              </div>
              <h2 className="empty-state__title">No {areaType} areas added yet</h2>
              <p className="empty-state__description">
                Add your first {areaType} area to begin the inspection
              </p>
              <button 
                className={`button button--${config.color}`}
                onClick={handleAddArea}
              >
                <Plus size={18} className="mr-2" /> Add First {areaType.charAt(0).toUpperCase() + areaType.slice(1)}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="list">
          {filteredAreas.map((area) => (
            <div 
              key={area.id} 
              className="card card--interactive"
              onClick={() => navigate(`/inspections/${id}/${areaType}/${area.id}`)}
            >
              <div className="area-card__content">
                <div className={`area-card__icon area-card__icon--${config.color}`}>
                  {config.getItemIcon(area.type)}
                </div>
                <div className="area-card__details">
                  <h3 className="area-card__title">{area.name}</h3>
                  <p className="area-card__subtitle">
                    {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="area-card__action">
                  {getSeverityIcon(area)}
                  <ChevronRight size={20} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Floating Action Button */}
      <button 
        className={`fab fab--${config.color}`}
        onClick={handleAddArea}
        aria-label={`Add ${areaType}`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AreaPage;