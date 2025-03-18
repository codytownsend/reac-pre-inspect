// src/pages/inspections/AreaDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import FindingEntryForm from '../../components/FindingEntryForm';
import { 
  Plus, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Camera,
  Trash2,
  Home,
  Building,
  Grid,
  ArrowLeft,
  MoreVertical,
  ChevronRight,
  X
} from 'lucide-react';

const AreaDetailPage = () => {
  const { id, areaId } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFinding, setCurrentFinding] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        // Find the area
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
  
  const handleSaveFinding = async (newFinding) => {
    try {
      // Add finding to area
      const updatedArea = {
        ...area,
        findings: [...(area.findings || []), newFinding]
      };
      
      // Update areas in inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? updatedArea : a
      );
      
      // Update inspection in Firebase
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setArea(updatedArea);
      setShowAddFinding(false);
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
    }
  };
  
  const handleDeleteFinding = async (findingId) => {
    try {
      // Remove finding from area
      const updatedArea = {
        ...area,
        findings: area.findings.filter(f => f.id !== findingId)
      };
      
      // Update areas in inspection
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? updatedArea : a
      );
      
      // Update inspection in Firebase
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setArea(updatedArea);
      setShowDeleteModal(false);
      setCurrentFinding(null);
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError('Error deleting finding');
    }
  };
  
  const handleDeleteArea = async () => {
    if (window.confirm("Are you sure you want to delete this area and all its findings?")) {
      try {
        // Remove area from inspection
        const updatedAreas = inspection.areas.filter(a => a.id !== areaId);
        
        // Update inspection in Firebase
        await updateInspection(id, { areas: updatedAreas });
        
        // Navigate back to the appropriate area type page
        if (area.areaType === 'unit') {
          navigate(`/inspections/${id}/areas/units`);
        } else if (area.areaType === 'inside') {
          navigate(`/inspections/${id}/areas/inside`);
        } else {
          navigate(`/inspections/${id}/areas/outside`);
        }
      } catch (error) {
        console.error("Error deleting area:", error);
        setError('Error deleting area');
      }
    }
  };
  
  const getAreaIcon = () => {
    switch (area?.areaType) {
      case 'unit':
        return <Home size={20} className="text-blue-500" />;
      case 'inside':
        return <Building size={20} className="text-purple-500" />;
      case 'outside':
        return <Grid size={20} className="text-green-500" />;
      default:
        return null;
    }
  };
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'severe':
        return <AlertTriangle size={18} className="text-orange-500" />;
      case 'moderate':
        return <Clock size={18} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={18} className="text-blue-500" />;
      default:
        return <CheckCircle size={18} className="text-green-500" />;
    }
  };
  
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return 'border-red-200 bg-red-50';
      case 'severe':
        return 'border-orange-200 bg-orange-50';
      case 'moderate':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return '';
    }
  };
  
  const getBackUrl = () => {
    if (area?.areaType === 'unit') {
      return `/inspections/${id}/areas/units`;
    } else if (area?.areaType === 'inside') {
      return `/inspections/${id}/areas/inside`;
    } else if (area?.areaType === 'outside') {
      return `/inspections/${id}/areas/outside`;
    }
    return `/inspections/${id}`;
  };
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading area details...</p>
        </div>
      </div>
    );
  }
  
  if (!area) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Area Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The area you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            Back to Inspection
          </button>
        </div>
      </div>
    );
  }
  
  // If showing add finding form
  if (showAddFinding) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white p-4 flex items-center border-b">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowAddFinding(false)}
          >
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Add Finding</h1>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <FindingEntryForm 
            inspectionId={id}
            areaId={areaId}
            areaType={area.areaType}
            onSave={handleSaveFinding}
            onCancel={() => setShowAddFinding(false)}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top App Bar */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => navigate(getBackUrl())}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{area.name}</h1>
        </div>
        
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
          >
            <MoreVertical size={20} />
          </button>
          
          {/* Actions Menu */}
          {showActionsMenu && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden w-48 z-20">
              <button
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-100 flex items-center"
                onClick={() => {
                  setShowActionsMenu(false);
                  handleDeleteArea();
                }}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Area
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Area Info Card */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${
              area.areaType === 'unit' ? 'bg-blue-100' : 
              area.areaType === 'inside' ? 'bg-purple-100' : 'bg-green-100'
            } mr-4`}>
              {getAreaIcon()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{area.name}</h2>
              <p className="text-gray-600">
                {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Findings List */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Findings</h2>
        </div>
        
        {!area.findings || area.findings.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6">No findings have been added yet.</p>
            <button 
              className="py-3 px-4 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center mx-auto"
              onClick={() => setShowAddFinding(true)}
            >
              <Plus size={18} className="mr-2" /> Add First Finding
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {area.findings.map((finding) => (
              <div 
                key={finding.id} 
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${getSeverityClass(finding.severity)}`}
              >
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(finding.severity)}
                      <h3 className="font-bold ml-2 truncate">{finding.subcategory}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">{finding.deficiency}</p>
                    
                    {finding.notes && (
                      <p className="text-gray-500 text-sm mb-2">{finding.notes}</p>
                    )}
                    
                    {finding.photos && finding.photos.length > 0 && (
                      <div className="flex -mx-1 overflow-x-auto py-2">
                        {finding.photos.map((photo, photoIndex) => (
                          <div 
                            key={photoIndex} 
                            className="px-1 shrink-0"
                          >
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                              <img 
                                src={photo.data} 
                                alt={`Finding ${photoIndex+1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex flex-col">
                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      onClick={() => {
                        setCurrentFinding(finding);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20">
        <button 
          className="w-14 h-14 bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center"
          onClick={() => setShowAddFinding(true)}
          aria-label="Add Finding"
        >
          <Plus size={24} />
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentFinding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Delete Finding?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this finding? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-3 bg-red-500 text-white rounded-lg font-medium"
                onClick={() => handleDeleteFinding(currentFinding.id)}
              >
                Delete Finding
              </button>
              <button 
                className="w-full py-3 bg-gray-100 rounded-lg font-medium"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentFinding(null);
                }}
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

export default AreaDetailPage;