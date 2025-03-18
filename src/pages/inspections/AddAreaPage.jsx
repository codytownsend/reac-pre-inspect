// src/pages/inspections/AddAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Building, 
  Grid, 
  Save, 
  X, 
  Check,
  AlertCircle,
  ArrowLeft,
  ParkingSquare,
  TreePine,
  Wind,
  DoorOpen,
  Wrench,
  Users,
  Coffee
} from 'lucide-react';

const AddAreaPage = () => {
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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Determine area category type from URL path
  const areaCategoryType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
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
  
  // Configuration based on area category type
  const config = {
    unit: {
      title: 'Add Unit',
      icon: <Home size={24} />,
      color: 'blue',
      backPath: `/inspections/${id}/areas/units`,
      description: 'Enter the unit number or identifier for the residential unit you are inspecting.',
      showTypeSelector: false,
      placeholder: 'e.g., 101, A1, or Suite 303',
      areaTypes: [],
      suggestions: ['101', '102', '103', '201', '202', '203']
    },
    inside: {
      title: 'Add Inside Area',
      icon: <Building size={24} />,
      color: 'purple',
      backPath: `/inspections/${id}/areas/inside`,
      description: 'Enter a name and select the type of inside area you\'re inspecting.',
      showTypeSelector: true,
      placeholder: 'e.g., Main Hallway, Laundry Room, Lobby',
      areaTypes: [
        { id: 'hallway', name: 'Hallway/Corridor', icon: <DoorOpen size={24} /> },
        { id: 'laundry', name: 'Laundry Room', icon: <Wrench size={24} /> },
        { id: 'community', name: 'Community Room', icon: <Users size={24} /> },
        { id: 'office', name: 'Office/Admin Area', icon: <Coffee size={24} /> },
        { id: 'mechanical', name: 'Mechanical Room', icon: <Wrench size={24} /> },
        { id: 'storage', name: 'Storage Area', icon: <Building size={24} /> },
        { id: 'stairwell', name: 'Stairwell', icon: <Building size={24} /> },
        { id: 'elevator', name: 'Elevator', icon: <Building size={24} /> },
        { id: 'other', name: 'Other Inside Area', icon: <Building size={24} /> }
      ]
    },
    outside: {
      title: 'Add Outside Area',
      icon: <Grid size={24} />,
      color: 'green',
      backPath: `/inspections/${id}/areas/outside`,
      description: 'Enter a name and select the type of outside area. After saving, you\'ll be able to add findings for this area.',
      showTypeSelector: true,
      placeholder: 'e.g., North Parking Lot, Main Building Exterior',
      areaTypes: [
        { id: 'building', name: 'Building Exterior', icon: <Home size={24} /> },
        { id: 'parking', name: 'Parking Lot', icon: <ParkingSquare size={24} /> },
        { id: 'grounds', name: 'Grounds/Landscaping', icon: <TreePine size={24} /> },
        { id: 'playground', name: 'Playground', icon: <Wind size={24} /> },
        { id: 'walkway', name: 'Walkway/Path', icon: <Grid size={24} /> },
        { id: 'fence', name: 'Fence/Gate', icon: <Grid size={24} /> },
        { id: 'roof', name: 'Roof', icon: <Home size={24} /> },
        { id: 'trash', name: 'Trash Area', icon: <Grid size={24} /> },
        { id: 'other', name: 'Other Outside Area', icon: <Grid size={24} /> }
      ]
    }
  }[areaCategoryType];
  
  const handleSave = async () => {
    if (!areaName.trim()) {
      setError('Please enter an area name');
      return;
    }
    
    if (config.showTypeSelector && !areaType) {
      setError('Please select an area type');
      return;
    }
    
    try {
      setSaving(true);
      
      // Check if an area with the same name already exists
      const exists = inspection.areas?.some(
        area => area.areaType === areaCategoryType && area.name.toLowerCase() === areaName.trim().toLowerCase()
      );
      
      if (exists) {
        setError(`An area named "${areaName}" already exists`);
        setSaving(false);
        return;
      }
      
      // Create a new area
      const newArea = {
        id: `${areaCategoryType}-${Date.now()}`,
        name: areaName.trim(),
        areaType: areaCategoryType,
        type: areaType || undefined,
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Update the inspection with the new area
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(id, { areas: updatedAreas });
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      // Navigate to the new area
      navigate(`/inspections/${id}/${areaCategoryType}/${newArea.id}`);
    } catch (error) {
      console.error("Error saving area:", error);
      setError('Error saving area');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection...</p>
        </div>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Inspection Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The inspection you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium"
            onClick={() => navigate('/inspections')}
          >
            Back to Inspections
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(config.backPath)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">{config.title}</h1>
        </div>
        
        <button
          className={`p-2 rounded-full hover:bg-gray-100 ${
            saving || !areaName.trim() || (config.showTypeSelector && !areaType) ? 'text-gray-300' : `text-${config.color}-500`
          }`}
          onClick={handleSave}
          disabled={saving || !areaName.trim() || (config.showTypeSelector && !areaType)}
        >
          <Save size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Info Card */}
      <div className="p-4">
        <div className={`bg-${config.color}-50 rounded-xl p-4 flex items-start`}>
          <div className={`bg-${config.color}-100 p-2 rounded-full mr-3`}>
            {config.icon}
          </div>
          <div>
            <h2 className={`font-bold text-${config.color}-800`}>{config.title}</h2>
            <p className={`text-sm text-${config.color}-600`}>
              {config.description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Area Form */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {areaCategoryType.charAt(0).toUpperCase() + areaCategoryType.slice(1)} Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full p-3 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-${config.color}-500`}
            placeholder={config.placeholder}
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            autoFocus
          />
          {areaCategoryType === 'unit' && (
            <p className="text-sm text-gray-500 mt-2">
              This identifier will be used throughout inspection reports.
            </p>
          )}
        </div>
        
        {/* Pre-filled suggestions for units */}
        {areaCategoryType === 'unit' && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Units</h3>
            <div className="flex flex-wrap gap-2">
              {config.suggestions.map(unit => (
                <button
                  key={unit}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  onClick={() => setAreaName(unit)}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Area Type Selector */}
        {config.showTypeSelector && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Area Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {config.areaTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`p-3 rounded-lg border flex items-center ${
                    areaType === type.id 
                      ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700` 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setAreaType(type.id)}
                >
                  <div className={`p-2 rounded-full mr-2 ${
                    areaType === type.id ? `bg-${config.color}-100` : 'bg-gray-100'
                  }`}>
                    {type.icon}
                  </div>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 px-4 bg-gray-100 rounded-lg font-medium flex items-center justify-center"
            onClick={() => navigate(config.backPath)}
          >
            <X size={20} className="mr-2" /> Cancel
          </button>
          <button 
            className={`flex-1 py-3 px-4 bg-${config.color}-500 text-white rounded-lg font-medium flex items-center justify-center disabled:bg-${config.color}-300`}
            onClick={handleSave}
            disabled={saving || !areaName.trim() || (config.showTypeSelector && !areaType)}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" /> Save {areaCategoryType.charAt(0).toUpperCase() + areaCategoryType.slice(1)}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-32 left-0 right-0 mx-auto w-max px-4 py-2 bg-green-500 text-white rounded-full shadow-lg flex items-center">
          <Check size={18} className="mr-2" />
          {areaCategoryType.charAt(0).toUpperCase() + areaCategoryType.slice(1)} added successfully!
        </div>
      )}
    </div>
  );
};

export default AddAreaPage;