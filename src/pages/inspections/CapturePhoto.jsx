// src/pages/inspections/CapturePhoto.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { Camera, Check, X, Image, AlertTriangle } from 'lucide-react';

const CapturePhoto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getInspection, addPhotoToFinding } = useInspection();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Get finding ID from location state
  const findingId = location.state?.findingId;
  
  useEffect(() => {
    // Make sure we have the inspection and finding ID
    const inspection = getInspection(id);
    if (!inspection || !findingId) {
      navigate(`/inspections/${id}`);
      return;
    }
    
    // Check for camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setLoading(false);
      setError('Your browser doesn\'t support camera access');
      return;
    }
    
    // Initialize camera when component mounts
    const setupCamera = async () => {
      try {
        setLoading(true);
        console.log("Requesting camera access...");
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera on mobile if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        console.log("Camera access granted");
        setStream(videoStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          
          // Make sure we can actually play the stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => {
              console.error("Error playing video:", e);
              setError('Could not play camera stream: ' + e.message);
            });
          };
        }
        
        setError('');
      } catch (err) {
        console.error("Camera error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on your device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
          // Try again with more relaxed constraints
          try {
            const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(simpleStream);
            if (videoRef.current) {
              videoRef.current.srcObject = simpleStream;
            }
          } catch (fallbackErr) {
            setError('Could not access camera: ' + fallbackErr.message);
          }
        } else {
          setError('Could not access camera: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    setupCamera();
    
    // Clean up on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log("Stopping camera track");
          track.stop();
        });
      }
    };
  }, [id, findingId, getInspection, navigate]);
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Capture the current frame
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame from video to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL (jpeg format with quality 0.8)
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  const handleRetake = async () => {
    setCapturedImage(null);
    
    // Restart the camera
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(videoStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      
      setError('');
    } catch (err) {
      setError('Could not access camera: ' + err.message);
    }
  };
  
  const handleSave = async () => {
    if (!capturedImage) return;
    
    try {
      setUploadingPhoto(true);
      // Save the photo to the finding
      await addPhotoToFinding(id, findingId, capturedImage);
      
      // Navigate back to the inspection detail page
      navigate(`/inspections/${id}`);
    } catch (error) {
      setError('Error saving photo: ' + error.message);
      setUploadingPhoto(false);
    }
  };
  
  // Fallback for file input when camera is not available or denied
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="container camera-page">
      <Header 
        title="Take Photo" 
        showBack={true} 
      />
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="camera-container">
        {loading ? (
          <div className="camera-loading" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            padding: '20px'
          }}>
            <p>Initializing camera...</p>
          </div>
        ) : (
          <>
            {!capturedImage ? (
              // Camera view
              <>
                {cameraSupported && !permissionDenied ? (
                  <div className="video-container">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="camera-preview"
                      style={{ width: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div className="camera-error" style={{ textAlign: 'center', padding: '30px' }}>
                    <AlertTriangle size={48} color="#dc3545" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '16px' }}>
                      {permissionDenied 
                        ? 'Camera Access Denied' 
                        : 'Camera Not Available'}
                    </h3>
                    <p style={{ marginBottom: '24px' }}>
                      {permissionDenied 
                        ? 'Please enable camera access in your browser settings and try again.' 
                        : 'Your device or browser doesn\'t support camera access.'}
                    </p>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <p>You can upload an image from your device instead:</p>
                    </div>
                    
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        style={{ 
                          display: 'block', 
                          width: '100%', 
                          padding: '10px', 
                          marginBottom: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                )}
                
                {cameraSupported && !permissionDenied && (
                  <div className="camera-controls" style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    padding: '16px',
                    marginTop: '16px'
                  }}>
                    <Button 
                      variant="primary" 
                      className="capture-button"
                      onClick={handleCapture}
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={24} />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Captured image view
              <>
                <div className="capture-preview" style={{ 
                  width: '100%', 
                  maxHeight: '70vh', 
                  overflow: 'hidden', 
                  marginBottom: '16px',
                  borderRadius: '8px'
                }}>
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="captured-image" 
                    style={{ width: '100%', objectFit: 'contain' }}
                  />
                </div>
                
                <div className="capture-controls" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  gap: '12px',
                  padding: '16px'
                }}>
                  <Button 
                    variant="secondary" 
                    onClick={handleRetake}
                    disabled={uploadingPhoto || (!cameraSupported || permissionDenied)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <X size={18} /> Retake
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={uploadingPhoto}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {uploadingPhoto ? 'Saving...' : (
                      <>
                        <Check size={18} /> Save
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
            
            {/* Hidden canvas for capturing */}
            <canvas 
              ref={canvasRef} 
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CapturePhoto;