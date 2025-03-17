// src/pages/inspections/AreaFindingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import FindingPhotoCapture from '../../components/FindingPhotoCapture';
import { 
  Plus, 
  Camera, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  ChevronRight, 
  Save,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const AreaFindingPage = () => {
  const { id, areaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection, updateInspection, addFinding, nspireCategories } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [findings, setFindings] = useState([]);
  
  // Current finding being added
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [deficiency, setDeficiency] = useState('');
  const [severity, setSeverity] = useState('moderate'); // Default
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [addingFinding, setAddingFinding] = useState(false);
  const [savingFinding, setSavingFinding] = useState(false);
  
  // Determine area type from URL
  const areaType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Find the specific area
        const foundArea = inspectionData.areas?.find(a => a.id === areaId);
        if (!foundArea) {
          setError('Area not found');
        } else {
          setArea(foundArea);
          setFindings(foundArea.findings || []);
        }
      } catch (error) {
        console.error("Error loading area data:", error);
        setError('Error loading area details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, areaId, getInspection, navigate]);
  
  const handleAddFinding = () => {
    setAddingFinding(true);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setDeficiency('');
    setSeverity('moderate');
    setNotes('');
    setPhotos([]);
  };
  
  const handlePhotoCapture = (photoData) => {
    setPhotos([...photos, { 
      id: Date.now().toString(),
      data: photoData,
      timestamp: new Date().toISOString()
    }]);
    setShowPhotoCapture(false);
  };
  
  const handleRemovePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };
  
  const handleSaveFinding = async () => {
    // Validation
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    
    if (!selectedSubcategory) {
      setError('Please select a subcategory');
      return;
    }
    
    if (!deficiency) {
      setError('Please describe the deficiency');
      return;
    }
    
    try {
      setSavingFinding(true);
      
      // Create new finding object
      const newFinding = {
        id: `finding-${Date.now()}`,
        area: areaType,
        areaId: area.id,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        deficiency: deficiency,
        severity: severity,
        notes: notes,
        photos: photos,
        status: 'open',
        created: new Date().toISOString()
      };
      
      // Update findings for this area
      const updatedFindings = [...findings, newFinding];
      
      // Update area's findings in the inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? { ...a, findings: updatedFindings } : a
      );
      
      // Update inspection in context and database
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setFindings(updatedFindings);
      setAddingFinding(false);
      setSavingFinding(false);
      setError('');
      
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
      setSavingFinding(false);
    }
  };
  
  const getSeverityIcon = (severityLevel) => {
    switch (severityLevel) {
      case 'lifeThreatening':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'severe':
        return <AlertTriangle size={18} className="text-orange-500" />;
      case 'moderate':
        return <Clock size={18} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return null;
    }
  };
  
  const getRepairTimeframe = (severityLevel) => {
    switch (severityLevel) {
      case 'lifeThreatening':
        return '24 Hours';
      case 'severe':
        return areaType === 'unit' ? '30 Days' : '24 Hours';
      case 'moderate':
        return '30 Days';
      case 'low':
        return '60 Days';
      default:
        return '30 Days';
    }
  };
  
  const getPassFailStatus = (severityLevel) => {
    if (areaType !== 'unit') return null;
    
    switch (severityLevel) {
      case 'lifeThreatening':
      case 'severe':
      case 'moderate':
        return 'Fail';
      case 'low':
        return 'Pass';
      default:
        return 'Fail';
    }
  };
  
  const getBackPath = () => {
    switch (areaType) {
      case 'unit':
        return `/inspections/${id}/areas/units`;
      case 'inside':
        return `/inspections/${id}/areas/inside`;
      case 'outside':
        return `/inspections/${id}/areas/outside`;
      default:
        return `/inspections/${id}`;
    }
  };
  
  if (loading) {
    return <Loading message="Loading area details..." />;
  }
  
  if (!inspection || !area) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Area not found"} />
        <Button variant="primary" onClick={() => navigate(`/inspections/${id}`)}>
          Back to Inspection
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container pb-16">
      <Header 
        title={area.name} 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {!addingFinding ? (
        // Findings List View
        <>
          {/* Area Info Card */}
          <Card className="mb-4">
            <div className="flex items-start">
              <div className={`p-3 rounded-lg mr-4 ${
                areaType === 'unit' ? 'bg-blue-100' : 
                areaType === 'inside' ? 'bg-purple-100' : 'bg-green-100'
              }`}>
                {areaType === 'unit' ? (
                  <div className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                ) : areaType === 'inside' ? (
                  <div className="text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </div>
                ) : (
                  <div className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold">
                  {area.name} - {areaType.charAt(0).toUpperCase() + areaType.slice(1)} Area
                </h2>
                <p className="text-sm text-gray-600">
                  {findings.length} finding{findings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>
          
          {/* Findings List */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Findings</h2>
              <Button 
                variant="primary"
                onClick={handleAddFinding}
              >
                <Plus size={16} className="mr-1" /> Add Finding
              </Button>
            </div>
            
            {findings.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-gray-500 mb-4">No findings have been added for this area yet.</p>
                <Button 
                  variant="primary"
                  onClick={handleAddFinding}
                >
                  <Plus size={16} className="mr-1" /> Add Finding
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {findings.map((finding) => (
                  <Card 
                    key={finding.id} 
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/inspections/${id}/${areaType}/${areaId}/finding/${finding.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex items-center mr-3 mt-1">
                          {getSeverityIcon(finding.severity)}
                        </div>
                        <div>
                          <h3 className="font-bold">{finding.subcategory}</h3>
                          <p className="text-sm text-gray-700 mb-1">{finding.deficiency}</p>
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock size={12} className="mr-1" /> {getRepairTimeframe(finding.severity)}
                            </span>
                            {areaType === 'unit' && (
                              <span className={`${
                                getPassFailStatus(finding.severity) === 'Fail' 
                                  ? 'text-red-500' 
                                  : 'text-green-500'
                              }`}>
                                {getPassFailStatus(finding.severity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {finding.photos && finding.photos.length > 0 && (
                        <div className="h-14 w-14 rounded overflow-hidden shrink-0">
                          <img 
                            src={finding.photos[0].data} 
                            alt="Finding" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Add Finding Form
        <div className="mb-4">
          <Card className="mb-4">
            <h2 className="font-bold mb-4">Add New Finding</h2>
            
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {Object.keys(nspireCategories).map(key => (
                  <option key={key} value={key}>
                    {nspireCategories[key].name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Subcategory - only shown if category is selected */}
            {selectedCategory && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subcategory</option>
                  {nspireCategories[selectedCategory].subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Deficiency Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deficiency Description
              </label>
              <textarea
                value={deficiency}
                onChange={(e) => setDeficiency(e.target.value)}
                placeholder="Describe the deficiency"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Severity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lifeThreatening">Life Threatening</option>
                <option value="severe">Severe</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
              
              <div className="mt-2 p-2 rounded flex items-center text-sm">
                {getSeverityIcon(severity)}
                <span className="ml-2">
                  Repair timeframe: {getRepairTimeframe(severity)}
                  {areaType === 'unit' && ` | ${getPassFailStatus(severity)}`}
                </span>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this finding"
                rows={2}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Photos */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative h-20 w-20 rounded overflow-hidden">
                    <img 
                      src={photo.data} 
                      alt="Finding" 
                      className="h-full w-full object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  className="h-20 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400"
                  onClick={() => setShowPhotoCapture(true)}
                >
                  <Camera size={24} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          {!addingFinding ? (
            <>
              <Button 
                variant="secondary" 
                onClick={() => navigate(getBackPath())}
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleAddFinding}
              >
                <Plus size={16} className="mr-1" /> Add Finding
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={() => setAddingFinding(false)}
              >
                Cancel
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleSaveFinding}
                disabled={savingFinding || !selectedCategory || !selectedSubcategory || !deficiency}
              >
                {savingFinding ? 'Saving...' : (
                  <>
                    <Save size={16} className="mr-1" /> Save Finding
                  </>
                )}
              </Button>
            </>
          )}
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

export default AreaFindingPage;