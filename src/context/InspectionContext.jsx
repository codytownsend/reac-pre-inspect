// src/context/InspectionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  arrayUnion
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './AuthContext';

const InspectionContext = createContext();

export const useInspection = () => {
  return useContext(InspectionContext);
};

export const InspectionProvider = ({ children }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // NSPIRE categories and subcategories
  const nspireCategories = {
    site: {
      name: 'Site',
      subcategories: [
        'Fencing and Gates',
        'Grounds',
        'Mailboxes',
        'Market Appeal',
        'Neighborhood Environment',
        'Parking Lots/Driveways',
        'Play Areas and Equipment',
        'Refuse Disposal',
        'Retaining Walls',
        'Storm Drainage',
        'Walkways/Steps'
      ]
    },
    buildingExterior: {
      name: 'Building Exterior',
      subcategories: [
        'Doors',
        'Fire Escapes',
        'Foundations',
        'Lighting',
        'Roofs',
        'Walls',
        'Windows'
      ]
    },
    buildingSystems: {
      name: 'Building Systems',
      subcategories: [
        'Domestic Water',
        'Electrical System',
        'Elevators',
        'Emergency Power',
        'Fire Protection',
        'HVAC',
        'Sanitary System'
      ]
    },
    commonAreas: {
      name: 'Common Areas',
      subcategories: [
        'Basement/Garage/Carport',
        'Closet/Utility/Mechanical',
        'Community Room',
        'Day Care',
        'Halls/Corridors/Stairs',
        'Kitchen',
        'Laundry Room',
        'Lobby',
        'Office',
        'Other Community Spaces',
        'Patio/Porch/Balcony',
        'Pools and Related Structures',
        'Restrooms',
        'Storage',
        'Trash Collection Areas'
      ]
    },
    unit: {
      name: 'Unit',
      subcategories: [
        'Bathroom',
        'Call-for-Aid',
        'Ceiling',
        'Doors',
        'Electrical System',
        'Floors',
        'Hot Water Heater',
        'HVAC System',
        'Kitchen',
        'Laundry Area',
        'Lighting',
        'Outlets/Switches',
        'Patio/Porch/Balcony',
        'Smoke Detectors',
        'Stairs',
        'Walls',
        'Windows'
      ]
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setInspections([]);
      setLoading(false);
      return;
    }

    const fetchInspections = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'inspections'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const inspectionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setInspections(inspectionsData);
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [currentUser]);

  const createInspection = async (inspection) => {
    try {
      const newInspection = {
        ...inspection,
        userId: currentUser.uid,
        findings: [],
        created: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'inspections'), newInspection);
      
      const inspectionWithId = {
        ...newInspection,
        id: docRef.id
      };
      
      setInspections(prev => [...prev, inspectionWithId]);
      
      return inspectionWithId;
    } catch (error) {
      console.error('Error creating inspection:', error);
      throw error;
    }
  };

  const getInspection = (id) => {
    return inspections.find(inspection => inspection.id === id);
  };

  const updateInspection = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, 'inspections', id), updatedData);
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === id 
            ? { ...inspection, ...updatedData } 
            : inspection
        )
      );
    } catch (error) {
      console.error('Error updating inspection:', error);
      throw error;
    }
  };

  const deleteInspection = async (id) => {
    try {
      await deleteDoc(doc(db, 'inspections', id));
      
      setInspections(prev => 
        prev.filter(inspection => inspection.id !== id)
      );
    } catch (error) {
      console.error('Error deleting inspection:', error);
      throw error;
    }
  };

  const addFinding = async (inspectionId, finding) => {
    try {
      const inspectionRef = doc(db, 'inspections', inspectionId);
      const newFinding = {
        ...finding,
        id: Date.now().toString(),
        created: new Date().toISOString(),
        photos: []
      };
      
      // Update the inspection document to include the new finding
      await updateDoc(inspectionRef, {
        findings: arrayUnion(newFinding)
      });
      
      // Update local state
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: [...(inspection.findings || []), newFinding] 
              }
            : inspection
        )
      );
      
      return newFinding;
    } catch (error) {
      console.error('Error adding finding:', error);
      throw error;
    }
  };

  const updateFinding = async (inspectionId, findingId, updatedFinding) => {
    try {
      const inspectionRef = doc(db, 'inspections', inspectionId);
      const inspection = getInspection(inspectionId);
      
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      
      const updatedFindings = inspection.findings.map(finding => 
        finding.id === findingId ? { ...finding, ...updatedFinding } : finding
      );
      
      await updateDoc(inspectionRef, {
        findings: updatedFindings
      });
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings
              }
            : inspection
        )
      );
    } catch (error) {
      console.error('Error updating finding:', error);
      throw error;
    }
  };

  const deleteFinding = async (inspectionId, findingId) => {
    try {
      const inspectionRef = doc(db, 'inspections', inspectionId);
      const inspection = getInspection(inspectionId);
      
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      
      const updatedFindings = inspection.findings.filter(finding => finding.id !== findingId);
      
      await updateDoc(inspectionRef, {
        findings: updatedFindings
      });
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings
              }
            : inspection
        )
      );
    } catch (error) {
      console.error('Error deleting finding:', error);
      throw error;
    }
  };

  const addPhotoToFinding = async (inspectionId, findingId, photoData) => {
    try {
      const inspection = getInspection(inspectionId);
      
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      
      // Upload photo to Firebase Storage
      const photoId = Date.now().toString();
      const photoRef = ref(storage, `inspections/${inspectionId}/findings/${findingId}/photos/${photoId}`);
      
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const photoBase64 = photoData.split(',')[1];
      
      // Upload the image
      await uploadString(photoRef, photoBase64, 'base64');
      
      // Get the download URL
      const photoURL = await getDownloadURL(photoRef);
      
      // Create photo object
      const photo = {
        id: photoId,
        data: photoData, // Keep the base64 for local display
        url: photoURL,   // Add the Firebase Storage URL
        timestamp: new Date().toISOString()
      };
      
      // Update the finding with the new photo
      const updatedFindings = inspection.findings.map(finding => 
        finding.id === findingId
          ? { 
              ...finding, 
              photos: [...(finding.photos || []), photo] 
            }
          : finding
      );
      
      // Update the inspection in Firestore
      await updateDoc(doc(db, 'inspections', inspectionId), {
        findings: updatedFindings
      });
      
      // Update local state
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings
              }
            : inspection
        )
      );
    } catch (error) {
      console.error('Error adding photo to finding:', error);
      throw error;
    }
  };

  const calculateScore = (inspectionId) => {
    const inspection = getInspection(inspectionId);
    if (!inspection || !inspection.findings || inspection.findings.length === 0) {
      return 100;
    }

    // NSPIRE scoring is complex, this is a simplified version
    // Level 1: -1 point, Level 2: -3 points, Level 3: -5 points
    const deductions = inspection.findings.reduce((total, finding) => {
      switch (finding.severity) {
        case 1: return total + 1;
        case 2: return total + 3;
        case 3: return total + 5;
        default: return total;
      }
    }, 0);
    
    // Maximum possible score is 100
    const score = Math.max(0, 100 - deductions);
    return score;
  };

  const value = {
    inspections,
    loading,
    nspireCategories,
    createInspection,
    getInspection,
    updateInspection,
    deleteInspection,
    addFinding,
    updateFinding,
    deleteFinding,
    addPhotoToFinding,
    calculateScore
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
};