// src/pages/inspections/OutsideAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { 
  Grid, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  AlertCircle,
  ParkingSquare,
  Home,
  TreePine,
  Wind
} from 'lucide-react';

// Helper to get icon for outside area type
const getAreaIcon = (areaType) => {
  switch (areaType) {
    case 'parking':
      return <ParkingSquare size={20} className="text-green-600" />;
    case 'building':
      return <Home size={20} className="text-green-600" />;
    case 'grounds':
      return <TreePine size={20} className="text-green-600" />;
    case 'playground':
      return <Wind size={20} className="text-green-600" />;
    default:
      return <Grid size={20} className="text-green-600" />;
  }
};

const OutsideAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [outsideAreas, setOutsideAreas] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Filter outside areas
        const areas = inspectionData.areas 
          ? inspectionData.areas.filter(area => area.areaType === 'outside')
          : [];
        
        setOutsideAreas(areas);
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
    navigate(`/inspections/${id}/outside/add`);
  };
  
  const getSeverityIcon = (area) => {
    if (!area.findings || area.findings.length === 0) return null;
    
    const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
    if (hasLifeThreatening) {
      return <AlertCircle size={18} className="text-red-500" />;
    }
    
    const hasSevere = area.findings.some(f => f.severity === 'severe');
    if (hasSevere) {
      return <AlertTriangle size={18} className="text-orange-500" />;
    }
    
    const hasModerate = area.findings.some(f => f.severity === 'moderate');
    if (hasModerate) {
      return <Clock size={18} className="text-yellow-500" />;
    }
    
    return <CheckCircle size={18} className="text-green-500" />;
  };
  
  if (loading) {
    return <Loading message="Loading outside areas..." />;
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
  
  // Outside area types for the quick add section
  const commonAreaTypes = [
    { type: 'building', label: 'Building Exterior', icon: <Home size={24} /> },
    { type: 'parking', label: 'Parking Lot', icon: <ParkingSquare size={24} /> },
    { type: 'grounds', label: 'Grounds', icon: <TreePine size={24} /> },
    { type: 'playground', label: 'Playground', icon: <Wind size={24} /> }
  ];
  
  return (
    <div className="container pb-16">
      <Header 
        title="Outside Areas" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Instructions Card */}
      <Card className="mb-4 bg-green-50">
        <div className="flex items-start">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <Grid size={24} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-green-800">Outside Areas</h2>
            <p className="text-sm text-green-600">
              Add exterior areas including building exteriors, site, grounds, parking lots, 
              playgrounds, etc. Tap on an area to view or add findings.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Quick Add Section */}
      <Card className="mb-4">
        <h3 className="font-bold mb-3">Quick Add</h3>
        <div className="grid grid-cols-4 gap-2">
          {commonAreaTypes.map((areaType) => (
            <button
              key={areaType.type}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-green-50"
              onClick={() => navigate(`/inspections/${id}/outside/add?type=${areaType.type}`)}
            >
              <div className="bg-green-100 p-2 rounded-full mb-1">
                {areaType.icon}
              </div>
              <span className="text-xs">{areaType.label}</span>
            </button>
          ))}
        </div>
      </Card>
      
      {/* Outside Areas List */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Outside Areas ({outsideAreas.length})</h2>
          <Button 
            variant="primary"
            onClick={handleAddArea}
          >
            <Plus size={16} className="mr-1" /> Add Area
          </Button>
        </div>
        
        {outsideAreas.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-gray-500 mb-4">No outside areas have been added yet.</p>
            <Button 
              variant="primary"
              onClick={handleAddArea}
            >
              <Plus size={16} className="mr-1" /> Add First Area
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {outsideAreas.map((area) => (
              <Card 
                key={area.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/inspections/${id}/outside/${area.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      {getAreaIcon(area.type)}
                    </div>
                    <div>
                      <h3 className="font-bold">{area.name}</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {area.findings ? area.findings.length : 0} findings
                        </span>
                        {getSeverityIcon(area)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/inspections/${id}`)}
          >
            Back to Inspection
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleAddArea}
          >
            <Plus size={16} className="mr-1" /> Add Area
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutsideAreaPage;