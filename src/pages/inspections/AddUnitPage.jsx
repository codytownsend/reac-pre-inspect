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
    // Same effect code as before
    // ...
  }, [id, getInspection, navigate]);
  
  const handleSave = async () => {
    // Same function as before
    // ...
  };
  
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
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Add Unit</h1>
        </div>
        
        <button
          className={`app-bar__action-button ${!unitName.trim() ? '' : 'app-bar__action-button--primary'}`}
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
      <div className="finding-form p-4">
        <label className="finding-form__label">
          Unit Name/Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="finding-form__input"
          placeholder="e.g., 101, A1, or Suite 303"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          autoFocus
        />
        <p className="text-sm text-gray-500 mt-2">
          This identifier will be used throughout inspection reports.
        </p>
      </div>
      
      {/* Pre-filled units suggestions */}
      <div className="p-4">
        <h3 className="finding-form__label mb-2">Suggested Units</h3>
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
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            <X size={20} className="mr-2" /> Cancel
          </button>
          <button 
            className="modern-btn modern-btn--primary"
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
        <div className="modern-toast modern-toast--success">
          <Check size={18} className="mr-2" />
          Unit added successfully!
        </div>
      )}
    </div>
  );
};

export default AddUnitPage;