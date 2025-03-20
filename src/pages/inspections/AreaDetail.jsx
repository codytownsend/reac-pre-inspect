// src/pages/inspections/AreaDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  getAreaConfig, 
  getSeverityIcon, 
  getSeverityClass, 
  getAreaUrlPath 
} from '../../utils/areaUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Trash2,
  MoreVertical,
  Edit,
  Camera,
  ChevronRight
} from 'lucide-react';

import FindingForm from '../../components/FindingForm';

const AreaDetail = () => {
  const { id, areaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [editingFinding, setEditingFinding] = useState(null);
  
  // Determine area type from URL path
  const areaType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
  // Get configuration for this area type
  const config = getAreaConfig(areaType);

  useEffect(() => {
    const loadData = async () => {
      try {
        // First, force a fresh fetch from Firestore instead of relying on the context
        const inspectionDoc = await getDoc(doc(db, 'inspections', id));
        if (!inspectionDoc.exists()) {
          setError('Inspection not found');
          setLoading(false);
          return;
        }
        
        const inspectionData = { id, ...inspectionDoc.data() };
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
        console.error("Error loading area details:", error);
        setError('Error loading area details: ' + (error.message || ''));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, areaId, getInspection, navigate]);

  const handleDeleteArea = async () => {
    try {
      // Remove the area from the inspection
      const updatedAreas = inspection.areas.filter(a => a.id !== areaId);
      
      // Update inspection in Firestore
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate back to the areas list - using consistent URL path
      const urlPath = getAreaUrlPath(areaType);
      navigate(`/inspections/${id}/${urlPath}`);
    } catch (error) {
      console.error("Error deleting area:", error);
      setError('Failed to delete area: ' + (error.message || ''));
    }
  };

  const handleAddFinding = () => {
    setShowAddFinding(true);
    setEditingFinding(null);
  };

  const handleEditFinding = (finding) => {
    setEditingFinding(finding);
    setShowAddFinding(true);
  };

  const handleSaveFinding = async (findingData) => {
    try {
      let updatedAreas = [...inspection.areas];
      const areaIndex = updatedAreas.findIndex(a => a.id === areaId);
      
      if (areaIndex === -1) {
        throw new Error('Area not found');
      }
      
      // If editing an existing finding
      if (editingFinding) {
        const findingIndex = updatedAreas[areaIndex].findings?.findIndex(f => f.id === findingData.id);
        
        if (findingIndex >= 0) {
          // Update the finding
          updatedAreas[areaIndex].findings[findingIndex] = findingData;
        } else {
          // Add as new if not found
          updatedAreas[areaIndex].findings = [...(updatedAreas[areaIndex].findings || []), findingData];
        }
      } else {
        // Add as new finding
        updatedAreas[areaIndex].findings = [...(updatedAreas[areaIndex].findings || []), findingData];
      }
      
      // Update inspection in Firestore
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setInspection({
        ...inspection,
        areas: updatedAreas
      });
      
      // Update area
      setArea(updatedAreas[areaIndex]);
      
      // Close form
      setShowAddFinding(false);
      setEditingFinding(null);
      
    } catch (error) {
      console.error("Error saving finding:", error);
      setError("Error saving finding: " + (error.message || ''));
    }
  };

  const handleDeleteFinding = async (findingId) => {
    try {
      let updatedAreas = [...inspection.areas];
      const areaIndex = updatedAreas.findIndex(a => a.id === areaId);
      
      if (areaIndex === -1) {
        throw new Error('Area not found');
      }
      
      // Remove the finding
      updatedAreas[areaIndex].findings = updatedAreas[areaIndex].findings.filter(f => f.id !== findingId);
      
      // Update inspection in Firestore
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setInspection({
        ...inspection,
        areas: updatedAreas
      });
      
      // Update area
      setArea(updatedAreas[areaIndex]);
      
      // Close form
      setShowAddFinding(false);
      setEditingFinding(null);
      
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError("Error deleting finding: " + (error.message || ''));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading area details...</p>
        </div>
      </div>
    );
  }

  if (!inspection || !area) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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

  // If in add/edit finding mode, show the finding form
  if (showAddFinding) {
    return (
      <FindingForm
        inspectionId={id}
        areaId={areaId}
        areaType={areaType}
        initialFinding={editingFinding}
        onSave={handleSaveFinding}
        onCancel={() => {
          setShowAddFinding(false);
          setEditingFinding(null);
        }}
        onDelete={editingFinding ? handleDeleteFinding : null}
      />
    );
  }

  // Create IconComponent from config
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Bar */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => {
              // Use the utility function for consistent URL paths
              const urlPath = getAreaUrlPath(areaType);
              navigate(`/inspections/${id}/${urlPath}`);
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{area.name}</h1>
        </div>
        
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowActionsMenu(!showActionsMenu)}
        >
          <MoreVertical size={20} />
        </button>
        
        {showActionsMenu && (
          <div className="absolute right-4 top-14 bg-white rounded-lg shadow-lg z-50 w-48 overflow-hidden">
            <button
              className="w-full py-3 px-4 text-left hover:bg-gray-100 flex items-center text-red-600"
              onClick={() => {
                setShowActionsMenu(false);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Area
            </button>
            <button
              className="w-full py-3 px-4 text-left hover:bg-gray-100 flex items-center"
              onClick={() => {
                setShowActionsMenu(false);
                // Use the correct URL path for area type
                const urlPath = getAreaUrlPath(areaType);
                navigate(`/inspections/${id}/${urlPath}/${areaId}/edit`);
              }}
            >
              <Edit size={16} className="mr-2" />
              Edit Area
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Area Info Card */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-start">
          <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center mr-3 text-${config.color}-500`}>
            <IconComponent size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{area.name}</h2>
            <p className="text-gray-600">
              {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Findings Section */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Findings</h2>
        </div>
        
        {!area.findings || area.findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No findings yet</h2>
            <p className="text-gray-600 text-center mb-4">Add your first finding to document issues in this area.</p>
            <button 
              className={`py-2 px-4 bg-${config.color}-500 text-white rounded-lg font-medium flex items-center`}
              onClick={handleAddFinding}
            >
              <Plus size={18} className="mr-2" /> Add First Finding
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {area.findings.map((finding) => {
              const severityClass = {
                'lifeThreatening': 'critical',
                'severe': 'serious',
                'moderate': 'moderate',
                'low': 'minor'
              }[finding.severity] || 'minor';
              
              const SeverityIcon = {
                'lifeThreatening': AlertCircle,
                'severe': AlertTriangle,
                'moderate': Clock,
                'low': CheckCircle
              }[finding.severity] || CheckCircle;
              
              const severityColors = {
                'critical': 'red',
                'serious': 'orange',
                'moderate': 'yellow',
                'minor': 'green'
              }[severityClass];
              
              return (
                <div 
                  key={finding.id} 
                  className={`bg-white rounded-lg shadow-sm border-l-4 border-${severityColors}-500 cursor-pointer`}
                  onClick={() => handleEditFinding(finding)}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className={`mr-3 mt-1 text-${severityColors}-500`}>
                        <SeverityIcon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{finding.subcategory}</h3>
                        <p className="text-gray-700">{finding.deficiency}</p>
                        
                        {/* Show photos if available */}
                        {finding.photos && finding.photos.length > 0 && (
                          <div className="mt-3 flex overflow-x-auto space-x-2 pb-2">
                            {finding.photos.map((photo, photoIndex) => (
                              <div 
                                key={photoIndex} 
                                className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200"
                              >
                                <img 
                                  src={photo.data} 
                                  alt={`Finding ${photoIndex + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400 ml-2">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className={`fixed bottom-20 right-4 w-14 h-14 rounded-full bg-${config.color}-500 text-white flex items-center justify-center shadow-lg`}
        onClick={handleAddFinding}
      >
        <Plus size={24} />
      </button>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Delete Area?</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete this area? All findings associated with this area will be permanently deleted.
              </p>
            </div>
            <div className="flex flex-col p-4 border-t space-y-2">
              <button 
                className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                onClick={handleDeleteArea}
              >
                Delete Area
              </button>
              <button 
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                onClick={() => setShowDeleteModal(false)}
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

export default AreaDetail;