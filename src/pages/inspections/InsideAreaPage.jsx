// src/pages/inspections/InsideAreaPage.jsx
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
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  AlertCircle,
  Coffee,
  Tool,
  Users,
  DoorOpen
} from 'lucide-react';

// Helper to get icon for common area type
const getAreaIcon = (areaType) => {
  switch (areaType) {
    case 'hallway':
      return <DoorOpen size={20} className="text-purple-600" />;
    case 'laundry':
      return <Tool size={20} className="text-purple-600" />;
    case 'community':
      return <Users size={20} className="text-purple-600" />;
    case 'office':
      return <Coffee size={20} className="text-purple-600" />;
    default:
      return <Building size={20} className="text-purple-600" />;
  }
};

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
  
  // Common area types for the quick add section
  const commonAreaTypes = [
    { type: 'hallway', label: 'Hallway', icon: <DoorOpen size={24} /> },
    { type: 'laundry', label: 'Laundry', icon: <Tool size={24} /> },
    { type: 'community', label: 'Community Room', icon: <Users size={24} /> },
    { type: 'office', label: 'Office', icon: <Coffee size={24} /> }
  ];
  
  return (
    <div className="container pb-16">
      <Header 
        title="Inside Areas" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Instructions Card */}
      <Card className="mb-4 bg-purple-50">
        <div className="flex items-start">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <Building size={24} className="text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-purple-800">Inside Areas</h2>
            <p className="text-sm text-purple-600">
              Add common areas inside the building such as hallways, lobbies, laundry rooms, 
              community spaces, etc. Tap on an area to view or add findings.
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
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-purple-50"
              onClick={() => navigate(`/inspections/${id}/inside/add?type=${areaType.type}`)}
            >
              <div className="bg-purple-100 p-2 rounded-full mb-1">
                {areaType.icon}
              </div>
              <span className="text-xs">{areaType.label}</span>
            </button>
          ))}
        </div>
      </Card>
      
      {/* Inside Areas List */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Inside Areas ({insideAreas.length})</h2>
          <Button 
            variant="primary"
            onClick={handleAddArea}
          >
            <Plus size={16} className="mr-1" /> Add Area
          </Button>
        </div>
        
        {insideAreas.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-gray-500 mb-4">No inside areas have been added yet.</p>
            <Button 
              variant="primary"
              onClick={handleAddArea}
            >
              <Plus size={16} className="mr-1" /> Add First Area
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {insideAreas.map((area) => (
              <Card 
                key={area.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/inspections/${id}/inside/${area.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
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

export default InsideAreaPage;