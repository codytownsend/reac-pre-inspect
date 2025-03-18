// src/pages/inspections/AddOutsideAreaPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Grid, 
  Save, 
  Home,
  ParkingSquare,
  TreePine,
  Wind,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const AddOutsideAreaPage = () => {
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
        id: `outside-${Date.now()}`,
        name: areaName.trim(),
        areaType: 'outside',
        type: areaType,
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Update the inspection with the new area
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate to the new area
      navigate(`/inspections/${id}/outside/${newArea.id}`);
    } catch (error) {
      console.error("Error saving area:", error);
      setError('Error saving area');
      setSaving(false);
    }
  };
  
  // Area type options
  const areaTypes = [
    { id: 'building', name: 'Building Exterior', icon: <Home size={24} /> },
    { id: 'parking', name: 'Parking Lot', icon: <ParkingSquare size={24} /> },
    { id: 'grounds', name: 'Grounds/Landscaping', icon: <TreePine size={24} /> },
    { id: 'playground', name: 'Playground', icon: <Wind size={24} /> },
    { id: 'walkway', name: 'Walkway/Path', icon: <Grid size={24} /> },
    { id: 'fence', name: 'Fence/Gate', icon: <Grid size={24} /> },
    { id: 'roof', name: 'Roof', icon: <Home size={24} /> },
    { id: 'trash', name: 'Trash Area', icon: <Grid size={24} /> },
    { id: 'other', name: 'Other Outside Area', icon: <Grid size={24} /> }
  ];
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading inspection...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(`/inspections/${id}/areas/outside`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Add Outside Area</h1>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Instructions Card */}
      <div className="p-4">
        <div className="modern-card bg-green-50">
          <div className="modern-card__content flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Grid size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-green-800">Add a New Outside Area</h2>
              <p className="text-sm text-green-600">
                Enter a name and select the type of outside area. After saving, you'll be able to add findings for this area.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Area Form */}
      <div className="p-4">
        <div className="modern-card mb-4">
          <div className="modern-card__content">
            <div className="finding-form__group">
              <label htmlFor="areaName" className="finding-form__label">
                Area Name
              </label>
              <input
                type="text"
                id="areaName"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g., North Parking Lot, Main Building Exterior"
                className="finding-form__input"
              />
            </div>
          </div>
        </div>
        
        <div className="modern-card">
          <div className="modern-card__content">
            <label className="finding-form__label mb-4">
              Area Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {areaTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`flex items-center p-3 rounded-lg border ${
                    areaType === type.id 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:bg-green-50'
                  }`}
                  onClick={() => setAreaType(type.id)}
                >
                  <div className={`p-2 rounded-full mr-2 ${
                    areaType === type.id ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {type.icon}
                  </div>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={() => navigate(`/inspections/${id}/areas/outside`)}
          >
            Cancel
          </button>
          
          <button 
            className="modern-btn modern-btn--green"
            onClick={handleSave}
            disabled={saving || !areaName.trim() || !areaType}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" /> Save Area
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOutsideAreaPage;