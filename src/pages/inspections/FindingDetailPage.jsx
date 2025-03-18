// src/pages/inspections/FindingDetailPage.jsx
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
  Trash2,
  Edit,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

const FindingDetailPage = () => {
  const { id, areaId, findingId, areaType = 'unit' } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection } = useInspection();
  
  const [inspection, setInspection] = useState(null);
  const [area, setArea] = useState(null);
  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Editable fields
  const [deficiency, setDeficiency] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [repairStatus, setRepairStatus] = useState('');
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
        
        // Find finding in area
        const findingData = areaData.findings?.find(f => f.id === findingId);
        if (!findingData) {
          setError('Finding not found');
          setLoading(false);
          return;
        }
        
        setFinding(findingData);
        
        // Initialize editable fields
        setDeficiency(findingData.deficiency || '');
        setSeverity(findingData.severity || 'moderate');
        setNotes(findingData.notes || '');
        setRepairStatus(findingData.status || 'open');
        setPhotos(findingData.photos || []);
        
      } catch (error) {
        console.error("Error loading finding:", error);
        setError('Error loading finding details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, areaId, findingId, getInspection, navigate]);
  
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
  
  const handleSave = async () => {
    if (!deficiency.trim()) {
      setError('Deficiency description is required');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create updated finding object
      const updatedFinding = {
        ...finding,
        deficiency,
        severity,
        notes,
        status: repairStatus,
        photos,
        updatedAt: new Date().toISOString()
      };
      
      // Update the finding in the area
      const updatedAreas = inspection.areas.map(a => {
        if (a.id === areaId) {
          const updatedFindings = a.findings.map(f => 
            f.id === findingId ? updatedFinding : f
          );
          return { ...a, findings: updatedFindings };
        }
        return a;
      });
      
      // Update inspection in context and database
      await updateInspection(id, { areas: updatedAreas });
      
      // Update local state
      setFinding(updatedFinding);
      setEditMode(false);
      setSaving(false);
      
    } catch (error) {
      console.error("Error saving finding:", error);
      setError('Error saving finding');
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      // Find and remove the finding from the area
      const updatedAreas = inspection.areas.map(a => {
        if (a.id === areaId) {
          const updatedFindings = a.findings.filter(f => f.id !== findingId);
          return { ...a, findings: updatedFindings };
        }
        return a;
      });
      
      // Update inspection in context and database
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate back to area detail
      navigate(`/inspections/${id}/${areaType}/${areaId}`);
      
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError('Error deleting finding');
      setShowDeleteConfirm(false);
    }
  };
  
  const getSeverityIcon = (severityLevel) => {
    switch (severityLevel) {
      case 'lifeThreatening':
        return <AlertCircle size={20} className="severity-icon--critical" />;
      case 'severe':
        return <AlertTriangle size={20} className="severity-icon--serious" />;
      case 'moderate':
        return <Clock size={20} className="severity-icon--moderate" />;
      case 'low':
        return <CheckCircle size={20} className="severity-icon--minor" />;
      default:
        return null;
    }
  };
  
  const getSeverityClass = (severityLevel) => {
    switch (severityLevel) {
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
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="modern-status-badge modern-status-badge--yellow">Open</span>;
      case 'scheduled':
        return <span className="modern-status-badge modern-status-badge--blue">Scheduled</span>;
      case 'repaired':
        return <span className="modern-status-badge modern-status-badge--orange">Repaired</span>;
      case 'verified':
        return <span className="modern-status-badge modern-status-badge--green">Verified</span>;
      default:
        return <span className="modern-status-badge modern-status-badge--yellow">Open</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading finding details...</p>
      </div>
    );
  }
  
  if (!inspection || !area || !finding) {
    return (
      <div className="modern-empty-state">
        <div className="modern-empty-state__icon">
          <AlertCircle size={32} />
        </div>
        <h2 className="modern-empty-state__title">Finding Not Found</h2>
        <p className="modern-empty-state__description">
          {error || "The finding you're looking for doesn't exist or has been removed."}
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
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate(`/inspections/${id}/${areaType}/${areaId}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Finding Details</h1>
        </div>
        
        {!editMode ? (
          <button 
            className="app-bar__action-button"
            onClick={() => setEditMode(true)}
          >
            <Edit size={20} />
          </button>
        ) : (
          <button 
            className="app-bar__action-button"
            onClick={() => setEditMode(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="finding-details">
        <div className="finding-details__card">
          <div className="finding-details__header">
            <div className="finding-details__title-row">
              {getSeverityIcon(finding.severity)}
              <h2 className="finding-details__title">
                {finding.subcategory}
              </h2>
            </div>
            {!editMode ? (
              <button 
                className="modern-btn modern-btn--icon-only"
                onClick={() => setEditMode(true)}
              >
                <Edit size={16} />
              </button>
            ) : (
              <button 
                className="modern-btn modern-btn--icon-only"
                onClick={() => setEditMode(false)}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="finding-details__content">
            <div className="finding-details__section">
              <h3 className="finding-details__label">Location</h3>
              <p className="finding-details__value">{area.name}</p>
            </div>
            
            <div className="finding-details__section">
              <h3 className="finding-details__label">Category</h3>
              <p className="finding-details__value">{finding.category}</p>
            </div>
            
            {editMode ? (
              <>
                <div className="finding-form__group">
                  <label className="finding-form__label">
                    Deficiency Description
                  </label>
                  <textarea
                    value={deficiency}
                    onChange={(e) => setDeficiency(e.target.value)}
                    rows={3}
                    className="finding-form__textarea"
                  />
                </div>
                
                <div className="finding-form__group">
                  <label className="finding-form__label">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="finding-form__select"
                  >
                    <option value="lifeThreatening">Life Threatening</option>
                    <option value="severe">Severe</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                  
                  <div className={`finding-details__severity finding-details__severity--${getSeverityClass(severity)}`}>
                    {getSeverityIcon(severity)}
                    <span className="ml-2">
                      Repair timeframe: {getRepairTimeframe(severity)}
                      {areaType === 'unit' && ` | ${getPassFailStatus(severity)}`}
                    </span>
                  </div>
                </div>
                
                <div className="finding-form__group">
                  <label className="finding-form__label">
                    Repair Status
                  </label>
                  <select
                    value={repairStatus}
                    onChange={(e) => setRepairStatus(e.target.value)}
                    className="finding-form__select"
                  >
                    <option value="open">Open</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="repaired">Repaired</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
                
                <div className="finding-form__group">
                  <label className="finding-form__label">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="finding-form__textarea"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="finding-details__section">
                  <h3 className="finding-details__label">Deficiency Description</h3>
                  <p className="finding-details__value">{finding.deficiency}</p>
                </div>
                
                <div className="finding-details__meta-grid">
                  <div className="finding-details__meta-item">
                    <h3 className="finding-details__label">Severity</h3>
                    <div className="flex items-center">
                      {getSeverityIcon(finding.severity)}
                      <span className="ml-1 text-gray-700 capitalize">{finding.severity}</span>
                    </div>
                  </div>
                  
                  <div className="finding-details__meta-item">
                    <h3 className="finding-details__label">Required Repair</h3>
                    <p className="finding-details__value">{getRepairTimeframe(finding.severity)}</p>
                  </div>
                  
                  {areaType === 'unit' && (
                    <div className="finding-details__meta-item">
                      <h3 className="finding-details__label">HCV/PBV Result</h3>
                      <p className={`font-medium ${
                        getPassFailStatus(finding.severity) === 'Fail' 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {getPassFailStatus(finding.severity)}
                      </p>
                    </div>
                  )}
                  
                  <div className="finding-details__meta-item">
                    <h3 className="finding-details__label">Status</h3>
                    {getStatusBadge(finding.status || 'open')}
                  </div>
                </div>
                
                {finding.notes && (
                  <div className="finding-details__section">
                    <h3 className="finding-details__label">Notes</h3>
                    <p className="finding-details__value">{finding.notes}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Photos */}
            <div className="finding-details__photos">
              <div className="photo-upload-section__title">
                <h3 className="finding-details__photos-title">Photos</h3>
                {editMode && (
                  <button
                    className="photo-upload-section__add-button"
                    onClick={() => setShowPhotoCapture(true)}
                  >
                    <Camera size={16} className="mr-1" /> Add Photo
                  </button>
                )}
              </div>
              
              <div className="finding-details__photo-grid">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="finding-details__photo"
                  >
                    <img 
                      src={photo.data} 
                      alt={`Finding ${index + 1}`}
                    />
                    {editMode && (
                      <button
                        className="finding-details__photo-remove"
                        onClick={() => handleRemovePhoto(photo.id)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                
                {editMode && (
                  <button
                    className="photo-add-placeholder"
                    onClick={() => setShowPhotoCapture(true)}
                  >
                    <Plus size={20} className="photo-add-placeholder-icon" />
                    <span className="photo-add-placeholder-text">Add</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Created/Updated timestamps */}
            <div className="finding-details__timestamps">
              <p className="finding-details__timestamp">Created: {new Date(finding.created || finding.createdAt).toLocaleString()}</p>
              {finding.updatedAt && (
                <p className="finding-details__timestamp">Last updated: {new Date(finding.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* NSPIRE Reference */}
        <div className="modern-card mb-4">
          <div className="modern-card__content">
            <h3 className="font-medium mb-2">NSPIRE Reference</h3>
            <p className="text-sm text-gray-600 mb-2">
              View the NSPIRE standards for this type of finding to understand requirements and scoring impact.
            </p>
            <button 
              className="modern-btn modern-btn--secondary"
              onClick={() => navigate(`/inspections/${id}/standards?category=${finding.category}&subcategory=${finding.subcategory}`)}
            >
              <ExternalLink size={16} className="mr-1" /> View NSPIRE Standards
            </button>
          </div>
        </div>
        
        {editMode && (
          <div className="modern-card mb-4">
            <div className="modern-card__content">
              <div className="flex items-center text-red-600">
                <Trash2 size={16} className="mr-2" />
                <h3 className="font-medium">Delete Finding</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2 mt-1">
                This action cannot be undone. This will permanently delete this finding.
              </p>
              <button 
                className="modern-btn modern-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Finding
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Actions */}
      <div className="modern-bottom-bar">
        <div className="modern-bottom-bar__content">
          <button 
            className="modern-btn modern-btn--secondary"
            onClick={() => navigate(`/inspections/${id}/${areaType}/${areaId}`)}
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          
          {editMode ? (
            <button 
              className="modern-btn modern-btn--primary"
              onClick={handleSave}
              disabled={saving || !deficiency.trim()}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" /> Save Changes
                </>
              )}
            </button>
          ) : (
            <button 
              className="modern-btn modern-btn--primary"
              onClick={() => setEditMode(true)}
            >
              <Edit size={16} className="mr-1" /> Edit Finding
            </button>
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                onClick={handleDelete}
              >
                Delete Finding
              </button>
              <button 
                className="delete-confirm-modal__cancel"
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

export default FindingDetailPage;