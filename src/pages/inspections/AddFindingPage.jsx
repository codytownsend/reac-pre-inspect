// src/pages/inspections/AddFindingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import FindingPhotoCapture from '../../components/FindingPhotoCapture';
import { 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Save,
  ArrowLeft,
  Plus
} from 'lucide-react';

const AddFindingPage = () => {
  const { id, areaId, areaType = 'unit' } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection, nspireCategories } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Category, 2: Subcategory, 3: Details

  // Finding data
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [deficiency, setDeficiency] = useState('');
  const [severity, setSeverity] = useState('moderate'); // Default to moderate
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Find area in inspection
        const areaData = inspectionData.areas?.find(a => a.id === areaId);
        if (!areaData) {
          setError('Area not found');
          setLoading(false);
          return;
        }
        
        setArea(areaData);
        
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, areaId, getInspection, navigate]);
  
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
  
  const handleSaveFinding = async () => {
    if (!category || !subcategory || !deficiency.trim()) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create new finding object
      const newFinding = {
        id: `finding-${Date.now()}`,
        area: areaType,
        areaId: areaId,
        category: category,
        subcategory: subcategory,
        deficiency: deficiency,
        severity: severity,
        notes: notes,
        photos: photos,
        status: 'open',
        created: new Date().toISOString()
      };
      
      // Update findings for this area
      const updatedArea = { ...area };
      if (!updatedArea.findings) updatedArea.findings = [];
      updatedArea.findings.push(newFinding);
      
      // Update area's findings in the inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? updatedArea : a
      );
      
      // Update inspection in context and database
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate back to area detail
      navigate(`/inspections/${id}/${areaType}/${areaId}`);
      
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
      setSaving(false);
    }
  };
  
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/inspections/${id}/${areaType}/${areaId}`);
    }
  };
  
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
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading...</p>
      </div>
    );
  }
  
  if (!inspection || !area) {
    return (
      <div className="modern-empty-state">
        <div className="modern-empty-state__icon">
          <AlertCircle size={32} />
        </div>
        <h2 className="modern-empty-state__title">Area Not Found</h2>
        <p className="modern-empty-state__description">
          {error || "The area you're looking for doesn't exist or has been removed."}
        </p>
        <button 
          className="modern-btn modern-btn--primary"
          onClick={() => navigate(`/inspections/${id}`)}
        >
          Back to Inspection
        </button>
      </div>
    );
  }
  
  // Category Selection View (Step 1)
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="app-bar">
          <div className="flex items-center">
            <button
              className="app-bar__back-button"
              onClick={goBack}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="app-bar__title">Select Category</h1>
          </div>
        </div>
        
        <div className="finding-form p-4">
          <div className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">1</div>
            <h2 className="text-xl font-bold">Select Category</h2>
          </div>
          <div className="flex mt-2 mb-6">
            <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
          </div>
          
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center mb-4">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
        </div>
        
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
    );
  }
  
  // Subcategory Selection View (Step 2)
  if (currentStep === 2) {
    const categoryData = nspireCategories[category];
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="app-bar">
          <div className="flex items-center">
            <button
              className="app-bar__back-button"
              onClick={goBack}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="app-bar__title">Select Subcategory</h1>
          </div>
        </div>
        
        <div className="finding-form p-4">
          <div className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">2</div>
            <h2 className="text-xl font-bold">Select Subcategory</h2>
          </div>
          <div className="flex mt-2 mb-4">
            <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
            <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
            <div className="h-1 bg-gray-300 rounded-full flex-1 ml-1"></div>
          </div>
          
          <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm mb-4">
            Selected: <span className="font-medium">{categoryData?.name}</span>
          </div>
          
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center mb-4">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
        </div>
        
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
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Finding Details View (Step 3)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={goBack}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Finding Details</h1>
        </div>
      </div>
      
      <div className="finding-form p-4">
        <div className="flex mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">3</div>
          <h2 className="text-xl font-bold">Finding Details</h2>
        </div>
        <div className="flex mt-2 mb-4">
          <div className="h-1 bg-blue-500 rounded-full flex-1"></div>
          <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
          <div className="h-1 bg-blue-500 rounded-full flex-1 ml-1"></div>
        </div>
        
        <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm mb-4">
          <span className="font-medium">{nspireCategories[category]?.name}: {subcategory}</span>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center mb-4">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
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
                    onClick={() => handleRemovePhoto(photo.id)}
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
      
      {/* Bottom Actions */}
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={goBack}
          >
            Back
          </button>
          
          <button 
            className="modern-btn modern-btn--primary"
            onClick={handleSaveFinding}
            disabled={saving || !deficiency.trim()}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Finding
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
    </div>
  );
};

export default AddFindingPage;