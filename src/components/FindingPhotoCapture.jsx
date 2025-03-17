// src/components/FindingPhotoCapture.jsx
import React, { useState, useRef } from 'react';
import { Camera, X, Check, Image } from 'lucide-react';
import Button from './Button';

const FindingPhotoCapture = ({ onPhotoCapture, onClose }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Start camera
  const startCamera = async () => {
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
      
      setError('');
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on your device.');
      } else {
        setError('Could not access camera: ' + err.message);
      }
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
    
    // Stop camera
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
  
  // Component did mount
  React.useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div className="bg-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">Capture Photo</h2>
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col bg-black relative">
        {capturedImage ? (
          // Show captured image
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-h-full max-w-full"
            />
          </div>
        ) : (
          // Show camera view or error
          <>
            {error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
                <div className="text-red-500 mb-4">{error}</div>
                <p className="mb-4">You can upload an image from your device instead:</p>
                <Button 
                  variant="secondary" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={16} className="mr-2" /> Select Image
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-contain"
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="bg-white p-4 flex justify-between">
        {capturedImage ? (
          <>
            <Button variant="secondary" onClick={handleRetake}>
              <X size={16} className="mr-2" /> Retake
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Check size={16} className="mr-2" /> Use Photo
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {!error && (
              <Button variant="primary" onClick={capturePhoto}>
                <Camera size={16} className="mr-2" /> Capture
              </Button>
            )}
            {error && (
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={16} className="mr-2" /> Select Image
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindingPhotoCapture;