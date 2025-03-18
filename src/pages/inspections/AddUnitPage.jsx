// src/pages/inspections/AddUnitPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Save, 
  ArrowLeft,
  AlertCircle,
  X,
  Check
} from 'lucide-react';

const AddUnitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unitName, setUnitName] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
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
    if (!unitName.trim()) {
      setError('Please enter a unit name or number');
      return;
    }
    
    try {
      setSaving(true);
      
      // Check if a unit with the same name already exists
      const exists = inspection.areas?.some(
        area => area.areaType === 'unit' && area.name.toLowerCase() === unitName.trim().toLowerCase()
      );
      
      if (exists) {
        setError(`A unit named "${unitName}" already exists`);
        setSaving(false);
        return;
      }
      
      // Create a new unit area
      const newUnit = {
        id: `unit-${Date.now()}`,
        name: unitName.trim(),
        areaType: 'unit',
        type: 'unit',
        findings: [],
        createdAt: new Date().toISOString()
      };
      
      // Update the inspection with the new unit
      const updatedAreas = [...(inspection.areas || []), newUnit];
      await updateInspection(id, { areas: updatedAreas });
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      // Clear form
      setUnitName('');
      setError('');
      setSaving(false);
      
      // Navigate to the new unit
      navigate(`/inspections/${id}/units/${newUnit.id}`);
    } catch (error) {
      console.error("Error saving unit:", error);
      setError('Error saving unit');
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
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Add Unit</h1>
        </div>
        
        <button
          className="p-2 rounded-full hover:bg-gray-100 text-green-500"
          onClick={handleSave}
          disabled={saving || !unitName.trim()}
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
        <div className="bg-blue-50 rounded-xl p-4 flex items-start">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <Home size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-blue-800">Adding a New Unit</h2>
            <p className="text-sm text-blue-600">
              Enter the unit number or identifier for the residential unit you are inspecting.
            </p>
          </div>
        </div>
      </div>
      
      {/* Unit Form */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Name/Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full p-3 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="e.g., 101, A1, or Suite 303"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            autoFocus
          />
          <p className="mt-2 text-sm text-gray-500">
            This identifier will be used throughout inspection reports.
          </p>
        </div>
      </div>
      
      {/* Pre-filled units suggestions - could be populated from property data if available */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Units</h3>
        <div className="flex flex-wrap gap-2">
          {['101', '102', '103', '201', '202', '203'].map(unit => (
            <button
              key={unit}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              onClick={() => setUnitName(unit)}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 px-4 bg-gray-100 rounded-lg font-medium flex items-center justify-center"
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            <X size={20} className="mr-2" /> Cancel
          </button>
          <button 
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center disabled:bg-blue-300"
            onClick={handleSave}
            disabled={saving || !unitName.trim()}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" /> Save Unit
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-32 left-0 right-0 mx-auto w-max px-4 py-2 bg-green-500 text-white rounded-full shadow-lg flex items-center">
          <Check size={18} className="mr-2" />
          Unit added successfully!
        </div>
      )}
    </div>
  );
};

export default AddUnitPage;