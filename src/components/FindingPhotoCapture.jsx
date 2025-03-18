import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Image, RefreshCw, Loader } from 'lucide-react';

const FindingPhotoCapture = ({ onPhotoCapture, onClose }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Start camera
  const startCamera = async () => {
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setCameraPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setError('');
    } catch (err) {
      console.error("Camera error:", err);
      setCameraPermission(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on your device.');
      } else {
        setError('Could not access camera: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera to save battery
    stopCamera();
  };
  
  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  // Save photo
  const handleSave = () => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
    }
  };
  
  // Handle file selection
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
    <div className="photo-capture">
      {/* Header */}
      <div className="photo-capture__header">
        <h2 className="photo-capture__title">Capture Photo</h2>
        <button 
          className="photo-capture__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="photo-capture__content">
        {capturedImage ? (
          // Show captured image
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="photo-capture__preview"
          />
        ) : (
          // Show camera view or error
          <>
            {loading ? (
              // Loading state
              <div className="photo-capture__loading">
                <div className="photo-capture__loading-spinner"></div>
                <p>Accessing camera...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="photo-capture__error">
                <div className="photo-capture__error-icon">
                  <X size={32} />
                </div>
                <p className="photo-capture__error-message">{error}</p>
                <button 
                  className="modern-btn modern-btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={20} className="mr-2" /> 
                  Select from Gallery
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*" 
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              // Camera view
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="photo-capture__video"
                onCanPlay={() => setLoading(false)}
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      {/* Footer controls */}
      <div className="photo-capture__footer">
        {capturedImage ? (
          // Controls for captured image
          <div className="photo-capture__controls">
            <button 
              className="photo-capture__retake"
              onClick={handleRetake}
            >
              <RefreshCw size={20} className="mr-2" /> Retake
            </button>
            <button 
              className="photo-capture__use"
              onClick={handleSave}
            >
              <Check size={20} className="mr-2" /> Use Photo
            </button>
          </div>
        ) : !error && !loading ? (
          // Camera controls
          <button 
            className="photo-capture__capture-button" 
            onClick={capturePhoto}
            aria-label="Take photo"
          >
            <div className="photo-capture__capture-button-inner"></div>
          </button>
        ) : (
          // If there's an error or loading, show option to select from gallery
          !loading && (
            <button 
              className="photo-capture__upload-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} className="mr-2" /> 
              Select from Gallery
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default FindingPhotoCapture;