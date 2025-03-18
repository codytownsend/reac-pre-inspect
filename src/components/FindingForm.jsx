// src/components/FindingForm.jsx
import React, { useState, useEffect } from 'react';
import { useInspection } from '../context/InspectionContext';
import FindingPhotoCapture from './FindingPhotoCapture';
import { 
  Camera, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

/**
 * A standardized form for adding and editing findings across all area types
 * 
 * @param {Object} props
 * @param {string} props.inspectionId - The ID of the inspection
 * @param {string} props.areaId - The ID of the area
 * @param {string} props.areaType - The type of area ('unit', 'inside', or 'outside')
 * @param {Object} props.initialFinding - Initial finding data for editing (null for new findings)
 * @param {Function} props.onSave - Callback when finding is saved
 * @param {Function} props.onCancel - Callback when form is canceled
 * @param {Function} props.onDelete - Callback for deleting a finding (only used in edit mode)
 */
const FindingForm = ({ 
  inspectionId, 
  areaId, 
  areaType, 
  initialFinding = null, 
  onSave, 
  onCancel,
  onDelete = null
}) => {
  const { nspireCategories } = useInspection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!initialFinding;
  
  // Form data
  const [currentStep, setCurrentStep] = useState(initialFinding ? 3 : 1); // Skip category/subcategory if editing
  const [category, setCategory] = useState(initialFinding?.category || '');
  const [subcategory, setSubcategory] = useState(initialFinding?.subcategory || '');
  const [deficiency, setDeficiency] = useState(initialFinding?.deficiency || '');
  const [severity, setSeverity] = useState(initialFinding?.severity || 'moderate');
  const [notes, setNotes] = useState(initialFinding?.notes || '');
  const [repairStatus, setRepairStatus] = useState(initialFinding?.status || 'open');
  const [photos, setPhotos] = useState(initialFinding?.photos || []);
  
  // Filter categories based on area type
  const getFilteredCategories = () => {
    if (areaType === 'unit') {
      return ['unit', 'bathroom', 'kitchen', 'electrical', 'fire_life_safety'];
    } else if (areaType === 'inside') {
      return ['buildingSystems', 'commonAreas', 'electrical', 'fire_life_safety'];
    } else if (areaType === 'outside') {
      return ['site', 'buildingExterior', 'structural', 'site_grounds'];
    }
    return Object.keys(nspireCategories);
  };

  const filteredCategories = getFilteredCategories();
  
  const handlePhotoCapture = (photoData) => {
    const newPhoto = {
      id: Date.now().toString(),
      data: photoData,
      timestamp: new Date().toISOString()
    };
    
    setPhotos(prev => [...prev, newPhoto]);
    setShowPhotoCapture(false);
  };
  
  const handleRemovePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };
  
  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setCurrentStep(2);
  };
  
  const handleSubcategorySelect = (selectedSubcategory) => {
    setSubcategory(selectedSubcategory);
    setCurrentStep(3);
  };
  
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };
  
  const handleSave = () => {
    if (!category || !subcategory || !deficiency.trim()) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create finding object
      const findingData = {
        ...(initialFinding || {}),
        id: initialFinding?.id || `finding-${Date.now()}`,
        area: areaType,
        areaId: areaId,
        category: category,
        subcategory: subcategory,
        deficiency: deficiency,
        severity: severity,
        notes: notes,
        status: repairStatus || 'open',
        photos: photos,
        ...(initialFinding 
          ? { updatedAt: new Date().toISOString() } 
          : { createdAt: new Date().toISOString() })
      };
      
      // Call save callback
      onSave(findingData);
      
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
      setLoading(false);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(initialFinding.id);
    }
  };
  
  // Get severity details
  const getSeverityDetails = (severityLevel) => {
    switch (severityLevel) {
      case 'lifeThreatening':
        return {
          icon: <AlertCircle size={20} />,
          name: 'Life Threatening',
          color: 'bg-red-500',
          text: 'text-red-500',
          border: 'border-red-500',
          bg: 'bg-red-50',
          timeframe: '24 Hours',
        };
      case 'severe':
        return {
          icon: <AlertTriangle size={20} />,
          name: 'Severe',
          color: 'bg-orange-500',
          text: 'text-orange-500',
          border: 'border-orange-500',
          bg: 'bg-orange-50',
          timeframe: areaType === 'unit' ? '30 Days' : '24 Hours',
        };
      case 'moderate':
        return {
          icon: <Clock size={20} />,
          name: 'Moderate',
          color: 'bg-yellow-500',
          text: 'text-yellow-500',
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          timeframe: '30 Days',
        };
      case 'low':
        return {
          icon: <CheckCircle size={20} />,
          name: 'Low',
          color: 'bg-blue-500',
          text: 'text-blue-500',
          border: 'border-blue-500',
          bg: 'bg-blue-50',
          timeframe: '60 Days',
        };
      default:
        return {
          icon: <Clock size={20} />,
          name: 'Moderate',
          color: 'bg-yellow-500',
          text: 'text-yellow-500',
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          timeframe: '30 Days',
        };
    }
  };
  
  // Get current severity details
  const severityDetails = getSeverityDetails(severity);
  
  // Category Selection View (Step 1)
  if (currentStep === 1) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4 bg-white sticky top-0 z-10 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">1</div>
            <h2 className="text-xl font-bold">Select Category</h2>
          </div>
          <div className="flex mt-2">
            <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
          </div>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-auto p-4">
          <div className="modern-list">
            {filteredCategories.map(categoryKey => {
              const category = nspireCategories[categoryKey];
              if (!category) return null;
              
              return (
                <div
                  key={categoryKey}
                  className="modern-list-item modern-list-item--interactive"
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <div className="modern-list-item__content">
                    <div className="modern-list-item__details">
                      <h3 className="modern-list-item__title">{category.name}</h3>
                      <p className="modern-list-item__subtitle">{category.subcategories.length} subcategories</p>
                    </div>
                    <div className="modern-list-item__action">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="modern-bottom-bar">
          <div className="modern-bottom-bar__content">
            <button 
              className="modern-btn modern-btn--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Subcategory Selection View (Step 2)
  if (currentStep === 2) {
    const categoryData = nspireCategories[category];
    
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4 bg-white sticky top-0 z-10 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">2</div>
            <h2 className="text-xl font-bold">Select Subcategory</h2>
          </div>
          <div className="flex mt-2">
            <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
            <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
          </div>
          <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
            Selected: <span className="font-medium">{categoryData?.name}</span>
          </div>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-auto p-4">
          <div className="modern-list">
            {categoryData?.subcategories.map(sub => (
              <div
                key={sub}
                className="modern-list-item modern-list-item--interactive"
                onClick={() => handleSubcategorySelect(sub)}
              >
                <div className="modern-list-item__content">
                  <div className="modern-list-item__details">
                    <h3 className="modern-list-item__title">{sub}</h3>
                  </div>
                  <div className="modern-list-item__action">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modern-bottom-bar">
          <div className="modern-bottom-bar__content">
            <button 
              className="modern-btn modern-btn--secondary"
              onClick={handleBackStep}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Finding Details View (Step 3)
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 bg-white sticky top-0 z-10 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">3</div>
          <h2 className="text-xl font-bold">Finding Details</h2>
        </div>
        <div className="flex mt-2">
          <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
          <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
          <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
        </div>
        {!isEditMode && (
          <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
            <span className="font-medium">{nspireCategories[category]?.name}: {subcategory}</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-4">
        <div className="finding-form">
          {/* Deficiency Description */}
          <div className="finding-form__group">
            <label className="finding-form__label">
              Deficiency Description *
            </label>
            <textarea
              value={deficiency}
              onChange={(e) => setDeficiency(e.target.value)}
              placeholder="Describe what's wrong..."
              rows={3}
              className="finding-form__textarea"
              required
            ></textarea>
          </div>
          
          {/* Severity Selection */}
          <div className="finding-form__group">
            <label className="finding-form__label">
              Severity
            </label>
            
            <div className="finding-form__select-group">
              {['lifeThreatening', 'severe', 'moderate', 'low'].map(severityLevel => {
                const details = getSeverityDetails(severityLevel);
                return (
                  <button
                    key={severityLevel}
                    type="button"
                    className={`finding-form__select-option ${
                      severity === severityLevel 
                        ? 'finding-form__select-option--selected' 
                        : ''
                    }`}
                    onClick={() => setSeverity(severityLevel)}
                  >
                    <div className={`finding-form__select-option-icon ${severity === severityLevel ? details.text : 'text-gray-400'}`}>
                      {details.icon}
                    </div>
                    <div className="finding-form__select-option-label">{details.name}</div>
                  </button>
                );
              })}
            </div>
            
            <div className={`finding-form__severity-indicator finding-form__severity-indicator--${
              severity === 'lifeThreatening' ? 'critical' : 
              severity === 'severe' ? 'serious' : 
              severity === 'moderate' ? 'moderate' : 'minor'
            }`}>
              <Clock size={16} className="finding-form__severity-icon" />
              Required repair timeframe: <span className="font-bold ml-1">{severityDetails.timeframe}</span>
              {areaType === 'unit' && 
                <span className="ml-1">
                  | {severity === 'low' ? 'Pass' : 'Fail'}
                </span>
              }
            </div>
          </div>
          
          {/* Repair Status (only for edit mode) */}
          {isEditMode && (
            <div className="finding-form__group">
              <label className="finding-form__label">
                Repair Status
              </label>
              <select
                value={repairStatus}
                onChange={(e) => setRepairStatus(e.target.value)}
                className="finding-form__select"
              >
                <option value="open">Open</option>
                <option value="scheduled">Scheduled</option>
                <option value="repaired">Repaired</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          )}
          
          {/* Notes */}
          <div className="finding-form__group">
            <label className="finding-form__label">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
              className="finding-form__textarea"
            ></textarea>
          </div>
          
          {/* Photos */}
          <div className="photo-upload-section">
            <div className="photo-upload-section__title">
              <label className="photo-upload-section__title-text">Photos</label>
              <button
                type="button"
                className="photo-upload-section__add-button"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Camera size={16} className="mr-1" /> 
                Add Photo
              </button>
            </div>
            
            {photos.length > 0 ? (
              <div className="photo-grid">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id || index} 
                    className="photo-thumbnail"
                  >
                    <img 
                      src={photo.data} 
                      alt={`Photo ${index+1}`} 
                    />
                    <button
                      type="button"
                      className="photo-thumbnail__remove"
                      onClick={() => handleRemovePhoto(photo.id || index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="photo-add-placeholder"
                  onClick={() => setShowPhotoCapture(true)}
                >
                  <Plus size={20} className="photo-add-placeholder-icon" />
                  <span className="photo-add-placeholder-text">Add</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="photo-add-placeholder w-full h-32"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Camera size={32} className="photo-add-placeholder-icon" />
                <span className="photo-add-placeholder-text">Tap to add photo evidence</span>
              </button>
            )}
          </div>
          
          {/* Delete option (only for edit mode) */}
          {isEditMode && onDelete && (
            <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center text-red-600 mb-2">
                <Trash2 size={18} className="mr-2" />
                <h3 className="font-medium">Delete Finding</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                This will permanently remove this finding from the inspection.
              </p>
              <button 
                className="modern-btn modern-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Finding
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={isEditMode ? onCancel : handleBackStep}
          >
            {isEditMode ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            className="modern-btn modern-btn--primary"
            onClick={handleSave}
            disabled={loading || !deficiency.trim() || (!isEditMode && (!category || !subcategory))}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditMode ? 'Save Changes' : 'Save Finding'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <FindingPhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-modal__content">
            <div className="delete-confirm-modal__header">
              <h3 className="delete-confirm-modal__title">Delete Finding?</h3>
            </div>
            <div className="delete-confirm-modal__body">
              <p className="delete-confirm-modal__message">
                Are you sure you want to delete this finding? This action cannot be undone.
              </p>
            </div>
            <div className="delete-confirm-modal__footer">
              <button 
                className="delete-confirm-modal__delete"
                onClick={handleDelete}
              >
                Delete Finding
              </button>
              <button 
                className="delete-confirm-modal__cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindingForm;