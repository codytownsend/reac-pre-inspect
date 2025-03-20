// src/pages/inspections/AddAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { getAreaUrlPath } from '../../utils/areaUtils';
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
  Coffee,
  Plus
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
  
  // Configuration based on area category type
  const config = {
    unit: {
      title: 'Add Unit',
      icon: Home,
      color: 'blue',
      backPath: `/inspections/${id}/units`,
      description: 'Enter the unit number or identifier for the residential unit you are inspecting.',
      placeholder: 'e.g., 101, A1, or Suite 303',
    },
    inside: {
      title: 'Add Inside Area',
      icon: Building,
      color: 'purple',
      backPath: `/inspections/${id}/inside`,
      description: 'Select the type of inside area you\'re inspecting.',
      quickAdd: [
        { id: 'hallway', name: 'Hallway', icon: DoorOpen },
        { id: 'laundry', name: 'Laundry', icon: Wrench },
        { id: 'community', name: 'Community Room', icon: Users },
        { id: 'office', name: 'Office', icon: Coffee },
        { id: 'elevator', name: 'Elevator', icon: Building },
      ],
      areaTypes: [
        { id: 'hallway', name: 'Hallway / Corridor', icon: DoorOpen },
        { id: 'laundry', name: 'Laundry Room', icon: Wrench },
        { id: 'community', name: 'Community Room', icon: Users },
        { id: 'office', name: 'Office / Admin Area', icon: Coffee },
        { id: 'mechanical', name: 'Mechanical Room', icon: Wrench },
        { id: 'storage', name: 'Storage Area', icon: Building },
        { id: 'stairwell', name: 'Stairwell', icon: Building },
        { id: 'elevator', name: 'Elevator', icon: Building },
        { id: 'other', name: 'Other Inside Area', icon: Building }
      ]
    },
    outside: {
      title: 'Add Outside Area',
      icon: Grid,
      color: 'green',
      backPath: `/inspections/${id}/outside`,
      description: 'Select the type of outside area you want to inspect.',
      areaTypes: [
        { id: 'building', name: 'Building Exterior', icon: Home },
        { id: 'parking', name: 'Parking Lot', icon: ParkingSquare },
        { id: 'grounds', name: 'Grounds / Landscaping', icon: TreePine },
        { id: 'playground', name: 'Playground', icon: Wind },
        { id: 'walkway', name: 'Walkway / Path', icon: Grid },
        { id: 'fence', name: 'Fence / Gate', icon: Grid },
        { id: 'roof', name: 'Roof', icon: Home },
        { id: 'trash', name: 'Trash Area', icon: Grid },
        { id: 'other', name: 'Other Outside Area', icon: Grid }
      ]
    }
  };
  
  // Parse type from query string if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type');
    if (typeParam) {
      setAreaType(typeParam);
      
      // For inside/outside areas, auto-generate a name based on the type
      if (areaCategoryType !== 'unit') {
        const typeConfig = config[areaCategoryType].areaTypes.find(t => t.id === typeParam);
        if (typeConfig) {
          setAreaName(typeConfig.name);
        }
      }
    }
  }, [location.search, areaCategoryType]);
  
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
        setError('Error loading inspection details: ' + (error.message || ''));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, navigate]);
  
  const handleSave = async () => {
    // For unit areas, we need a name
    if (areaCategoryType === 'unit' && !areaName.trim()) {
      setError('Please enter a unit number');
      return;
    }
    
    // For inside/outside areas, we need a type
    if (areaCategoryType !== 'unit' && !areaType) {
      setError('Please select an area type');
      return;
    }
    
    try {
      setSaving(true);
      
      // For units, check for duplicate names
      if (areaCategoryType === 'unit') {
        const exists = inspection.areas?.some(
          area => area.areaType === 'unit' && area.name.toLowerCase() === areaName.trim().toLowerCase()
        );
        
        if (exists) {
          setError(`Unit "${areaName}" already exists`);
          setSaving(false);
          return;
        }
      }
      
      // Get name for area
      let finalAreaName = areaName.trim();
      
      // For inside/outside areas, use the type name if no name provided
      if (areaCategoryType !== 'unit' && !finalAreaName && areaType) {
        const typeConfig = config[areaCategoryType].areaTypes.find(t => t.id === areaType);
        if (typeConfig) {
          finalAreaName = typeConfig.name;
        } else {
          finalAreaName = areaType.charAt(0).toUpperCase() + areaType.slice(1);
        }
      }
      
      // Create a new area
      let newArea = {
        id: `area-${Date.now()}`,
        name: finalAreaName,
        areaType: areaCategoryType,
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Only add type if it has a value
      if (areaType) {
        newArea.type = areaType;
      }
      
      // Update the inspection with the new area
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state too
      setInspection({
        ...inspection,
        areas: updatedAreas
      });
      
      // Show success toast
      setShowSuccessToast(true);
      
      // Navigate to the new area after a short delay
      const urlPathType = getAreaUrlPath(areaCategoryType);
      setTimeout(() => {
        navigate(`/inspections/${id}/${urlPathType}/${newArea.id}`);
      }, 300); // Slightly longer delay to ensure state updates
    } catch (error) {
      console.error("Error saving area:", error);
      setError('Error saving area: ' + (error.message || ''));
      setSaving(false);
    }
  };
  
  const handleQuickAdd = (typeId, typeName) => {
    setAreaType(typeId);
    setAreaName(typeName);
    
    // Auto-save after a short delay to mimic a quick-add experience
    setSaving(true);
    setTimeout(() => {
      handleSave();
    }, 300);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
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
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium"
            onClick={() => navigate('/inspections')}
          >
            Back to Inspections
          </button>
        </div>
      </div>
    );
  }
  
  // Get the appropriate icon component
  const IconComponent = config[areaCategoryType].icon;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => navigate(config[areaCategoryType].backPath)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{config[areaCategoryType].title}</h1>
        </div>
        
        {/* Add save button to app bar for inside/outside areas */}
        {areaCategoryType !== 'unit' && (
          <button
            className={`p-2 rounded-full hover:bg-gray-100 ${
              saving || !areaType ? 'text-gray-300' : `text-${config[areaCategoryType].color}-500`
            }`}
            onClick={handleSave}
            disabled={saving || !areaType}
          >
            <Save size={20} />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Info Card */}
      <div className="p-4">
        <div className={`bg-${config[areaCategoryType].color}-50 rounded-xl p-4 flex items-start`}>
          <div className={`bg-${config[areaCategoryType].color}-100 p-2 rounded-full mr-3`}>
            <IconComponent className={`text-${config[areaCategoryType].color}-500`} size={24} />
          </div>
          <div>
            <h2 className={`font-bold text-${config[areaCategoryType].color}-800`}>{config[areaCategoryType].title}</h2>
            <p className={`text-sm text-${config[areaCategoryType].color}-600`}>
              {config[areaCategoryType].description}
            </p>
          </div>
        </div>
      </div>
      
      {/* For units, show the unit name input ONLY */}
      {areaCategoryType === 'unit' && (
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-3 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-${config[areaCategoryType].color}-500`}
              placeholder={config[areaCategoryType].placeholder}
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
      
      {/* Inside/Outside Type Selector Grid */}
      {areaCategoryType !== 'unit' && (
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-2 gap-3">
              {config[areaCategoryType].areaTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`p-3 rounded-lg border flex items-center ${
                      areaType === type.id 
                        ? `border-${config[areaCategoryType].color}-500 bg-${config[areaCategoryType].color}-50 text-${config[areaCategoryType].color}-700` 
                        : 'border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      setAreaType(type.id);
                      setAreaName(type.name);
                    }}
                  >
                    <div className={`p-2 rounded-full mr-2 ${
                      areaType === type.id ? `bg-${config[areaCategoryType].color}-100` : 'bg-gray-100'
                    }`}>
                      <TypeIcon size={24} />
                    </div>
                    <span>{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg font-medium flex items-center justify-center"
            onClick={() => navigate(config[areaCategoryType].backPath)}
          >
            <X size={20} className="mr-2" /> Cancel
          </button>
          
          <button 
            className={`flex-1 py-3 px-4 bg-gray-800 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-50`}
            onClick={handleSave}
            disabled={saving || (areaCategoryType === 'unit' ? !areaName.trim() : !areaType)}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Plus size={20} className="mr-2" /> 
                Add {areaCategoryType === 'unit' ? 'Unit' : areaCategoryType === 'inside' ? 'Inside Area' : 'Outside Area'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-32 left-0 right-0 mx-auto w-max px-4 py-2 bg-gray-800 text-white rounded-full shadow-lg flex items-center">
          <Check size={18} className="mr-2" />
          {areaCategoryType.charAt(0).toUpperCase() + areaCategoryType.slice(1)} added successfully!
        </div>
      )}
    </div>
  );
};

export default AddAreaPage;