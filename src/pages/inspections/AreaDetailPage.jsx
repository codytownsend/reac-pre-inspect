import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFinding, setCurrentFinding] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  // Determine area type from URL
  const areaType = location.pathname.includes('/units/') 
    ? 'unit' 
    : location.pathname.includes('/inside/') 
      ? 'inside' 
      : 'outside';
  
  useEffect(() => {
    // Same effect code as before
    // ...
  }, [id, areaId, getInspection, navigate]);
  
  const handleSaveFinding = async (newFinding) => {
    // Same function as before
    // ...
  };
  
  const handleDeleteFinding = async (findingId) => {
    // Same function as before
    // ...
  };
  
  const handleDeleteArea = async () => {
    // Same function as before
    // ...
  };
  
  const getAreaIcon = () => {
    switch (area?.areaType) {
      case 'unit':
        return <Home size={20} />;
      case 'inside':
        return <Building size={20} />;
      case 'outside':
        return <Grid size={20} />;
      default:
        return null;
    }
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
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading area details...</p>
      </div>
    );
  }
  
  if (!area) {
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
  
  // If showing add finding form
  if (showAddFinding) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="app-bar">
          <button
            className="app-bar__back-button"
            onClick={() => setShowAddFinding(false)}
          >
            <X size={24} />
          </button>
          <h1 className="app-bar__title">Add Finding</h1>
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
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(getBackUrl())}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">{area.name}</h1>
        </div>
        
        <div className="relative">
          <button
            className="app-bar__action-button"
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
      <div className="area-detail">
        <div className={`area-info-card`}>
          <div className={`area-info-card__icon area-info-card__icon--${areaType}`}>
            {getAreaIcon()}
          </div>
          <div className="area-info-card__details">
            <h2 className="area-info-card__title">{area.name}</h2>
            <p className="area-info-card__subtitle">
              {area.findings?.length || 0} finding{area.findings?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      
        {/* Findings List */}
        <div className="findings-header">
          <h2 className="findings-header__title">Findings</h2>
        </div>
        
        {!area.findings || area.findings.length === 0 ? (
          <div className="modern-empty-state">
            <div className="modern-empty-state__icon">
              <Plus size={24} />
            </div>
            <h2 className="modern-empty-state__title">No findings yet</h2>
            <p className="modern-empty-state__description">No findings have been added for this area yet.</p>
            <button 
              className="modern-btn modern-btn--primary"
              onClick={() => setShowAddFinding(true)}
            >
              <Plus size={18} className="mr-2" /> Add First Finding
            </button>
          </div>
        ) : (
          <div className="findings-list">
            {area.findings.map((finding) => (
              <div 
                key={finding.id} 
                className={`finding-item finding-item--${getSeverityClass(finding.severity)} finding-item--interactive`}
                onClick={() => navigate(`/inspections/${id}/${areaType}/${areaId}/finding/${finding.id}`)}
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
                              alt={`Finding ${photoIndex+1}`} 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="finding-item__actions">
                    <button
                      className="finding-item__action-button finding-item__action-button--delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentFinding(finding);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className={`fab fab--${areaType === 'unit' ? 'blue' : areaType === 'inside' ? 'purple' : 'green'}`}
        onClick={() => setShowAddFinding(true)}
        aria-label="Add Finding"
      >
        <Plus size={24} />
      </button>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentFinding && (
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
                onClick={() => handleDeleteFinding(currentFinding.id)}
              >
                Delete Finding
              </button>
              <button 
                className="delete-confirm-modal__cancel"
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