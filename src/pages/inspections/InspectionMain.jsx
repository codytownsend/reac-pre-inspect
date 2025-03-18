// src/pages/inspections/InspectionMain.jsx - Improved version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import { 
  Home, 
  Building, 
  Grid, 
  CheckSquare, 
  Download,
  Share2, 
  ChevronRight, 
  Plus 
} from 'lucide-react';

const InspectionMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        const propertyData = getProperty(inspectionData.propertyId);
        if (propertyData) {
          setProperty(propertyData);
        }
        
        // Calculate score
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, calculateScore, navigate]);
  
  const getInspectionCycle = (score) => {
    if (score >= 90) return '3 Years';
    if (score >= 80) return '2 Years';
    if (score >= 60) return '1 Year';
    return 'Failing';
  };
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };
  
  if (loading) {
    return <Loading message="Loading inspection details..." />;
  }
  
  if (!inspection || !property) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Inspection or property not found"} />
        <Button variant="primary" onClick={() => navigate('/inspections')}>
          Back to Inspections
        </Button>
      </div>
    );
  }
  
  // Get counts for each area
  const unitCount = inspection.areas?.filter(area => area.areaType === 'unit').length || 0;
  const insideLocations = inspection.areas?.filter(area => area.areaType === 'inside').length || 0;
  const outsideLocations = inspection.areas?.filter(area => area.areaType === 'outside').length || 0;
  
  // Get finding counts for each area
  const unitFindings = inspection.areas?.filter(area => area.areaType === 'unit')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const insideFindings = inspection.areas?.filter(area => area.areaType === 'inside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const outsideFindings = inspection.areas?.filter(area => area.areaType === 'outside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  return (
    <div className="container">
      <Header 
        title="Inspection Details" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Inspection Header Card */}
      <Card className="mb-4">
        <div className="property-header">
          <h2>{property.name}</h2>
          <p className="property-address">{property.address}</p>
        </div>
        
        <div className="inspection-meta">
          <div className="meta-item">
            <strong>Date:</strong> {new Date(inspection.date).toLocaleDateString()}
          </div>
          <div className="meta-item">
            <strong>Inspector:</strong> {inspection.inspector}
          </div>
          <div className="meta-item">
            <strong>Status:</strong> <span className={`status-badge status-${inspection.status.toLowerCase().replace(/\s+/g, '-')}`}>{inspection.status}</span>
          </div>
          <div className="meta-item">
            <strong>Score:</strong> <span className="score">{score}</span>
            <span className="inspection-cycle">({getInspectionCycle(score)})</span>
          </div>
        </div>
        
        <div className="action-buttons">
          <Button variant="secondary" onClick={handleGenerateReport}>
            <Download size={16} className="mr-1" /> Report
          </Button>
        </div>
      </Card>
      
      {/* Areas Grid */}
      <h2 className="section-title">Inspection Areas</h2>
      
      {/* Units Area Card */}
      <Card 
        className="inspection-area-card"
        onClick={() => navigate(`/inspections/${id}/areas/units`)}
      >
        <div className="area-icon">
          <Home size={24} />
        </div>
        <div className="area-info">
          <h3>Units</h3>
          <p>{unitCount} units, {unitFindings} findings</p>
        </div>
        <ChevronRight size={20} className="area-chevron" />
      </Card>
      
      {/* Inside Area Card */}
      <Card 
        className="inspection-area-card"
        onClick={() => navigate(`/inspections/${id}/areas/inside`)}
      >
        <div className="area-icon">
          <Building size={24} />
        </div>
        <div className="area-info">
          <h3>Inside</h3>
          <p>{insideLocations} locations, {insideFindings} findings</p>
        </div>
        <ChevronRight size={20} className="area-chevron" />
      </Card>
      
      {/* Outside Area Card */}
      <Card 
        className="inspection-area-card"
        onClick={() => navigate(`/inspections/${id}/areas/outside`)}
      >
        <div className="area-icon">
          <Grid size={24} />
        </div>
        <div className="area-info">
          <h3>Outside</h3>
          <p>{outsideLocations} locations, {outsideFindings} findings</p>
        </div>
        <ChevronRight size={20} className="area-chevron" />
      </Card>
    </div>
  );
};

export default InspectionMain;