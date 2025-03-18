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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-75 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium">Capture Photo</h2>
        <button 
          className="text-white p-2 rounded-full hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col bg-black relative">
        {capturedImage ? (
          // Show captured image
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          // Show camera view or error
          <div className="flex-1 flex flex-col items-center justify-center">
            {loading ? (
              // Loading state
              <div className="text-white flex flex-col items-center">
                <Loader size={48} className="animate-spin mb-4" />
                <p>Accessing camera...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="text-white p-6 flex flex-col items-center text-center">
                <div className="bg-red-500 rounded-full p-4 mb-4">
                  <X size={32} />
                </div>
                <p className="mb-6">{error}</p>
                <button 
                  className="bg-white text-black py-2 px-4 rounded-lg mb-4 flex items-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={20} className="mr-2" /> 
                  Select from Gallery
                </button>
                <button 
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center"
                  onClick={startCamera}
                >
                  <RefreshCw size={20} className="mr-2" /> 
                  Try Again
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              // Camera view
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                onCanPlay={() => setLoading(false)}
              />
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Footer controls */}
      <div className="bg-black bg-opacity-75 p-4">
        {capturedImage ? (
          // Controls for captured image
          <div className="flex justify-between">
            <button 
              className="bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center"
              onClick={handleRetake}
            >
              <RefreshCw size={20} className="mr-2" /> Retake
            </button>
            <button 
              className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center"
              onClick={handleSave}
            >
              <Check size={20} className="mr-2" /> Use Photo
            </button>
          </div>
        ) : !error && !loading ? (
          // Camera controls
          <div className="flex justify-center">
            <button 
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gray-300" 
              onClick={capturePhoto}
              aria-label="Take photo"
            >
              <div className="w-12 h-12 rounded-full bg-white"></div>
            </button>
          </div>
        ) : (
          // If there's an error or loading, show option to select from gallery
          !loading && (
            <button 
              className="w-full bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center"
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