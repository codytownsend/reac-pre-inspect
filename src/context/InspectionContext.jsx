// src/context/InspectionContext.jsx - Updated with NSPIRE support
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
import { Finding, Inspection } from '../models/findings'; // Import our new models
import { calculateNspireScore } from '../utils/nspireScoring'; // Import scoring utility

const InspectionContext = createContext();

export const useInspection = () => {
  return useContext(InspectionContext);
};

export const InspectionProvider = ({ children }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // NSPIRE categories and subcategories from the standard
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
    },
    electrical: {
      name: 'Electrical',
      subcategories: [
        'Outlets',
        'Switches',
        'Light Fixtures',
        'Electrical Panels',
        'GFCI Protection',
        'Wiring'
      ]
    },
    fire_life_safety: {
      name: 'Fire & Life Safety',
      subcategories: [
        'Smoke Detectors',
        'Carbon Monoxide Detectors',
        'Fire Extinguishers',
        'Emergency Exits',
        'Fire Escapes',
        'Sprinkler Systems',
        'Fire Walls and Doors'
      ]
    }
  };

  // NSPIRE deficiency severity mappings - simplified example
  const nspireDeficiencies = {
    // Fire and Life Safety
    'smoke_detector_missing': { 
      category: 'fire_life_safety',
      description: 'Smoke detector not installed where required',
      severity: 'lifeThreatening', 
      repairDue: 24,
      hcvRating: 'fail' 
    },
    'co_detector_missing': { 
      category: 'fire_life_safety',
      description: 'Carbon monoxide detector missing',
      severity: 'lifeThreatening', 
      repairDue: 24,
      hcvRating: 'fail' 
    },
    'blocked_egress': { 
      category: 'fire_life_safety',
      description: 'Obstructed means of egress',
      severity: 'lifeThreatening', 
      repairDue: 24,
      hcvRating: 'fail' 
    },
    
    // Mechanical
    'inoperable_hvac_cold': { 
      category: 'buildingSystems',
      description: 'HVAC inoperable during cold weather',
      severity: 'lifeThreatening', 
      repairDue: 24,
      hcvRating: 'fail' 
    },
    'inoperable_hvac_moderate': { 
      category: 'buildingSystems',
      description: 'HVAC inoperable during moderate weather',
      severity: 'moderate', 
      repairDue: 30,
      hcvRating: 'fail' 
    },
    'gas_leak': { 
      category: 'buildingSystems',
      description: 'Gas leak detected',
      severity: 'lifeThreatening', 
      repairDue: 24,
      hcvRating: 'fail' 
    },
    'water_leak': { 
      category: 'buildingSystems',
      description: 'Active water leak',
      severity: 'moderate', 
      repairDue: 30,
      hcvRating: 'fail' 
    },
    
    // Electrical
    'exposed_wiring': {
      category: 'electrical',
      description: 'Exposed electrical wiring',
      severity: 'lifeThreatening',
      repairDue: 24,
      hcvRating: 'fail'
    },
    'missing_outlet_cover': {
      category: 'electrical',
      description: 'Missing electrical outlet cover',
      severity: 'severe',
      repairDue: 24,
      hcvRating: 'fail'
    },
    'missing_gfci': {
      category: 'electrical',
      description: 'Missing GFCI protection near water source',
      severity: 'severe',
      repairDue: 30,
      hcvRating: 'fail'
    },
    
    // Unit Issues
    'broken_window': {
      category: 'unit',
      description: 'Broken window glass',
      severity: 'severe',
      repairDue: 24,
      hcvRating: 'fail'
    },
    'inoperable_toilet': {
      category: 'unit',
      description: 'Inoperable toilet',
      severity: 'severe',
      repairDue: 24,
      hcvRating: 'fail'
    },
    'water_damage': {
      category: 'unit',
      description: 'Water damage on ceiling/walls',
      severity: 'moderate',
      repairDue: 30,
      hcvRating: 'fail'
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

  const createInspection = async (inspectionData) => {
    try {
      // Create a new Inspection object with our model
      const inspection = new Inspection({
        ...inspectionData,
        userId: currentUser.uid,
        findings: [],
        areas: [],
        created: new Date().toISOString(),
        unitSample: determineUnitSample(inspectionData.totalUnits || 0)
      });
      
      const docRef = await addDoc(collection(db, 'inspections'), inspection);
      
      const inspectionWithId = {
        ...inspection,
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
      await updateDoc(doc(db, 'inspections', id), {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === id 
            ? { ...inspection, ...updatedData, updatedAt: new Date().toISOString() } 
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

  const addFinding = async (inspectionId, findingData) => {
    try {
      const inspection = getInspection(inspectionId);
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      
      // Create a Finding object with our model
      const finding = new Finding({
        ...findingData,
        id: Date.now().toString(),
        inspectionId,
        created: new Date().toISOString(),
        photos: []
      });
      
      // Calculate the repair due date based on the inspection type
      const inspectionDate = new Date(inspection.date);
      const program = inspection.type === 'hcv' || inspection.type === 'pbv' ? 'hcv' : 'standard';
      finding.repairDueDate = finding.calculateRepairDueDate(program, inspectionDate);
      
      // Determine HCV pass/fail rating
      finding.hcvRating = finding.isFailForVoucher() ? 'fail' : 'pass';
      
      const inspectionRef = doc(db, 'inspections', inspectionId);
      
      // Update the inspection document to include the new finding
      await updateDoc(inspectionRef, {
        findings: arrayUnion(finding),
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: [...(inspection.findings || []), finding],
                updatedAt: new Date().toISOString()
              }
            : inspection
        )
      );
      
      // Recalculate score
      await updateScoreForInspection(inspectionId);
      
      return finding;
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
        finding.id === findingId ? { ...finding, ...updatedFinding, updatedAt: new Date().toISOString() } : finding
      );
      
      await updateDoc(inspectionRef, {
        findings: updatedFindings,
        updatedAt: new Date().toISOString()
      });
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings,
                updatedAt: new Date().toISOString()
              }
            : inspection
        )
      );
      
      // Recalculate score
      await updateScoreForInspection(inspectionId);
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
        findings: updatedFindings,
        updatedAt: new Date().toISOString()
      });
      
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings,
                updatedAt: new Date().toISOString()
              }
            : inspection
        )
      );
      
      // Recalculate score
      await updateScoreForInspection(inspectionId);
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
      
      // Check if this is an area-based finding
      if (inspection.areas) {
        // Find which area contains this finding
        let areaFound = false;
        const updatedAreas = inspection.areas.map(area => {
          if (!area.findings) return area;
          
          const findingIndex = area.findings.findIndex(f => f.id === findingId);
          if (findingIndex >= 0) {
            areaFound = true;
            const updatedFindings = [...area.findings];
            updatedFindings[findingIndex] = {
              ...updatedFindings[findingIndex],
              photos: [...(updatedFindings[findingIndex].photos || []), photo],
              updatedAt: new Date().toISOString()
            };
            return { ...area, findings: updatedFindings };
          }
          return area;
        });
        
        if (areaFound) {
          // Update the inspection with updated areas
          await updateDoc(doc(db, 'inspections', inspectionId), {
            areas: updatedAreas,
            updatedAt: new Date().toISOString()
          });
          
          // Update local state
          setInspections(prev => 
            prev.map(inspection => 
              inspection.id === inspectionId
                ? { 
                    ...inspection, 
                    areas: updatedAreas,
                    updatedAt: new Date().toISOString()
                  }
                : inspection
            )
          );
          return;
        }
      }
      
      // Traditional finding update (not area-based)
      const updatedFindings = inspection.findings.map(finding => 
        finding.id === findingId
          ? { 
              ...finding, 
              photos: [...(finding.photos || []), photo],
              updatedAt: new Date().toISOString()
            }
          : finding
      );
      
      // Update the inspection in Firestore
      await updateDoc(doc(db, 'inspections', inspectionId), {
        findings: updatedFindings,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                findings: updatedFindings,
                updatedAt: new Date().toISOString()
              }
            : inspection
        )
      );
    } catch (error) {
      console.error('Error adding photo to finding:', error);
      throw error;
    }
  };

  const updateScoreForInspection = async (inspectionId) => {
    try {
      const inspection = getInspection(inspectionId);
      if (!inspection) {
        throw new Error('Inspection not found');
      }
      
      // Create an Inspection object to use our model methods
      const inspectionObj = new Inspection(inspection);
      const scoreDetails = inspectionObj.calculateScore();
      
      // Update the inspection score in Firestore
      await updateDoc(doc(db, 'inspections', inspectionId), {
        score: scoreDetails.score,
        scoreDetails: scoreDetails,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId
            ? { 
                ...inspection, 
                score: scoreDetails.score,
                scoreDetails: scoreDetails,
                updatedAt: new Date().toISOString()
              }
            : inspection
        )
      );
      
      return scoreDetails;
    } catch (error) {
      console.error('Error updating inspection score:', error);
      throw error;
    }
  };

  /**
   * Determine the unit sample size based on NSPIRE standards
   */
  const determineUnitSample = (totalUnits) => {
    // NSPIRE Unit Sampling Logic
    if (totalUnits <= 0) return 0;
    if (totalUnits <= 1) return 1;
    if (totalUnits <= 2) return 2;
    if (totalUnits <= 3) return 3;
    if (totalUnits <= 4) return 4;
    if (totalUnits <= 5) return 5;
    if (totalUnits <= 6) return 6;
    if (totalUnits <= 7) return 6;
    if (totalUnits <= 8) return 7;
    if (totalUnits <= 9) return 8;
    if (totalUnits <= 10) return 8;
    if (totalUnits <= 12) return 9;
    if (totalUnits <= 14) return 10;
    if (totalUnits <= 16) return 11;
    if (totalUnits <= 18) return 12;
    if (totalUnits <= 21) return 13;
    if (totalUnits <= 24) return 14;
    if (totalUnits <= 27) return 15;
    if (totalUnits <= 30) return 16;
    if (totalUnits <= 35) return 17;
    if (totalUnits <= 39) return 18;
    if (totalUnits <= 45) return 19;
    if (totalUnits <= 51) return 20;
    if (totalUnits <= 59) return 21;
    if (totalUnits <= 67) return 22;
    if (totalUnits <= 78) return 23;
    if (totalUnits <= 92) return 24;
    if (totalUnits <= 110) return 25;
    if (totalUnits <= 133) return 26;
    if (totalUnits <= 166) return 27;
    if (totalUnits <= 214) return 28;
    if (totalUnits <= 295) return 29;
    if (totalUnits <= 455) return 30;
    if (totalUnits <= 920) return 31;
    return 32; // 921+ units
  };

  /**
   * Calculate the score for an inspection based on NSPIRE standards
   */
  const calculateScore = (inspectionId) => {
    const inspection = getInspection(inspectionId);
    if (!inspection) return 100;
    
    // Create an Inspection object to use our model methods
    const inspectionObj = new Inspection(inspection);
    return inspectionObj.calculateScore().score;
  };

  const value = {
    inspections,
    loading,
    nspireCategories,
    nspireDeficiencies,
    createInspection,
    getInspection,
    updateInspection,
    deleteInspection,
    addFinding,
    updateFinding,
    deleteFinding,
    addPhotoToFinding,
    calculateScore,
    updateScoreForInspection,
    determineUnitSample
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
};