// src/utils/camera.js - Camera utilities for photo capture
const initCamera = async (videoElement) => {
  try {
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment" // Use back camera on mobile
      }
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    
    return stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    throw error;
  }
};

const capturePhoto = (videoElement, canvasElement) => {
  // Set canvas dimensions to match video
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  
  // Draw current video frame to canvas
  const context = canvasElement.getContext('2d');
  context.drawImage(videoElement, 0, 0);
  
  // Convert canvas to data URL (can be saved or displayed)
  return canvasElement.toDataURL('image/jpeg', 0.8); // Compress for Firebase
};

const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

export { initCamera, capturePhoto, stopCamera };