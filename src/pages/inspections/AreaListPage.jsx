// src/pages/inspections/AreaListPage.jsx
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

const AreaListPage = () => {
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
      return <CheckCircle size={20} className="severity-icon--minor" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="severity-icon--critical" />;
    }
    
    // Check for severe findings
    const hasSevere = area.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="severity-icon--serious" />;
    }
    
    // Check for moderate findings
    const hasModerate = area.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="severity-icon--moderate" />;
    }
    
    return <CheckCircle size={20} className="severity-icon--minor" />;
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
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading {config.title.toLowerCase()}...</p>
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
          className="modern-btn modern-btn--primary"
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
          <h1 className="app-bar__title">{config.title}</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {areas.length} {areas.length === 1 ? areaType : `${areaType}s`}
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
      {areas.length > 0 && (
        <div className="modern-quick-actions">
          <h3 className="modern-quick-actions__title">Quick Add</h3>
          <div className="modern-quick-actions__grid">
            {config.quickAddOptions.map(item => (
              <button 
                key={item.type}
                className="modern-quick-action-button"
                onClick={() => handleQuickAdd(item.type)}
              >
                <div className={`modern-quick-action-button__icon text-${config.color}-500`}>
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
            placeholder={`Search ${config.title.toLowerCase()}...`}
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
                <p className="modern-empty-state__description">No {areaType} areas found matching "{searchTerm}"</p>
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
                  {config.icon}
                </div>
                <h2 className="modern-empty-state__title">No {areaType} areas added yet</h2>
                <p className="modern-empty-state__description">Add your first {areaType} area to begin the inspection</p>
                <button 
                  className={`modern-btn modern-btn--${config.color}`}
                  onClick={handleAddArea}
                >
                  <Plus size={18} className="mr-2" /> Add First {areaType.charAt(0).toUpperCase() + areaType.slice(1)}
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
                onClick={() => navigate(`/inspections/${id}/${areaType}/${area.id}`)}
              >
                <div className="modern-list-item__content">
                  <div className={`modern-list-item__icon modern-list-item__icon--${config.color}`}>
                    {config.getItemIcon(area.type)}
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
        className={`fab fab--${config.color}`}
        onClick={handleAddArea}
        aria-label={`Add ${areaType}`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default AreaListPage;