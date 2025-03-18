// src/pages/inspections/InsideAreaPage.jsx - Modern mobile design
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { 
  Building, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  Coffee,
  Wrench,
  Users,
  DoorOpen
} from 'lucide-react';

const InsideAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insideAreas, setInsideAreas] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter inside areas
        const areas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === 'inside')
          : [];
        
        setInsideAreas(areas);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleAddArea = () => {
    navigate(`/inspections/${id}/inside/add`);
  };
  
  // Helper to get icon for common area type
  const getAreaIcon = (areaType) => {
    switch (areaType) {
      case 'hallway':
        return <DoorOpen size={20} className="text-purple-500" />;
      case 'laundry':
        return <Wrench size={20} className="text-purple-500" />;
      case 'community':
        return <Users size={20} className="text-purple-500" />;
      case 'office':
        return <Coffee size={20} className="text-purple-500" />;
      default:
        return <Building size={20} className="text-purple-500" />;
    }
  };
  
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
  
  // Quick add area types
  const quickAddTypes = [
    { type: 'hallway', label: 'Hallway', icon: <DoorOpen size={24} className="text-purple-500" /> },
    { type: 'laundry', label: 'Laundry', icon: <Wrench size={24} className="text-purple-500" /> },
    { type: 'community', label: 'Community', icon: <Users size={24} className="text-purple-500" /> },
    { type: 'office', label: 'Office', icon: <Coffee size={24} className="text-purple-500" /> }
  ];
  
  const handleQuickAdd = (type) => {
    navigate(`/inspections/${id}/inside/add?type=${type}`);
  };
  
  if (loading) {
    return <Loading message="Loading inside areas..." />;
  }
  
  if (!inspection) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Inspection not found"} />
        <Button variant="primary" onClick={() => navigate('/inspections')}>
          Back to Inspections
        </Button>
      </div>
    );
  }
  
  return (
    <div className="inspection-page">
      <Header 
        title="Inside Areas" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="quick-add-section">
        <div className="quick-add-header">
          <h3>Quick Add</h3>
        </div>
        <div className="quick-add-buttons">
          {quickAddTypes.map(item => (
            <button 
              key={item.type}
              className="quick-add-button"
              onClick={() => handleQuickAdd(item.type)}
            >
              <div className="button-icon">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="action-bar">
        <span className="area-count">{insideAreas.length} Areas</span>
        <Button 
          variant="primary" 
          onClick={handleAddArea}
        >
          <Plus size={16} className="mr-1" /> Add Area
        </Button>
      </div>
      
      {insideAreas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Building size={48} className="text-gray-300" />
          </div>
          <h3>No Inside Areas Added</h3>
          <p>Add your first inside area to begin inspection</p>
          <Button 
            variant="primary" 
            onClick={handleAddArea}
          >
            <Plus size={16} className="mr-1" /> Add Area
          </Button>
        </div>
      ) : (
        <div className="areas-list">
          {insideAreas.map((area) => (
            <div 
              key={area.id} 
              className="area-card"
              onClick={() => navigate(`/inspections/${id}/inside/${area.id}`)}
            >
              <div className="area-icon">
                {getAreaIcon(area.type)}
              </div>
              <div className="area-info">
                <h3 className="area-name">{area.name}</h3>
                <div className="area-meta">
                  <span className="finding-count">
                    {area.findings?.length || 0} Findings
                  </span>
                </div>
              </div>
              <div className="area-status">
                {getSeverityIcon(area)}
                <ChevronRight size={20} className="text-gray-400 ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="fab-container">
        <button 
          className="fab"
          onClick={handleAddArea}
          aria-label="Add Inside Area"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default InsideAreaPage;