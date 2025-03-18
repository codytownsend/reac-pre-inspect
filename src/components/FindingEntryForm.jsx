import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  X,
  ArrowLeft,
  ArrowRight
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
      <div className="h-full flex flex-col">
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
          <div className="grid gap-3">
            {filteredCategories.map(categoryKey => {
              const category = nspireCategories[categoryKey];
              if (!category) return null;
              
              return (
                <button
                  key={categoryKey}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center"
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-left">{category.name}</div>
                    <div className="text-sm text-gray-500 text-left">{category.subcategories.length} subcategories</div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 bg-white border-t sticky bottom-0">
          <button 
            className="w-full p-3 bg-gray-100 rounded-lg flex items-center justify-center font-medium"
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
      <div className="h-full flex flex-col">
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
          <div className="grid gap-3">
            {category?.subcategories.map(subcategory => (
              <button
                key={subcategory}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center"
                onClick={() => handleSubcategorySelect(subcategory)}
              >
                <div className="font-medium text-left flex-1">{subcategory}</div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-white border-t sticky bottom-0 flex gap-3">
          <button 
            className="flex-1 p-3 bg-gray-100 rounded-lg flex items-center justify-center font-medium"
            onClick={handleBack}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }
  
  // Finding Details View (Step 3)
  return (
    <div className="h-full flex flex-col">
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
        {/* Deficiency Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deficiency Description *
          </label>
          <textarea
            name="deficiency"
            value={finding.deficiency}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Describe what's wrong..."
            required
          />
        </div>
        
        {/* Severity Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {['lifeThreatening', 'severe', 'moderate', 'low'].map(severity => {
              const details = getSeverityDetails(severity);
              return (
                <button
                  key={severity}
                  type="button"
                  className={`p-3 rounded-lg border ${
                    finding.severity === severity 
                      ? `${details.border} ${details.bg}` 
                      : 'border-gray-200'
                  } flex flex-col items-center justify-center`}
                  onClick={() => setFinding(prev => ({ ...prev, severity }))}
                >
                  <div className={`${finding.severity === severity ? details.text : 'text-gray-400'}`}>
                    {details.icon}
                  </div>
                  <div className="text-sm font-medium mt-1">{details.name}</div>
                </button>
              );
            })}
          </div>
          
          <div className={`p-3 rounded-lg ${severityDetails.bg} ${severityDetails.text} flex items-center text-sm`}>
            <Clock size={16} className="mr-2" />
            Required repair timeframe: <span className="font-bold ml-1">{severityDetails.timeframe}</span>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={finding.notes}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Add any additional notes..."
          />
        </div>
        
        {/* Photos */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Photos</label>
            <button
              type="button"
              className="text-blue-500 text-sm font-medium flex items-center"
              onClick={() => setShowPhotoCapture(true)}
            >
              <Camera size={16} className="mr-1" /> 
              Add Photo
            </button>
          </div>
          
          {finding.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {finding.photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="aspect-square relative rounded-lg overflow-hidden border border-gray-200"
                >
                  <img 
                    src={photo.data} 
                    alt={`Photo ${index+1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => removePhoto(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Plus size={24} />
                <span className="text-xs mt-1">Add</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400"
              onClick={() => setShowPhotoCapture(true)}
            >
              <Camera size={32} />
              <span className="mt-2">Tap to add photo evidence</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-white border-t sticky bottom-0 flex gap-3">
        <button 
          className="p-3 bg-gray-100 rounded-lg flex items-center justify-center font-medium"
          onClick={handleBack}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>
        
        <button 
          className="flex-1 p-3 bg-blue-500 text-white rounded-lg flex items-center justify-center font-medium disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!finding.deficiency.trim()}
        >
          <Save size={18} className="mr-2" />
          Save Finding
        </button>
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