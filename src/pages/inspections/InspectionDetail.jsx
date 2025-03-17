// src/pages/inspections/InspectionDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { 
  Plus, 
  Calendar, 
  User, 
  Clipboard, 
  Camera, 
  Trash2, 
  Download,
  Mail,
  Share2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, updateInspection, deleteInspection, addFinding, deleteFinding, nspireCategories, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [score, setScore] = useState(100);
  const [expandedFindings, setExpandedFindings] = useState({});
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [newFinding, setNewFinding] = useState({
    category: 'site',
    subcategory: '',
    location: '',
    deficiency: '',
    severity: 1,
    notes: '',
    photos: []
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get inspection details
        const inspectionData = getInspection(id);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        setInspection(inspectionData);
        
        // Get property details
        const propertyData = getProperty(inspectionData.propertyId);
        if (!propertyData) {
          setError('Property not found for this inspection');
        } else {
          setProperty(propertyData);
        }
        
        // Calculate score
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
        
        // Initialize expanded state for findings
        if (inspectionData.findings) {
          const expandedState = {};
          inspectionData.findings.forEach(finding => {
            expandedState[finding.id] = false;
          });
          setExpandedFindings(expandedState);
        }
      } catch (error) {
        setError('Error loading inspection: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, navigate, calculateScore]);
  
  const handleDeleteInspection = async () => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await deleteInspection(id);
        navigate('/inspections');
      } catch (error) {
        setError('Error deleting inspection: ' + error.message);
      }
    }
  };
  
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateInspection(id, { status: newStatus });
      setInspection({ ...inspection, status: newStatus });
    } catch (error) {
      setError('Error updating status: ' + error.message);
    }
  };
  
  const handleAddFindingChange = (e) => {
    const { name, value } = e.target;
    setNewFinding(prev => ({
      ...prev,
      [name]: name === 'severity' ? parseInt(value) : value
    }));
  };
  
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setNewFinding(prev => ({
      ...prev,
      category,
      subcategory: ''
    }));
  };
  
  const handleAddFinding = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newFinding.subcategory || !newFinding.location || !newFinding.deficiency) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      // Add the finding along with any captured photos
      const findingToAdd = {
        ...newFinding,
        photos: capturedPhotos
      };
      
      await addFinding(id, findingToAdd);
      
      // Reset form and close modal
      setNewFinding({
        category: 'site',
        subcategory: '',
        location: '',
        deficiency: '',
        severity: 1,
        notes: '',
        photos: []
      });
      setCapturedPhotos([]);
      setShowAddModal(false);
      setShowPhotoCapture(false);
      
      // Refetch inspection
      const updatedInspection = getInspection(id);
      setInspection(updatedInspection);
      
      // Recalculate score
      const calculatedScore = calculateScore(id);
      setScore(calculatedScore);
      
      // Initialize expanded state for new finding
      if (updatedInspection.findings) {
        const newFindingId = updatedInspection.findings[updatedInspection.findings.length - 1].id;
        setExpandedFindings(prev => ({
          ...prev,
          [newFindingId]: true
        }));
      }
    } catch (error) {
      setError('Error adding finding: ' + error.message);
    }
  };
  
  const handleDeleteFinding = async (findingId) => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      try {
        await deleteFinding(id, findingId);
        
        // Refetch inspection
        const updatedInspection = getInspection(id);
        setInspection(updatedInspection);
        
        // Recalculate score
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
      } catch (error) {
        setError('Error deleting finding: ' + error.message);
      }
    }
  };
  
  const handleAddPhoto = () => {
    setShowPhotoCapture(true);
  };
  
  const handlePhotoCapture = (photoData) => {
    setCapturedPhotos(prev => [...prev, photoData]);
  };
  
  const handleRemovePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };

  const toggleFindingExpand = (findingId) => {
    setExpandedFindings(prev => ({
      ...prev,
      [findingId]: !prev[findingId]
    }));
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-indicator">Loading inspection details...</div>
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="container">
        <div className="alert alert-danger">Inspection not found</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/inspections')}
        >
          Back to Inspections
        </button>
      </div>
    );
  }
  
  return (
    <div className="container">
      {/* Property header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-2">
          <button 
            className="btn-icon" 
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}
          >
            <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <h1 className="page-title">{property ? property.name : 'Inspection Details'}</h1>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      {/* Inspection details card - improved layout */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Inspection Details</h2>
          <div className="score-badge" style={{ margin: 0 }}>Score: {score}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            <span>{new Date(inspection.date).toLocaleDateString()}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            <span>Inspector: {inspection.inspector}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <label htmlFor="status" style={{ marginRight: '8px' }}>Status:</label>
          <select
            id="status"
            value={inspection.status}
            onChange={handleStatusChange}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: inspection.status === 'Completed' ? '#d4edda' : 
                             inspection.status === 'In Progress' ? '#fff3cd' : '#cce5ff'
            }}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        {inspection.notes && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '8px' }}>Notes</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{inspection.notes}</p>
          </div>
        )}
      </div>
      
      {/* Actions row - improved layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', marginBottom: '24px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Finding
        </button>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleGenerateReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} /> Report
          </button>
          
          <button 
            className="btn btn-danger"
            onClick={handleDeleteInspection}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
      
      {/* Findings section - improved layout */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clipboard size={20} />
          Findings {inspection.findings ? `(${inspection.findings.length})` : '(0)'}
        </h2>
        
        {!inspection.findings || inspection.findings.length === 0 ? (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '32px 16px', 
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <Clipboard size={32} style={{ color: '#ccc', marginBottom: '16px' }} />
            <p style={{ marginBottom: '8px' }}>No findings recorded yet.</p>
            <p>Tap the "Add Finding" button to add issues found during inspection.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inspection.findings.map(finding => (
              <div 
                key={finding.id}
                className="card finding-card"
                style={{ margin: 0, overflow: 'hidden' }}
              >
                {/* Finding header - always visible */}
                <div 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: expandedFindings[finding.id] ? '1px solid #eee' : 'none',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFindingExpand(finding.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: finding.severity === 3 ? '#f8d7da' : 
                                       finding.severity === 2 ? '#fff3cd' : '#cce5ff',
                      color: finding.severity === 3 ? '#721c24' : 
                             finding.severity === 2 ? '#856404' : '#004085',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {finding.severity}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>
                      {nspireCategories[finding.category]?.name}: {finding.subcategory}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`severity-badge severity-${finding.severity}`}>
                      Level {finding.severity}
                    </span>
                    {expandedFindings[finding.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                
                {/* Finding content - visible when expanded */}
                {expandedFindings[finding.id] && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Location:</strong> {finding.location}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Deficiency:</strong> {finding.deficiency}
                      </div>
                      {finding.notes && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Notes:</strong> {finding.notes}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/inspections/${id}/photo`, { state: { findingId: finding.id } })}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Camera size={16} /> 
                        {finding.photos && finding.photos.length > 0 ? 
                          `Photos (${finding.photos.length})` : 'Add Photo'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteFinding(finding.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Photo thumbnails */}
                    {finding.photos && finding.photos.length > 0 && (
                      <div className="photo-thumbnails" style={{ marginTop: '16px' }}>
                        {finding.photos.map((photo, index) => (
                          <div 
                            key={photo.id || index} 
                            className="photo-thumbnail"
                            onClick={() => navigate(`/inspections/${id}/photo`, { 
                              state: { findingId: finding.id, photoIndex: index } 
                            })}
                          >
                            <img 
                              src={photo.data || photo.url} 
                              alt={`Finding ${index + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Finding Modal - improved with integrated photo capture */}
      {showAddModal && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            if (!showPhotoCapture) {
              setShowAddModal(false);
              setCapturedPhotos([]);
            }
          }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div 
            className="modal-container" 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div 
              className="modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #eee'
              }}
            >
              <h3 style={{ margin: 0 }}>Add Finding</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setCapturedPhotos([]);
                  setShowPhotoCapture(false);
                }}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>
            
            {showPhotoCapture ? (
              <div className="modal-content" style={{ overflowY: 'auto', padding: '16px' }}>
                <PhotoCapture 
                  onCapture={handlePhotoCapture}
                  onBack={() => setShowPhotoCapture(false)}
                  capturedPhotos={capturedPhotos}
                />
              </div>
            ) : (
              <div className="modal-content" style={{ overflowY: 'auto', padding: '16px', flexGrow: 1 }}>
                <form onSubmit={handleAddFinding}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      className="form-control"
                      value={newFinding.category}
                      onChange={handleCategoryChange}
                      required
                    >
                      {Object.keys(nspireCategories).map(key => (
                        <option key={key} value={key}>
                          {nspireCategories[key].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="subcategory">Subcategory</label>
                    <select
                      id="subcategory"
                      name="subcategory"
                      className="form-control"
                      value={newFinding.subcategory}
                      onChange={handleAddFindingChange}
                      required
                    >
                      <option value="">-- Select a subcategory --</option>
                      {nspireCategories[newFinding.category]?.subcategories.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="form-control"
                      value={newFinding.location}
                      onChange={handleAddFindingChange}
                      placeholder="e.g., Building A, Unit 101, North Entrance"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="deficiency">Deficiency</label>
                    <input
                      id="deficiency"
                      name="deficiency"
                      type="text"
                      className="form-control"
                      value={newFinding.deficiency}
                      onChange={handleAddFindingChange}
                      placeholder="e.g., Broken handrail, missing smoke detector"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="severity">Severity Level</label>
                    <select
                      id="severity"
                      name="severity"
                      className="form-control"
                      value={newFinding.severity}
                      onChange={handleAddFindingChange}
                      required
                    >
                      <option value="1">Level 1 - Minor</option>
                      <option value="2">Level 2 - Major</option>
                      <option value="3">Level 3 - Severe/Life-Threatening</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="form-control"
                      rows="3"
                      value={newFinding.notes}
                      onChange={handleAddFindingChange}
                      placeholder="Additional details about the deficiency"
                    ></textarea>
                  </div>
                  
                  {/* Photo section */}
                  <div className="form-group">
                    <label className="form-label">Photos</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddPhoto}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Camera size={16} /> Capture Photo
                      </button>
                      
                      {capturedPhotos.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                            {capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''} captured
                          </p>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            {capturedPhotos.map((photo, index) => (
                              <div 
                                key={index} 
                                style={{ 
                                  position: 'relative',
                                  width: '80px', 
                                  height: '80px', 
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}
                              >
                                <img 
                                  src={photo} 
                                  alt={`Captured ${index + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(index)}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    padding: 0,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-actions" style={{ marginTop: '24px', marginBottom: '16px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowAddModal(false);
                        setCapturedPhotos([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      Add Finding
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// PhotoCapture component
const PhotoCapture = ({ onCapture, onBack, capturedPhotos }) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const startCamera = async () => {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        setStream(videoStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      } catch (err) {
        setError('Could not access camera: ' + err.message);
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame from video to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    onCapture(photoData);
    setCapturing(false);
  };
  
  return (
    <div style={{ width: '100%' }}>
      {error ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#721c24', marginBottom: '16px' }}>{error}</div>
          <button 
            className="btn btn-secondary" 
            onClick={onBack}
          >
            Back
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={onBack}
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button 
              className="btn btn-primary" 
              onClick={takePhoto}
              disabled={capturing}
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px' 
              }}
            >
              <Camera size={16} /> {capturing ? 'Capturing...' : 'Take Photo'}
            </button>
          </div>
          
          {capturedPhotos.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>
                Captured Photos ({capturedPhotos.length})
              </h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {capturedPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={photo} 
                      alt={`Captured ${index + 1}`} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InspectionDetail;