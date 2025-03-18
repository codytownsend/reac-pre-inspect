// src/pages/inspections/UnitAreaPage.jsx - Modern mobile design
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { 
  Home, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  Clock
} from 'lucide-react';

const UnitAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  
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
  
  const getSeverityIcon = (unit) => {
    if (!unit.findings || unit.findings.length === 0) {
      return <CheckCircle size={20} className="text-green-500" />;
    }
    
    // Check for life-threatening findings
    const hasLifeThreatening = unit.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={20} className="text-red-500" />;
    }
    
    // Check for severe findings
    const hasSevere = unit.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={20} className="text-orange-500" />;
    }
    
    // Check for moderate findings
    const hasModerate = unit.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={20} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={20} className="text-green-500" />;
  };
  
  if (loading) {
    return <Loading message="Loading units..." />;
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
        title="Units" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="action-bar">
        <span className="unit-count">{units.length} Units</span>
        <Button 
          variant="primary" 
          onClick={handleAddUnit}
        >
          <Plus size={16} className="mr-1" /> Add Unit
        </Button>
      </div>
      
      {units.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Home size={48} className="text-gray-300" />
          </div>
          <h3>No Units Added</h3>
          <p>Add your first unit to begin inspection</p>
          <Button 
            variant="primary" 
            onClick={handleAddUnit}
          >
            <Plus size={16} className="mr-1" /> Add First Unit
          </Button>
        </div>
      ) : (
        <div className="units-list">
          {units.map((unit) => (
            <div 
              key={unit.id} 
              className="unit-card"
              onClick={() => navigate(`/inspections/${id}/units/${unit.id}`)}
            >
              <div className="unit-icon">
                <Home size={20} className="text-blue-500" />
              </div>
              <div className="unit-info">
                <h3 className="unit-name">{unit.name}</h3>
                <div className="unit-meta">
                  <span className="finding-count">
                    {unit.findings?.length || 0} Findings
                  </span>
                </div>
              </div>
              <div className="unit-status">
                {getSeverityIcon(unit)}
                <ChevronRight size={20} className="text-gray-400 ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="fab-container">
        <button 
          className="fab"
          onClick={handleAddUnit}
          aria-label="Add Unit"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default UnitAreaPage;