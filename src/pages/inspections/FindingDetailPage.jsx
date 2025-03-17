// src/pages/inspections/FindingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import FindingPhotoCapture from '../../components/FindingPhotoCapture';
import { 
  Camera, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  CheckCircle,
  Save,
  Trash2,
  Edit,
  X,
  Check,
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
        
        // Find the area
        const foundArea = inspectionData.areas?.find(a => a.id === areaId);
        if (!foundArea) {
          setError('Area not found');
          return;
        }
        
        setArea(foundArea);
        
        // Find the finding
        const foundFinding = foundArea.findings?.find(f => f.id === findingId);
        if (!foundFinding) {
          setError('Finding not found');
          return;
        }
        
        setFinding(foundFinding);
        
        // Initialize form values
        setDeficiency(foundFinding.deficiency || '');
        setSeverity(foundFinding.severity || 'moderate');
        setNotes(foundFinding.notes || '');
        setRepairStatus(foundFinding.status || 'open');
        setPhotos(foundFinding.photos || []);
        
      } catch (error) {
        console.error("Error loading finding details:", error);
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
    
    setPhotos([...photos, newPhoto]);
    setShowPhotoCapture(false);
  };
  
  const handleRemovePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };
  
  const handleSave = async () => {
    if (!deficiency.trim()) {
      setError('Please describe the deficiency');
      return;
    }
    
    try {
      setSaving(true);
      
      // Update finding
      const updatedFinding = {
        ...finding,
        deficiency,
        severity,
        notes,
        status: repairStatus,
        photos,
        updatedAt: new Date().toISOString()
      };
      
      // Update findings array in the area
      const updatedFindings = area.findings.map(f => 
        f.id === findingId ? updatedFinding : f
      );
      
      // Update areas array
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? { ...a, findings: updatedFindings } : a
      );
      
      // Update inspection
      await updateInspection(id, { areas: updatedAreas });
      
      // Exit edit mode
      setEditMode(false);
      setSaving(false);
      setFinding(updatedFinding);
      
    } catch (error) {
      console.error("Error updating finding:", error);
      setError('Error updating finding');
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setSaving(true);
      
      // Remove finding from the area
      const updatedFindings = area.findings.filter(f => f.id !== findingId);
      
      // Update areas array
      const updatedAreas = inspection.areas.map(a => 
        a.id === areaId ? { ...a, findings: updatedFindings } : a
      );
      
      // Update inspection
      await updateInspection(id, { areas: updatedAreas });
      
      // Navigate back to area page
      navigate(`/inspections/${id}/${areaType}/${areaId}`);
      
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError('Error deleting finding');
      setSaving(false);
    }
  };
  
  const getSeverityIcon = (severityLevel) => {
    switch (severityLevel) {
      case 'lifeThreatening':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'severe':
        return <AlertTriangle size={20} className="text-orange-500" />;
      case 'moderate':
        return <Clock size={20} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={20} className="text-green-500" />;
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
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Open</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Scheduled</span>;
      case 'repaired':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Repaired</span>;
      case 'verified':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Verified</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };
  
  if (loading) {
    return <Loading message="Loading finding details..." />;
  }
  
  if (!inspection || !area || !finding) {
    return (
      <div className="container">
        <Alert type="danger" message={error || "Finding not found"} />
        <Button variant="primary" onClick={() => navigate(`/inspections/${id}`)}>
          Back to Inspection
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container pb-16">
      <Header 
        title="Finding Details" 
        showBack={true}
      />
      
      {error && <Alert type="danger" message={error} />}
      
      {/* Finding Card */}
      <Card className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {getSeverityIcon(finding.severity)}
            <h2 className="font-bold ml-2">
              {finding.subcategory}
            </h2>
          </div>
          {!editMode ? (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit size={16} className="mr-1" /> Edit
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(false)}
            >
              <X size={16} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
          <p className="text-gray-700">{area.name}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
          <p className="text-gray-700">{finding.category}</p>
        </div>
        
        {editMode ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deficiency Description
              </label>
              <textarea
                value={deficiency}
                onChange={(e) => setDeficiency(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repair Status
              </label>
              <select
                value={repairStatus}
                onChange={(e) => setRepairStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="scheduled">Scheduled</option>
                <option value="repaired">Repaired</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Deficiency Description</h3>
              <p className="text-gray-700">{finding.deficiency}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Severity</h3>
                <div className="flex items-center">
                  {getSeverityIcon(finding.severity)}
                  <span className="ml-1 text-gray-700 capitalize">{finding.severity}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Required Repair</h3>
                <p className="text-gray-700">{getRepairTimeframe(finding.severity)}</p>
              </div>
              
              {areaType === 'unit' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">HCV/PBV Result</h3>
                  <p className={`font-medium ${
                    getPassFailStatus(finding.severity) === 'Fail' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {getPassFailStatus(finding.severity)}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                {getStatusBadge(finding.status || 'open')}
              </div>
            </div>
            
            {finding.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-gray-700">{finding.notes}</p>
              </div>
            )}
          </>
        )}
        
        {/* Photos */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Photos</h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative h-24 w-24 rounded overflow-hidden">
                <img 
                  src={photo.data} 
                  alt="Finding" 
                  className="h-full w-full object-cover"
                />
                {editMode && (
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            
            {editMode && (
              <button
                className="h-24 w-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400"
                onClick={() => setShowPhotoCapture(true)}
              >
                <Camera size={24} />
              </button>
            )}
          </div>
        </div>
        
        {/* Created/Updated timestamps */}
        <div className="text-xs text-gray-500 border-t pt-3 mt-3">
          <p>Created: {new Date(finding.createdAt).toLocaleString()}</p>
          {finding.updatedAt && (
            <p>Last updated: {new Date(finding.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </Card>
      
      {/* NSPIRE Reference */}
      <Card className="mb-4">
        <h3 className="font-medium mb-2">NSPIRE Reference</h3>
        <p className="text-sm text-gray-600 mb-2">
          View the NSPIRE standards for this type of finding to understand requirements and scoring impact.
        </p>
        <Button 
          variant="secondary" 
          onClick={() => navigate(`/inspections/${id}/standards?category=${finding.category}&subcategory=${finding.subcategory}`)}
        >
          <ExternalLink size={16} className="mr-1" /> View NSPIRE Standards
        </Button>
      </Card>
      
      {editMode && (
        <Card className="mb-4">
          <div className="flex items-center text-red-600">
            <Trash2 size={16} className="mr-2" />
            <h3 className="font-medium">Delete Finding</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2 mt-1">
            This action cannot be undone. This will permanently delete this finding.
          </p>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Finding
          </Button>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white border-t">
        <div className="container flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/inspections/${id}/${areaType}/${areaId}`)}
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
          
          {editMode ? (
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={saving || !deficiency.trim()}
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={16} className="mr-1" /> Save Changes
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setEditMode(true)}
            >
              <Edit size={16} className="mr-1" /> Edit Finding
            </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">Delete Finding?</h3>
            <p className="mb-4">Are you sure you want to delete this finding? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete Finding'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindingDetailPage;