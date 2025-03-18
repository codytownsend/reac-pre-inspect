// src/pages/inspections/AddInsideAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import { 
  Building, 
  Save, 
  DoorOpen,
  Droplet,
  Wrench,
  Users,
  Coffee
} from 'lucide-react';

const AddInsideAreaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaType, setAreaType] = useState('');
  
  // Parse type from query string if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type');
    if (typeParam) {
      setAreaType(typeParam);
    }
  }, [location.search]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleSave = async () => {
    if (!areaName.trim()) {
      setError('Please enter an area name');
      return;
    }
    
    if (!areaType) {
      setError('Please select an area type');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create a new area
      const newArea = {
        id: `inside-${Date.now()}`,
        name: areaName.trim(),
        areaType: 'inside',
        type: areaType,
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Update the inspection with the new area
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate to the new area
      navigate(`/inspections/${id}/inside/${newArea.id}`);
    } catch (error) {
      console.error("Error saving area:", error);
      setError('Error saving area');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Loading message="Loading inspection..." />;
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
  
  // Area type options
  const areaTypes = [
    { id: 'hallway', name: 'Hallway/Corridor', icon: <DoorOpen size={24} /> },
    { id: 'laundry', name: 'Laundry Room', icon: <Droplet size={24} /> },
    { id: 'community', name: 'Community Room', icon: <Users size={24} /> },
    { id: 'office', name: 'Office/Admin Area', icon: <Coffee size={24} /> },
    { id: 'mechanical', name: 'Mechanical Room', icon: <Wrench size={24} /> },
    { id: 'storage', name: 'Storage Area', icon: <Building size={24} /> },
    { id: 'stairwell', name: 'Stairwell', icon: <Building size={24} /> },
    { id: 'elevator', name: 'Elevator', icon: <Building size={24} /> },
    { id: 'other', name: 'Other Inside Area', icon: <Building size={24} /> }
  ];
  
  return (
    <div className="container pb-16">
      <Header 
        title="Add Inside Area" 
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
            <h2 className="font-bold text-purple-800">Add a New Inside Area</h2>
            <p className="text-sm text-purple-600">
              Enter a name and select the type of inside area. After saving, you'll be able to add findings for this area.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Area Form */}
      <Card className="mb-4">
        <div className="mb-4">
          <label htmlFor="areaName" className="block text-sm font-medium text-gray-700 mb-1">
            Area Name
          </label>
          <input
            type="text"
            id="areaName"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="e.g., Main Hallway, Laundry Room, Lobby"
            className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {areaTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`flex items-center p-3 rounded-lg border ${
                  areaType === type.id 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:bg-purple-50'
                }`}
                onClick={() => setAreaType(type.id)}
              >
                <div className={`p-2 rounded-full mr-2 ${
                  areaType === type.id ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {type.icon}
                </div>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/inspections/${id}/areas/inside`)}
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving || !areaName.trim() || !areaType}
          >
            {saving ? 'Saving...' : (
              <>
                <Save size={16} className="mr-1" /> Save Area
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddInsideAreaPage;