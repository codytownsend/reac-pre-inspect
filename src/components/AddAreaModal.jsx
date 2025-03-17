// src/components/AddAreaModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Check, X, Trash2 } from 'lucide-react';
import Button from './Button';
import { useInspection } from '../context/InspectionContext';

const AddAreaModal = ({ inspectionId, onClose, onSave }) => {
  const { nspireCategories } = useInspection();
  const [areaName, setAreaName] = useState('');
  const [areaType, setAreaType] = useState('unit'); // 'unit', 'exterior', 'common', etc.
  const [findings, setFindings] = useState([]);
  const [currentFinding, setCurrentFinding] = useState(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Initialize camera when needed
  useEffect(() => {
    if (showPhotoCapture && !capturedPhoto) {
      initCamera();
    }
    
    return () => {
      // Clean up camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showPhotoCapture, capturedPhoto]);
  
  // Start a new finding capture
  const startNewFinding = () => {
    setCurrentFinding({
      id: Date.now().toString(),
      category: 'site',
      subcategory: '',
      deficiency: '',
      severity: 1,
      notes: '',
      photos: []
    });
    setShowPhotoCapture(true);
    setCapturedPhoto(null);
  };
  
  // Handle capturing a photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame from video to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    
    // Stop camera after capture
    stopCamera();
  };
  
  // Initialize camera
  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera: ' + err.message);
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  // Handle saving the current finding
  const saveFinding = () => {
    if (!capturedPhoto) {
      setError('Please capture a photo first');
      return;
    }
    
    if (!currentFinding.category || !currentFinding.subcategory || !currentFinding.deficiency) {
      setError('Please fill out all required fields');
      return;
    }
    
    const updatedFinding = {
      ...currentFinding,
      photos: [...currentFinding.photos, { data: capturedPhoto, timestamp: new Date().toISOString() }]
    };
    
    setFindings([...findings, updatedFinding]);
    setCurrentFinding(null);
    setShowPhotoCapture(false);
    setCapturedPhoto(null);
  };
  
  // Handle saving the entire area with all findings
  const saveArea = () => {
    if (!areaName) {
      setError('Please enter an area name');
      return;
    }
    
    if (findings.length === 0) {
      setError('Please add at least one finding');
      return;
    }
    
    const newArea = {
      id: Date.now().toString(),
      name: areaName,
      areaType,
      findings
    };
    
    onSave(newArea);
  };
  
  // Remove a finding
  const removeFinding = (findingId) => {
    setFindings(findings.filter(f => f.id !== findingId));
  };
  
  return (
    <div className="modal-fullscreen">
      {showPhotoCapture ? (
        <div className="photo-capture-container">
          {capturedPhoto ? (
            // Show captured photo with finding form
            <div className="photo-review">
              <div className="modal-header">
                <h3>Add Finding Details</h3>
                <button className="close-button" onClick={() => {
                  setCapturedPhoto(null);
                  setCurrentFinding(null);
                  setShowPhotoCapture(false);
                }}><X size={24} /></button>
              </div>
              
              <div className="captured-image-container">
                <img src={capturedPhoto} alt="Captured" className="captured-image" />
              </div>
              
              <div className="finding-form">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={currentFinding.category}
                    onChange={(e) => setCurrentFinding({...currentFinding, category: e.target.value, subcategory: ''})}
                    className="form-control"
                  >
                    {Object.keys(nspireCategories).map(key => (
                      <option key={key} value={key}>
                        {nspireCategories[key].name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Subcategory</label>
                  <select 
                    value={currentFinding.subcategory}
                    onChange={(e) => setCurrentFinding({...currentFinding, subcategory: e.target.value})}
                    className="form-control"
                  >
                    <option value="">-- Select a subcategory --</option>
                    {nspireCategories[currentFinding.category]?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Deficiency</label>
                  <input 
                    type="text" 
                    value={currentFinding.deficiency}
                    onChange={(e) => setCurrentFinding({...currentFinding, deficiency: e.target.value})}
                    placeholder="Describe the issue"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Severity</label>
                  <select 
                    value={currentFinding.severity}
                    onChange={(e) => setCurrentFinding({...currentFinding, severity: parseInt(e.target.value)})}
                    className="form-control"
                  >
                    <option value="1">Level 1 - Minor</option>
                    <option value="2">Level 2 - Major</option>
                    <option value="3">Level 3 - Severe/Life-Threatening</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea 
                    value={currentFinding.notes}
                    onChange={(e) => setCurrentFinding({...currentFinding, notes: e.target.value})}
                    placeholder="Additional notes"
                    className="form-control"
                  />
                </div>
                
                <div className="action-buttons">
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setCapturedPhoto(null);
                      initCamera();
                    }}
                  >
                    <X size={16} /> Retake
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={saveFinding}
                  >
                    <Check size={16} /> Save Finding
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Show camera view
            <div className="camera-view">
              <div className="modal-header">
                <h3>Capture Photo</h3>
                <button className="close-button" onClick={() => {
                  stopCamera();
                  setCurrentFinding(null);
                  setShowPhotoCapture(false);
                }}><X size={24} /></button>
              </div>
              
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-preview"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-controls">
                <Button
                  variant="secondary"
                  onClick={() => {
                    stopCamera();
                    setCurrentFinding(null);
                    setShowPhotoCapture(false);
                  }}
                >
                  <X size={16} /> Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={capturePhoto}
                >
                  <Camera size={16} /> Capture
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show area form and findings list
        <div className="area-container">
          <div className="modal-header">
            <h2>Add Area/Unit</h2>
            <button className="close-button" onClick={onClose}><X size={24} /></button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="area-form">
            <div className="form-group">
              <label>Area/Unit Name</label>
              <input 
                type="text" 
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g., Unit 101, Building A Exterior"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Area Type</label>
              <select 
                value={areaType}
                onChange={(e) => setAreaType(e.target.value)}
                className="form-control"
              >
                <option value="unit">Unit</option>
                <option value="exterior">Building Exterior</option>
                <option value="common">Common Area</option>
                <option value="site">Site</option>
              </select>
            </div>
          </div>
          
          <div className="findings-section">
            <div className="section-header">
              <h3>Findings ({findings.length})</h3>
              <Button variant="primary" onClick={startNewFinding}>
                <Plus size={16} /> Add Finding
              </Button>
            </div>
            
            {findings.length === 0 ? (
              <div className="empty-findings">
                <p>No findings added yet. Click "Add Finding" to start.</p>
              </div>
            ) : (
              <div className="findings-list">
                {findings.map((finding, index) => (
                  <div key={finding.id} className="finding-item">
                    <div className="finding-number">{index + 1}</div>
                    <div className="finding-details">
                      <div className="finding-type">
                        {nspireCategories[finding.category]?.name}: {finding.subcategory}
                      </div>
                      <div className="finding-deficiency">{finding.deficiency}</div>
                      <div className={`severity-badge severity-${finding.severity}`}>
                        Level {finding.severity}
                      </div>
                    </div>
                    <div className="finding-photo">
                      {finding.photos && finding.photos.length > 0 && (
                        <img src={finding.photos[0].data} alt="Finding" />
                      )}
                    </div>
                    <button 
                      className="remove-finding" 
                      onClick={() => removeFinding(finding.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={saveArea}
              disabled={findings.length === 0 || !areaName}
            >
              <Check size={16} /> Save Area
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAreaModal;