import React, { useState } from 'react';
import { useInspection } from '../context/InspectionContext';
import FindingPhotoCapture from './FindingPhotoCapture';
import { 
  Camera, 
  Plus, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  Save,
  CheckCircle,
  X
} from 'lucide-react';

const FindingEntryForm = ({ 
  inspectionId, 
  areaId, 
  areaType, 
  onSave,
  onCancel 
}) => {
  const { nspireCategories } = useInspection();
  const [step, setStep] = useState(1); // 1: Category, 2: Subcategory, 3: Details
  const [finding, setFinding] = useState({
    category: '',
    subcategory: '',
    deficiency: '',
    severity: 'moderate', // Default to moderate
    notes: '',
    photos: []
  });
  
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const handleCategorySelect = (category) => {
    setFinding(prev => ({
      ...prev,
      category,
      subcategory: ''
    }));
    setStep(2);
  };
  
  const handleSubcategorySelect = (subcategory) => {
    setFinding(prev => ({
      ...prev,
      subcategory
    }));
    setStep(3);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFinding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = (photoData) => {
    setFinding(prev => ({
      ...prev,
      photos: [...prev.photos, { data: photoData, timestamp: new Date().toISOString() }]
    }));
    setShowPhotoCapture(false);
  };

  const removePhoto = (index) => {
    setFinding(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Validate fields
    if (!finding.category || !finding.subcategory || !finding.deficiency) {
      setError('Please fill out all required fields');
      return;
    }

    // Create new finding object
    const newFinding = {
      ...finding,
      id: Date.now().toString(),
      areaId: areaId,
      created: new Date().toISOString()
    };

    // Call onSave callback
    onSave(newFinding);
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };
  
  // Get severity details
  const getSeverityDetails = (severity) => {
    switch (severity) {
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
  const severityDetails = getSeverityDetails(finding.severity);
  
  // Category Selection View (Step 1)
  if (step === 1) {
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
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
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
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="modern-bottom-bar">
          <button 
            className="modern-btn modern-btn--secondary"
            style={{ width: '100%' }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  // Subcategory Selection View (Step 2)
  if (step === 2) {
    const category = nspireCategories[finding.category];
    
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
            Selected: <span className="font-medium">{category?.name}</span>
          </div>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-auto p-4">
          <div className="modern-list">
            {category?.subcategories.map(subcategory => (
              <div
                key={subcategory}
                className="modern-list-item modern-list-item--interactive"
                onClick={() => handleSubcategorySelect(subcategory)}
              >
                <div className="modern-list-item__content">
                  <h3 className="modern-list-item__title">{subcategory}</h3>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modern-bottom-bar">
          <div className="modern-bottom-bar__content">
            <button 
              className="modern-btn modern-btn--secondary"
              onClick={handleBack}
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
        <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
          <span className="font-medium">{nspireCategories[finding.category]?.name}: {finding.subcategory}</span>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
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
              name="deficiency"
              value={finding.deficiency}
              onChange={handleChange}
              className="finding-form__textarea"
              rows="3"
              placeholder="Describe what's wrong..."
              required
            ></textarea>
          </div>
          
          {/* Severity Selection */}
          <div className="finding-form__group">
            <label className="finding-form__label">
              Severity
            </label>
            
            <div className="finding-form__select-group">
              {['lifeThreatening', 'severe', 'moderate', 'low'].map(severity => {
                const details = getSeverityDetails(severity);
                return (
                  <button
                    key={severity}
                    type="button"
                    className={`finding-form__select-option ${
                      finding.severity === severity 
                        ? 'finding-form__select-option--selected' 
                        : ''
                    }`}
                    onClick={() => setFinding(prev => ({ ...prev, severity }))}
                  >
                    <div className={`finding-form__select-option-icon ${finding.severity === severity ? details.text : 'text-gray-400'}`}>
                      {details.icon}
                    </div>
                    <div className="finding-form__select-option-label">{details.name}</div>
                  </button>
                );
              })}
            </div>
            
            <div className={`finding-form__severity-indicator finding-form__severity-indicator--${finding.severity === 'lifeThreatening' ? 'critical' : finding.severity === 'severe' ? 'serious' : finding.severity === 'moderate' ? 'moderate' : 'minor'}`}>
              <Clock size={16} className="finding-form__severity-icon" />
              Required repair timeframe: <span className="font-bold ml-1">{severityDetails.timeframe}</span>
            </div>
          </div>
          
          {/* Notes */}
          <div className="finding-form__group">
            <label className="finding-form__label">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={finding.notes}
              onChange={handleChange}
              className="finding-form__textarea"
              rows="2"
              placeholder="Add any additional notes..."
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
            
            {finding.photos.length > 0 ? (
              <div className="photo-grid">
                {finding.photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="photo-thumbnail"
                  >
                    <img 
                      src={photo.data} 
                      alt={`Photo ${index+1}`} 
                    />
                    <button
                      type="button"
                      className="photo-thumbnail__remove"
                      onClick={() => removePhoto(index)}
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
        </div>
      </div>
      
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={handleBack}
          >
            Back
          </button>
          
          <button 
            className="modern-btn modern-btn--primary"
            onClick={handleSubmit}
            disabled={!finding.deficiency.trim()}
          >
            <Save size={18} className="mr-2" />
            Save Finding
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
    </div>
  );
};

export default FindingEntryForm;