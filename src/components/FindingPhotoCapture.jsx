import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, RefreshCw, Image } from 'lucide-react';

const FindingPhotoCapture = ({ onPhotoCapture, onClose }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize camera when component mounts
  useEffect(() => {
    let timeoutId;
    
    const initCamera = async () => {
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent indefinite loading state
      timeoutId = setTimeout(() => {
        if (loading) {
          setError("Camera initialization timed out. Please try again.");
          setLoading(false);
        }
      }, 10000);
      
      try {
        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        // Set the stream to state
        setStream(mediaStream);
        
        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Listen for video to be ready
          videoRef.current.onloadeddata = () => {
            setLoading(false);
            clearTimeout(timeoutId);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
        let errorMessage = "Could not access camera";
        
        if (err.name === 'NotAllowedError') {
          errorMessage = "Camera access was denied";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No camera found on your device";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "Camera is in use by another application";
        } else if (err.name === 'AbortError' || err.name === 'SecurityError') {
          errorMessage = "Camera access blocked by browser";
        }
        
        setError(`${errorMessage}`);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };
    
    initCamera();
    
    // Clean up on unmount
    return () => {
      clearTimeout(timeoutId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Capture photo from video feed
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera components not ready");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      // Stop camera to save resources
      stopCamera();
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("Failed to capture photo");
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  // Retry camera initialization
  const retryCamera = () => {
    // Clean up existing stream first
    stopCamera();
    
    // Reset state
    setLoading(true);
    setError(null);
    
    // Start new camera stream
    navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    })
    .then(mediaStream => {
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => {
          setLoading(false);
        };
      }
    })
    .catch(err => {
      console.error("Camera retry error:", err);
      setError("Could not access camera. Please check permissions.");
      setLoading(false);
    });
  };
  
  // Retake photo (go back to camera)
  const handleRetake = () => {
    setCapturedImage(null);
    retryCamera();
  };
  
  // Use the captured photo
  const handleSave = () => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
    }
  };
  
  // Handle file selection as fallback
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
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium">
          {capturedImage ? 'Review Photo' : 'Take Photo'}
        </h2>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white hover:bg-opacity-20"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {capturedImage ? (
          // Show captured image
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          // Show camera view or error
          <>
            {loading ? (
              // Loading state
              <div className="text-white flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Accessing camera...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="text-white p-6 text-center max-w-md">
                <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} />
                </div>
                <p className="mb-8">{error}</p>
                <div className="flex flex-col gap-4">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center mx-auto"
                    onClick={retryCamera}
                  >
                    <Camera size={20} className="mr-2" /> 
                    Try Again
                  </button>
                  <button 
                    className="bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg flex items-center justify-center mx-auto"
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
                  />
                </div>
              </div>
            ) : (
              // Camera view
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Footer controls */}
      <div className="bg-black bg-opacity-50 p-4">
        {capturedImage ? (
          // Controls for captured image
          <div className="flex justify-between max-w-md mx-auto">
            <button 
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center"
              onClick={handleRetake}
            >
              <RefreshCw size={20} className="mr-2" /> Retake
            </button>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center"
              onClick={handleSave}
            >
              <Check size={20} className="mr-2" /> Use Photo
            </button>
          </div>
        ) : !error && !loading ? (
          // Camera controls
          <div className="flex justify-center">
            <button 
              className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center"
              onClick={capturePhoto}
              aria-label="Take photo"
            >
              <div className="w-12 h-12 rounded-full bg-white"></div>
            </button>
          </div>
        ) : (
          // If there's an error, allow selecting from gallery
          error && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 w-full max-w-md mx-auto text-white py-3 rounded-lg flex items-center justify-center"
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