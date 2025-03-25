import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';

const FindingPhotoCapture = ({ onPhotoCapture, onClose }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let stream = null;

  // Start camera immediately when component mounts
  useEffect(() => {
    // Simple function to start the camera
    async function startCamera() {
      try {
        console.log("Starting camera...");
        // Basic camera request - keeping it simple
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"  // This specifies the rear-facing camera
          },
          audio: false
        });
        
        stream = mediaStream;
        
        // Connect stream to video element
        if (videoRef.current) {
          console.log("Setting video source...");
          videoRef.current.srcObject = mediaStream;
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(`Camera access failed: ${err.message}`);
      }
    }
    
    startCamera();
    
    // Clean up function to stop the camera when component unmounts
    return () => {
      if (stream) {
        console.log("Stopping camera...");
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Function to capture the current frame from video to canvas
  const takePhoto = () => {
    console.log("Taking photo...");
    if (!videoRef.current) {
      console.error("Video element not found");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/jpeg');
      console.log("Photo captured successfully");
      setCapturedImage(imageData);
      
      // Stop the camera after capture to save resources
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError(`Failed to capture photo: ${err.message}`);
    }
  };

  // Function to retake photo - restart camera
  const retakePhoto = async () => {
    setCapturedImage(null);
    setError('');
    
    try {
      console.log("Restarting camera for retake...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      stream = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Error restarting camera:", err);
      setError(`Couldn't restart camera: ${err.message}`);
    }
  };

  // Function to accept the captured photo
  const acceptPhoto = () => {
    if (capturedImage) {
      console.log("Photo accepted, sending to parent component");
      onPhotoCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-1500 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-70 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium">
          {capturedImage ? 'Review Photo' : 'Take Photo'}
        </h2>
        <button 
          className="p-2 rounded-full bg-gray-800 text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {capturedImage ? (
          // Show captured photo for review
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          // Show camera feed or error
          <>
            {error ? (
              <div className="text-white text-center p-4">
                <p className="mb-4 text-red-400">{error}</p>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={retakePhoto}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className="h-full w-full object-cover"
                onCanPlay={() => console.log("Video can play now")}
              />
            )}
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      {/* Footer with controls */}
      <div className="bg-black bg-opacity-70 p-4">
        {capturedImage ? (
          // Review controls
          <div className="flex justify-between">
            <button 
              className="px-4 py-3 bg-gray-700 text-white rounded-lg"
              onClick={retakePhoto}
            >
              <RefreshCw size={20} className="mr-2 inline" /> 
              Retake
            </button>
            <button 
              className="px-4 py-3 bg-green-600 text-white rounded-lg"
              onClick={acceptPhoto}
            >
              <Check size={20} className="mr-2 inline" /> 
              Use Photo
            </button>
          </div>
        ) : (
          // Camera controls
          <div className="flex justify-center">
            <button 
              disabled={!cameraReady}
              className={`w-16 h-16 rounded-full ${cameraReady ? 'bg-white' : 'bg-gray-500'} flex items-center justify-center`}
              onClick={takePhoto}
            >
              <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                <Camera size={24} className="text-black" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingPhotoCapture;