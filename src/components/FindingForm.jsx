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
  ChevronRight,
  Save,
  Plus,
  Trash2,
  ArrowLeft
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

const getAutomaticSeverity = (category, subcategory) => {
  // Check if we have deficiency data for this category/subcategory
  const matchingDeficiencies = Object.entries(nspireDeficiencies)
    .filter(([_, deficiency]) => 
      deficiency.category === category && 
      deficiency.subcategory === subcategory
    );
  
  if (matchingDeficiencies.length > 0) {
    // Use the first matching deficiency's severity
    return matchingDeficiencies[0][1].severity;
  }
  
  // Default severities by category
  const defaultSeverities = {
    'fire_life_safety': 'lifeThreatening',
    'site': 'moderate',
    'buildingExterior': 'moderate',
    'buildingSystems': 'severe',
    'commonAreas': 'moderate',
    'unit': 'moderate',
    'electrical': 'severe',
    'bathroom': 'moderate',
    'kitchen': 'moderate'
  };
  
  return defaultSeverities[category] || 'moderate';
};


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
  
  // Get area theme color
  const getAreaThemeColor = () => {
    switch(areaType) {
      case 'unit': return 'blue';
      case 'inside': return 'purple';
      case 'outside': return 'green';
      default: return 'blue';
    }
  };
  
  const themeColor = getAreaThemeColor();
  
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
    // Reset subcategory when category changes
    setSubcategory('');
    // Don't set severity yet, wait for subcategory selection
    setCurrentStep(2);
  };
  
  const handleSubcategorySelect = (selectedSubcategory) => {
    setSubcategory(selectedSubcategory);
    // Auto-set severity based on category and subcategory
    setSeverity(getAutomaticSeverity(category, selectedSubcategory));
    setCurrentStep(3);
  };
  
  // Modified to handle the back navigation properly
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Just cancel without trying to navigate
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
          color: 'red',
          timeframe: '24 Hours',
        };
      case 'severe':
        return {
          icon: <AlertTriangle size={20} />,
          name: 'Severe',
          color: 'orange',
          timeframe: areaType === 'unit' ? '30 Days' : '24 Hours',
        };
      case 'moderate':
        return {
          icon: <Clock size={20} />,
          name: 'Moderate',
          color: 'yellow',
          timeframe: '30 Days',
        };
      case 'low':
        return {
          icon: <CheckCircle size={20} />,
          name: 'Low',
          color: 'green',
          timeframe: '60 Days',
        };
      default:
        return {
          icon: <Clock size={20} />,
          name: 'Moderate',
          color: 'yellow',
          timeframe: '30 Days',
        };
    }
  };
  
  // Get current severity details
  const severityDetails = getSeverityDetails(severity);
  
  // Category Selection View (Step 1)
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              onClick={onCancel}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Select Category</h1>
          </div>
          
          <div className={`text-${themeColor}-500 font-medium text-sm`}>
            Step 1 of 3
          </div>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="p-4">
          <div className="space-y-3">
            {filteredCategories.map(categoryKey => {
              const category = nspireCategories[categoryKey];
              if (!category) return null;
              
              return (
                <div
                  key={categoryKey}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.subcategories.length} subcategories</p>
                    </div>
                    <div className="text-gray-400">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Subcategory Selection View (Step 2)
  if (currentStep === 2) {
    const categoryData = nspireCategories[category];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              onClick={handleBackStep}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Select Subcategory</h1>
          </div>
          
          <div className={`text-${themeColor}-500 font-medium text-sm`}>
            Step 2 of 3
          </div>
        </div>
        
        <div className={`mx-4 mt-4 p-3 bg-${themeColor}-50 text-${themeColor}-700 rounded-lg flex items-center`}>
          <div className={`p-1 rounded-full bg-${themeColor}-100 mr-2`}>
            <CheckCircle size={16} />
          </div>
          <span>Selected: <strong>{categoryData?.name}</strong></span>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="p-4">
          <div className="space-y-3">
            {categoryData?.subcategories.map(sub => (
              <div
                key={sub}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                onClick={() => handleSubcategorySelect(sub)}
              >
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-medium">{sub}</h3>
                  <div className="text-gray-400">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Finding Details View (Step 3)
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={isEditMode ? onCancel : handleBackStep}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{isEditMode ? 'Edit Finding' : 'Add Finding'}</h1>
        </div>
        
        {!isEditMode && (
          <div className={`text-${themeColor}-500 font-medium text-sm`}>
            Step 3 of 3
          </div>
        )}
      </div>
      
      {!isEditMode && (
        <div className={`mx-4 mt-4 p-3 bg-${themeColor}-50 text-${themeColor}-700 rounded-lg flex items-center`}>
          <div className={`p-1 rounded-full bg-${themeColor}-100 mr-2`}>
            <CheckCircle size={16} />
          </div>
          <span>Type: <strong>{nspireCategories[category]?.name}: {subcategory}</strong></span>
        </div>
      )}
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="p-4">
        <div className="space-y-4">
          {/* Deficiency Description */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deficiency Description *
            </label>
            <textarea
              value={deficiency}
              onChange={(e) => setDeficiency(e.target.value)}
              placeholder="Describe what's wrong..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

{/* Photos */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Photos
              </label>
              <button
                type="button"
                className="text-blue-500 flex items-center text-sm font-medium"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Camera size={16} className="mr-1" /> 
                Add Photo
              </button>
            </div>
            
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id || index} 
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img 
                      src={photo.data} 
                      alt={`Photo ${index+1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      onClick={() => handleRemovePhoto(photo.id || index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPhotoCapture(true)}
                >
                  <Plus size={24} className="mb-1" />
                  <span className="text-xs">Add</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Camera size={32} className="mb-2" />
                <span>Tap to add photo evidence</span>
              </button>
            )}
          </div>
          
          {/* Severity Selection */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {['lifeThreatening', 'severe', 'moderate', 'low'].map(severityLevel => {
                const details = getSeverityDetails(severityLevel);
                const isSelected = severity === severityLevel;
                
                return (
                  <button
                    key={severityLevel}
                    type="button"
                    className={`p-3 rounded-lg border flex items-center ${
                      isSelected 
                        ? `border-${details.color}-500 bg-${details.color}-50 text-${details.color}-700` 
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSeverity(severityLevel)}
                  >
                    <div className={`p-1 rounded-full ${isSelected ? `bg-${details.color}-100` : 'bg-gray-100'} mr-2`}>
                      {details.icon}
                    </div>
                    <span>{details.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Add this right here - after the buttons grid */}
            <div className="text-xs text-gray-500 mt-2">
              <span className="bg-gray-100 px-2 py-1 rounded">Auto-assigned severity</span> (Can be changed if needed)
            </div>
            
            <div className={`p-3 rounded-lg bg-${severityDetails.color}-50 text-${severityDetails.color}-700 flex items-center`}>
              <Clock size={16} className="mr-2" />
              <span>
                Required repair timeframe: <strong>{severityDetails.timeframe}</strong>
                {areaType === 'unit' && 
                  <span className="ml-1">
                    | {severity === 'low' ? <strong>Pass</strong> : <strong>Fail</strong>}
                  </span>
                }
              </span>
            </div>
          </div>
          
          {/* Repair Status (only for edit mode) */}
          {isEditMode && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repair Status
              </label>
              <select
                value={repairStatus}
                onChange={(e) => setRepairStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="scheduled">Scheduled</option>
                <option value="repaired">Repaired</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          )}
          
          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          {/* Delete option (only for edit mode) */}
          {isEditMode && onDelete && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center text-red-600 mb-2">
                <Trash2 size={18} className="mr-2" />
                <h3 className="font-medium">Delete Finding</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                This will permanently remove this finding from the inspection.
              </p>
              <button 
                className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Finding
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <button 
          className={`w-full py-3 bg-${themeColor}-500 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-50`}
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
      
      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <FindingPhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Delete Finding?</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete this finding? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col p-4 border-t space-y-2">
              <button 
                className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                onClick={handleDelete}
              >
                Delete Finding
              </button>
              <button 
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
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