// src/components/FindingEntryForm.jsx
import React, { useState, useEffect } from 'react';
import { useInspection } from '../context/InspectionContext';
import Button from './Button';
import Alert from './Alert';
import FindingPhotoCapture from './FindingPhotoCapture';
import { Camera, Plus, AlertCircle, Clock, AlertTriangle, Save } from 'lucide-react';

const FindingEntryForm = ({ 
  inspectionId, 
  areaId, 
  areaType, 
  onSave,
  onCancel 
}) => {
  const { nspireCategories } = useInspection();
  const [finding, setFinding] = useState({
    category: '',
    subcategory: '',
    deficiency: '',
    severity: 'moderate', // Default to moderate
    notes: '',
    photos: []
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Category, 2: Details

  // When category changes, reset subcategory
  useEffect(() => {
    if (selectedCategory) {
      setFinding(prev => ({
        ...prev,
        category: selectedCategory,
        subcategory: ''
      }));
    }
  }, [selectedCategory]);

  // Filter categories based on area type
  const getFilteredCategories = () => {
    if (areaType === 'unit') {
      return ['unit', 'bathroom', 'kitchen', 'electrical'];
    } else if (areaType === 'inside') {
      return ['buildingSystems', 'commonAreas', 'electrical', 'fire_life_safety'];
    } else if (areaType === 'outside') {
      return ['site', 'buildingExterior', 'structural', 'site_grounds'];
    }
    return Object.keys(nspireCategories);
  };

  const filteredCategories = getFilteredCategories();

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

  // Render severity badge
  const renderSeverityBadge = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return (
          <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded">
            <AlertCircle size={16} className="mr-1" />
            <span className="text-xs">Life-Threatening</span>
          </div>
        );
      case 'severe':
        return (
          <div className="flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded">
            <AlertTriangle size={16} className="mr-1" />
            <span className="text-xs">Severe</span>
          </div>
        );
      case 'moderate':
        return (
          <div className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            <Clock size={16} className="mr-1" />
            <span className="text-xs">Moderate</span>
          </div>
        );
      case 'low':
        return (
          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded">
            <Clock size={16} className="mr-1" />
            <span className="text-xs">Low</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Step 1: Category Selection
  if (step === 1) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Select Category</h2>
        
        {error && <Alert type="danger" message={error} />}
        
        <div className="space-y-3 mb-6">
          {filteredCategories.map(categoryKey => {
            const category = nspireCategories[categoryKey];
            if (!category) return null;
            
            return (
              <button
                key={categoryKey}
                className={`w-full p-3 border rounded text-left ${
                  selectedCategory === categoryKey
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                onClick={() => setSelectedCategory(categoryKey)}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setStep(2)}
            disabled={!selectedCategory}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }
  
  // Step 2: Finding Details
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">
        {nspireCategories[finding.category]?.name} Finding
      </h2>
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="space-y-4">
        {/* Subcategory Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            name="subcategory"
            value={finding.subcategory}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">-- Select subcategory --</option>
            {nspireCategories[finding.category]?.subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        
        {/* Deficiency Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deficiency Description
          </label>
          <textarea
            name="deficiency"
            value={finding.deficiency}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>
        
        {/* Severity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            name="severity"
            value={finding.severity}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="lifeThreatening">Life-Threatening</option>
            <option value="severe">Severe</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
          
          <div className="mt-2">
            {renderSeverityBadge(finding.severity)}
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={finding.notes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="2"
            placeholder="Add any additional notes..."
          />
        </div>
        
        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          
          <div className="mb-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowPhotoCapture(true)}
            >
              <Camera size={16} className="mr-2" /> Capture Photo
            </Button>
          </div>
          
          {finding.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {finding.photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="relative w-20 h-20 border rounded overflow-hidden"
                >
                  <img 
                    src={photo.data} 
                    alt={`Photo ${index+1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={() => removePhoto(index)}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
        >
          <Save size={16} className="mr-2" /> Save Finding
        </Button>
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