import React from 'react';
import { 
  Home, 
  Building, 
  Grid, 
  DoorOpen, 
  Wrench, 
  Users, 
  Coffee,
  ParkingSquare, 
  TreePine, 
  Wind,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

/**
 * Configuration for different area types
 */
export const areaConfig = {
  unit: {
    title: 'Units',
    icon: Home,
    color: 'blue',
    addPath: (inspectionId) => `/inspections/${inspectionId}/units/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/units/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/units`,
    quickAddOptions: [
      { type: '101', label: '101', icon: Home },
      { type: '102', label: '102', icon: Home },
      { type: '201', label: '201', icon: Home },
      { type: '202', label: '202', icon: Home }
    ],
    getItemIcon: () => Home
  },
  inside: {
    title: 'Inside Areas',
    icon: Building,
    color: 'purple',
    addPath: (inspectionId) => `/inspections/${inspectionId}/inside/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/inside/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/inside`,
    quickAddOptions: [
      { type: 'hallway', label: 'Hallway', icon: DoorOpen },
      { type: 'laundry', label: 'Laundry', icon: Wrench },
      { type: 'community', label: 'Community', icon: Users },
      { type: 'office', label: 'Office', icon: Coffee }
    ],
    getItemIcon: (type) => {
      switch(type) {
        case 'hallway': return DoorOpen;
        case 'laundry': return Wrench;
        case 'community': return Users;
        case 'office': return Coffee;
        default: return Building;
      }
    }
  },
  outside: {
    title: 'Outside Areas',
    icon: Grid,
    color: 'green',
    addPath: (inspectionId) => `/inspections/${inspectionId}/outside/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/outside/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/outside`,
    quickAddOptions: [
      { type: 'building', label: 'Building', icon: Home },
      { type: 'parking', label: 'Parking', icon: ParkingSquare },
      { type: 'grounds', label: 'Grounds', icon: TreePine },
      { type: 'playground', label: 'Playground', icon: Wind }
    ],
    getItemIcon: (type) => {
      switch(type) {
        case 'building': return Home;
        case 'parking': return ParkingSquare;
        case 'grounds': return TreePine;
        case 'playground': return Wind;
        default: return Grid;
      }
    }
  }
};

/**
 * Gets the area configuration for a specific area type
 * @param {string} areaType - The type of area ('unit', 'inside', or 'outside')
 * @returns {Object} - The area configuration
 */
export const getAreaConfig = (areaType) => {
  return areaConfig[areaType] || areaConfig.unit;
};

/**
 * Gets the severity icon component for an area based on its findings
 * @param {Object} area - The area object with findings
 * @returns {Function} - The icon component to display
 */
export const getSeverityIcon = (area) => {
  if (!area.findings || area.findings.length === 0) {
    return CheckCircle;
  }
  
  // Check for life-threatening findings
  const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
  if (hasLifeThreatening) {
    return AlertCircle;
  }
  
  // Check for severe findings
  const hasSevere = area.findings.some(f => f.severity === 'severe');
  if (hasSevere) {
    return AlertTriangle;
  }
  
  // Check for moderate findings
  const hasModerate = area.findings.some(f => f.severity === 'moderate');
  if (hasModerate) {
    return Clock;
  }
  
  return CheckCircle;
};

/**
 * Gets the severity class name for styling
 * @param {Object} area - The area object with findings
 * @returns {string} - CSS class name for the severity
 */
export const getSeverityClass = (area) => {
  if (!area.findings || area.findings.length === 0) {
    return 'minor';
  }
  
  // Check for life-threatening findings
  const hasLifeThreatening = area.findings.some(f => f.severity === 'lifeThreatening');
  if (hasLifeThreatening) {
    return 'critical';
  }
  
  // Check for severe findings
  const hasSevere = area.findings.some(f => f.severity === 'severe');
  if (hasSevere) {
    return 'serious';
  }
  
  // Check for moderate findings
  const hasModerate = area.findings.some(f => f.severity === 'moderate');
  if (hasModerate) {
    return 'moderate';
  }
  
  return 'minor';
};

/**
 * Gets the severity details for a specific severity level
 * @param {string} severityLevel - The severity level ('lifeThreatening', 'severe', 'moderate', or 'low')
 * @param {string} areaType - The area type for timeframe calculation
 * @returns {Object} - Severity details
 */
export const getSeverityDetails = (severityLevel, areaType = 'unit') => {
  switch (severityLevel) {
    case 'lifeThreatening':
      return {
        icon: AlertCircle,
        name: 'Life Threatening',
        color: 'red',
        text: 'text-red-500',
        border: 'border-red-500',
        bg: 'bg-red-50',
        timeframe: '24 Hours',
        class: 'critical'
      };
    case 'severe':
      return {
        icon: AlertTriangle,
        name: 'Severe',
        color: 'orange',
        text: 'text-orange-500',
        border: 'border-orange-500',
        bg: 'bg-orange-50',
        timeframe: areaType === 'unit' ? '30 Days' : '24 Hours',
        class: 'serious'
      };
    case 'moderate':
      return {
        icon: Clock,
        name: 'Moderate',
        color: 'yellow',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        timeframe: '30 Days',
        class: 'moderate'
      };
    case 'low':
      return {
        icon: CheckCircle,
        name: 'Low',
        color: 'green',
        text: 'text-green-500',
        border: 'border-green-500',
        bg: 'bg-green-50',
        timeframe: '60 Days',
        class: 'minor'
      };
    default:
      return {
        icon: Clock,
        name: 'Moderate',
        color: 'yellow',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        timeframe: '30 Days',
        class: 'moderate'
      };
  }
};

/**
 * Gets pass/fail status for voucher programs based on severity
 * @param {string} severityLevel - The severity level
 * @param {string} areaType - The area type
 * @returns {string|null} - 'Pass', 'Fail', or null if not applicable
 */
export const getPassFailStatus = (severityLevel, areaType) => {
  if (areaType !== 'unit') return null;
  
  switch (severityLevel) {
    case 'lifeThreatening':
    case 'severe':
    case 'moderate':
      return 'Fail';
    case 'low':
      return 'Pass';
    default:
      return 'Fail';
  }
};

/**
 * Creates a new area object
 * @param {string} areaType - The type of area ('unit', 'inside', or 'outside')
 * @param {string} name - The name of the area
 * @param {string} type - The specific type within the area type
 * @returns {Object} - The new area object
 */
export const createArea = (areaType, name, type = '') => {
  return {
    id: `${areaType}-${Date.now()}`,
    name: name.trim(),
    areaType,
    type,
    findings: [],
    createdAt: new Date().toISOString()
  };
};

/**
 * Gets total findings count for a specific area type in an inspection
 * @param {Object} inspection - The inspection object
 * @param {string} areaType - The area type to count
 * @returns {number} - Count of findings
 */
export const getFindingsCount = (inspection, areaType) => {
  if (!inspection || !inspection.areas) return 0;
  
  return inspection.areas
    .filter(area => area.areaType === areaType)
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0);
};

/**
 * Gets count of areas of a specific type in an inspection
 * @param {Object} inspection - The inspection object
 * @param {string} areaType - The area type to count
 * @returns {number} - Count of areas
 */
export const getAreaCount = (inspection, areaType) => {
  if (!inspection || !inspection.areas) return 0;
  
  return inspection.areas.filter(area => area.areaType === areaType).length;
};

/**
 * Converts an area type to a consistent URL path
 * @param {string} areaType - The area type ('unit', 'inside', or 'outside')
 * @returns {string} - The URL path segment to use
 */
export const getAreaUrlPath = (areaType) => {
  if (areaType === 'unit') return 'units';
  return areaType; // 'inside' and 'outside' remain the same
};

/**
 * Gets the area type from a URL path segment
 * @param {string} urlPath - The URL path segment ('units', 'inside', or 'outside')
 * @returns {string} - The area type to use in data
 */
export const getAreaTypeFromUrlPath = (urlPath) => {
  if (urlPath === 'units') return 'unit';
  return urlPath; // 'inside' and 'outside' remain the same
};