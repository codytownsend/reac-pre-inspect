// src/utils/areaUtils.js
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
    addPath: (inspectionId) => `/inspections/${inspectionId}/areas/unit/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/areas/unit/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/areas/unit`,
    quickAddOptions: [
      { type: '101', label: '101' },
      { type: '102', label: '102' },
      { type: '201', label: '201' },
      { type: '202', label: '202' }
    ],
    getItemIcon: () => Home
  },
  inside: {
    title: 'Inside Areas',
    icon: Building,
    color: 'purple',
    addPath: (inspectionId) => `/inspections/${inspectionId}/areas/inside/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/areas/inside/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/areas/inside`,
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
    addPath: (inspectionId) => `/inspections/${inspectionId}/areas/outside/add`,
    detailPath: (inspectionId, areaId) => `/inspections/${inspectionId}/areas/outside/${areaId}`,
    listPath: (inspectionId) => `/inspections/${inspectionId}/areas/outside`,
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
 * @returns {React.Component} - The icon component to display
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
        color: 'bg-red-500',
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
        color: 'bg-orange-500',
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
        color: 'bg-yellow-500',
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
        color: 'bg-blue-500',
        text: 'text-blue-500',
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        timeframe: '60 Days',
        class: 'minor'
      };
    default:
      return {
        icon: Clock,
        name: 'Moderate',
        color: 'bg-yellow-500',
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