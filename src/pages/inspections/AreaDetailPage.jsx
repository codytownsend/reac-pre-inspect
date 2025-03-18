// src/pages/inspections/AreaDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { 
  Home, 
  Building, 
  Grid, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Trash2,
  MoreVertical,
  Edit,
  Camera
} from 'lucide-react';

const AreaDetailPage = () => {
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
  
  // Determine area type from URL path
  const areaType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
  // Theme configuration based on area type
  const config = {
    unit: {
      title: 'Unit',
      icon: <Home size={24} />,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      fabColor: 'fab--blue'
    },
    inside: {
      title: 'Inside Area',
      icon: <Building size={24} />,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      fabColor: 'fab--purple'
    },
    outside: {
      title: 'Outside Area',
      icon: <Grid size={24} />,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      fabColor: 'fab--green'
    }
  }[areaType];

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
        console.error("Error loading area details:", error);
        setError('Error loading area details');
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
      
      // Navigate back to the areas list
      navigate(`/inspections/${id}/areas/${areaType}s`);
    } catch (error) {
      console.error("Error deleting area:", error);
      setError('Failed to delete area');
    }
  };

  const handleAddFinding = () => {
    navigate(`/inspections/${id}/areas/${areaId}/findings/new`);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return <AlertCircle size={18} className="severity-icon--critical" />;
      case 'severe':
        return <AlertTriangle size={18} className="severity-icon--serious" />;
      case 'moderate':
        return <Clock size={18} className="severity-icon--moderate" />;
      case 'low':
        return <CheckCircle size={18} className="severity-icon--minor" />;
      default:
        return <CheckCircle size={18} className="severity-icon--minor" />;
    }
  };
  
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return 'critical';
      case 'severe':
        return 'serious';
      case 'moderate':
        return 'moderate';
      case 'low':
        return 'minor';
      default:
        return 'minor';
    }
  };

  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading area details...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Bar */}
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(`/inspections/${id}/areas/${areaType}s`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">{area.name}</h1>
        </div>
        
        <button
          className="app-bar__action-button"
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
                navigate(`/inspections/${id}/areas/${areaId}/edit`);
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
        <div className="modern-card p-4 flex items-start">
          <div className={`${config.bgColor} p-3 rounded-lg mr-3`}>
            <div className={config.textColor}>
              {config.icon}
            </div>
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
          <div className="modern-empty-state">
            <div className="modern-empty-state__icon">
              <Plus size={24} />
            </div>
            <h2 className="modern-empty-state__title">No findings yet</h2>
            <p className="modern-empty-state__description">
              Add your first finding to document issues in this area.
            </p>
            <button 
              className={`modern-btn modern-btn--${config.color}`}
              onClick={handleAddFinding}
            >
              <Plus size={18} className="mr-2" /> Add First Finding
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-24">
            {area.findings.map((finding) => (
              <div 
                key={finding.id} 
                className={`finding-item finding-item--${getSeverityClass(finding.severity)}`}
                onClick={() => navigate(`/inspections/${id}/areas/${areaId}/findings/${finding.id}`)}
              >
                <div className="finding-item__content">
                  <div className="finding-item__icon">
                    {getSeverityIcon(finding.severity)}
                  </div>
                  <div className="finding-item__details">
                    <h3 className="finding-item__title">{finding.subcategory}</h3>
                    <p className="finding-item__description">{finding.deficiency}</p>
                    
                    {finding.photos && finding.photos.length > 0 && (
                      <div className="finding-item__photos">
                        {finding.photos.map((photo, photoIndex) => (
                          <div 
                            key={photoIndex} 
                            className="finding-item__photo"
                          >
                            <img 
                              src={photo.data} 
                              alt={`Finding ${photoIndex + 1}`} 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className={config.fabColor}
        onClick={handleAddFinding}
      >
        <Plus size={24} />
      </button>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-modal__content">
            <div className="delete-confirm-modal__header">
              <h3 className="delete-confirm-modal__title">Delete Area?</h3>
            </div>
            <div className="delete-confirm-modal__body">
              <p className="delete-confirm-modal__message">
                Are you sure you want to delete this area? All findings associated with this area will be permanently deleted.
              </p>
            </div>
            <div className="delete-confirm-modal__footer">
              <button 
                className="delete-confirm-modal__delete"
                onClick={handleDeleteArea}
              >
                Delete Area
              </button>
              <button 
                className="delete-confirm-modal__cancel"
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

export default AreaDetailPage;