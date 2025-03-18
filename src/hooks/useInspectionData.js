// src/hooks/useInspectionData.js
import { useState, useEffect } from 'react';
import { useInspection } from '../context/InspectionContext';
import { useProperty } from '../context/PropertyContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing inspection data
 * @param {string} inspectionId - The ID of the inspection
 * @returns {Object} - Inspection data and functions
 */
export const useInspectionData = (inspectionId) => {
  const navigate = useNavigate();
  const { getInspection, updateInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(null);
  
  // Load inspection and property data
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(inspectionId);
        if (!inspectionData) {
          navigate('/inspections');
          return;
        }
        
        setInspection(inspectionData);
        
        const propertyData = getProperty(inspectionData.propertyId);
        if (propertyData) {
          setProperty(propertyData);
        }
        
        // Calculate score
        const calculatedScore = calculateScore(inspectionId);
        setScore(calculatedScore);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [inspectionId, getInspection, getProperty, calculateScore, navigate]);
  
  /**
   * Get areas of a specific type
   * @param {string} areaType - The type of area to filter
   * @returns {Array} - The filtered areas
   */
  const getAreasByType = (areaType) => {
    if (!inspection || !inspection.areas) return [];
    return inspection.areas.filter(area => area.areaType === areaType);
  };
  
  /**
   * Add a new area to the inspection
   * @param {Object} newArea - The new area to add
   * @returns {Promise} - Promise that resolves when the area is added
   */
  const addArea = async (newArea) => {
    try {
      // Update the inspection with the new area
      const updatedAreas = [...(inspection.areas || []), newArea];
      await updateInspection(inspectionId, { areas: updatedAreas });
      
      // Update local state
      setInspection(prev => ({
        ...prev,
        areas: updatedAreas
      }));
      
      return { success: true, area: newArea };
    } catch (error) {
      console.error("Error adding area:", error);
      setError('Error adding area');
      return { success: false, error };
    }
  };
  
  /**
   * Add a finding to an area
   * @param {string} areaId - The ID of the area
   * @param {Object} newFinding - The new finding to add
   * @returns {Promise} - Promise that resolves when the finding is added
   */
  const addFinding = async (areaId, newFinding) => {
    try {
      // Find the area
      const areaIndex = inspection.areas.findIndex(a => a.id === areaId);
      if (areaIndex === -1) {
        throw new Error('Area not found');
      }
      
      // Update the area's findings
      const updatedAreas = [...inspection.areas];
      const updatedFindings = [
        ...(updatedAreas[areaIndex].findings || []),
        {
          ...newFinding,
          id: `finding-${Date.now()}`,
          created: new Date().toISOString()
        }
      ];
      
      updatedAreas[areaIndex] = {
        ...updatedAreas[areaIndex],
        findings: updatedFindings
      };
      
      // Update the inspection
      await updateInspection(inspectionId, { areas: updatedAreas });
      
      // Update local state
      setInspection(prev => ({
        ...prev,
        areas: updatedAreas
      }));
      
      // Recalculate score
      const calculatedScore = calculateScore(inspectionId);
      setScore(calculatedScore);
      
      return { success: true, finding: newFinding };
    } catch (error) {
      console.error("Error adding finding:", error);
      setError('Error adding finding');
      return { success: false, error };
    }
  };
  
  /**
   * Update a finding in an area
   * @param {string} areaId - The ID of the area
   * @param {string} findingId - The ID of the finding
   * @param {Object} updatedFinding - The updated finding data
   * @returns {Promise} - Promise that resolves when the finding is updated
   */
  const updateFinding = async (areaId, findingId, updatedFinding) => {
    try {
      // Find the area
      const areaIndex = inspection.areas.findIndex(a => a.id === areaId);
      if (areaIndex === -1) {
        throw new Error('Area not found');
      }
      
      // Find the finding
      const findingIndex = inspection.areas[areaIndex].findings.findIndex(f => f.id === findingId);
      if (findingIndex === -1) {
        throw new Error('Finding not found');
      }
      
      // Update the finding
      const updatedAreas = [...inspection.areas];
      updatedAreas[areaIndex].findings[findingIndex] = {
        ...updatedAreas[areaIndex].findings[findingIndex],
        ...updatedFinding,
        updatedAt: new Date().toISOString()
      };
      
      // Update the inspection
      await updateInspection(inspectionId, { areas: updatedAreas });
      
      // Update local state
      setInspection(prev => ({
        ...prev,
        areas: updatedAreas
      }));
      
      // Recalculate score
      const calculatedScore = calculateScore(inspectionId);
      setScore(calculatedScore);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating finding:", error);
      setError('Error updating finding');
      return { success: false, error };
    }
  };
  
  /**
   * Delete a finding from an area
   * @param {string} areaId - The ID of the area
   * @param {string} findingId - The ID of the finding
   * @returns {Promise} - Promise that resolves when the finding is deleted
   */
  const deleteFinding = async (areaId, findingId) => {
    try {
      // Find the area
      const areaIndex = inspection.areas.findIndex(a => a.id === areaId);
      if (areaIndex === -1) {
        throw new Error('Area not found');
      }
      
      // Update the area's findings
      const updatedAreas = [...inspection.areas];
      const updatedFindings = updatedAreas[areaIndex].findings.filter(f => f.id !== findingId);
      
      updatedAreas[areaIndex] = {
        ...updatedAreas[areaIndex],
        findings: updatedFindings
      };
      
      // Update the inspection
      await updateInspection(inspectionId, { areas: updatedAreas });
      
      // Update local state
      setInspection(prev => ({
        ...prev,
        areas: updatedAreas
      }));
      
      // Recalculate score
      const calculatedScore = calculateScore(inspectionId);
      setScore(calculatedScore);
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting finding:", error);
      setError('Error deleting finding');
      return { success: false, error };
    }
  };
  
  /**
   * Delete an area
   * @param {string} areaId - The ID of the area to delete
   * @returns {Promise} - Promise that resolves when the area is deleted
   */
  const deleteArea = async (areaId) => {
    try {
      // Update the inspection's areas
      const updatedAreas = inspection.areas.filter(a => a.id !== areaId);
      
      // Update the inspection
      await updateInspection(inspectionId, { areas: updatedAreas });
      
      // Update local state
      setInspection(prev => ({
        ...prev,
        areas: updatedAreas
      }));
      
      // Recalculate score
      const calculatedScore = calculateScore(inspectionId);
      setScore(calculatedScore);
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting area:", error);
      setError('Error deleting area');
      return { success: false, error };
    }
  };
  
  /**
   * Get inspection cycle based on score
   * @returns {string} - The inspection cycle
   */
  const getInspectionCycle = () => {
    if (score >= 90) return '3 Years';
    if (score >= 80) return '2 Years';
    if (score >= 60) return '1 Year';
    return 'Failing';
  };
  
  return {
    inspection,
    property,
    loading,
    error,
    setError,
    score,
    getAreasByType,
    addArea,
    addFinding,
    updateFinding,
    deleteFinding,
    deleteArea,
    getInspectionCycle
  };
};