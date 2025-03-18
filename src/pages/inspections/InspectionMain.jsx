// src/pages/inspections/InspectionMain.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { 
  Home, 
  Building, 
  Grid, 
  Download, 
  Share2, 
  ArrowLeft,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

const InspectionMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = getInspection(id);
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
        const calculatedScore = calculateScore(id);
        setScore(calculatedScore);
      } catch (error) {
        console.error("Error loading inspection:", error);
        setError('Error loading inspection details');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, calculateScore, navigate]);
  
  const getInspectionCycle = (score) => {
    if (score >= 90) return '3 Years';
    if (score >= 80) return '2 Years';
    if (score >= 60) return '1 Year';
    return 'Failing';
  };
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };
  
  const getSeverityStatusIcon = (status) => {
    if (status === 'critical') return <AlertCircle size={18} className="severity-icon--critical" />;
    if (status === 'serious') return <AlertTriangle size={18} className="severity-icon--serious" />;
    if (status === 'concerns') return <Clock size={18} className="severity-icon--moderate" />;
    return <CheckCircle size={18} className="severity-icon--minor" />;
  };
  
  const getAreaStatusSeverity = (areaType) => {
    // Get all findings from specific area type
    const areasOfType = inspection?.areas?.filter(area => area.areaType === areaType) || [];
    
    // Check if there are any life-threatening findings
    const hasLifeThreatening = areasOfType.some(area => 
      area.findings?.some(finding => finding.severity === 'lifeThreatening')
    );
    if (hasLifeThreatening) return 'critical';
    
    // Check if there are any severe findings
    const hasSevere = areasOfType.some(area => 
      area.findings?.some(finding => finding.severity === 'severe')
    );
    if (hasSevere) return 'serious';
    
    // Check if there are any moderate findings
    const hasModerate = areasOfType.some(area => 
      area.findings?.some(finding => finding.severity === 'moderate')
    );
    if (hasModerate) return 'concerns';
    
    // Check if there are any findings at all
    const hasAnyFindings = areasOfType.some(area => area.findings?.length > 0);
    if (hasAnyFindings) return 'normal';
    
    // No findings or no areas
    return 'none';
  };
  
  if (loading) {
    return (
      <div className="modern-loading-screen">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Loading inspection details...</p>
      </div>
    );
  }
  
  if (!inspection || !property) {
    return (
      <div className="modern-empty-state">
        <div className="modern-empty-state__icon">
          <AlertCircle size={32} />
        </div>
        <h2 className="modern-empty-state__title">Inspection Not Found</h2>
        <p className="modern-empty-state__description">
          {error || "The inspection you're looking for doesn't exist or has been removed."}
        </p>
        <button 
          className="modern-btn modern-btn--primary"
          onClick={() => navigate('/inspections')}
        >
          Back to Inspections
        </button>
      </div>
    );
  }
  
  // Get counts for each area
  const unitCount = inspection.areas?.filter(area => area.areaType === 'unit').length || 0;
  const insideLocations = inspection.areas?.filter(area => area.areaType === 'inside').length || 0;
  const outsideLocations = inspection.areas?.filter(area => area.areaType === 'outside').length || 0;
  
  // Get finding counts for each area
  const unitFindings = inspection.areas?.filter(area => area.areaType === 'unit')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const insideFindings = inspection.areas?.filter(area => area.areaType === 'inside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  const outsideFindings = inspection.areas?.filter(area => area.areaType === 'outside')
    .reduce((sum, area) => sum + (area.findings?.length || 0), 0) || 0;
  
  // Get area status
  const unitStatus = getAreaStatusSeverity('unit');
  const insideStatus = getAreaStatusSeverity('inside');
  const outsideStatus = getAreaStatusSeverity('outside');
  
  // Get score color class
  const getScoreColorClass = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* App Bar */}
      <div className="app-bar">
        <div className="flex items-center">
          <button
            className="app-bar__back-button"
            onClick={() => navigate('/inspections')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="app-bar__title">Inspection Details</h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-2">
            <button
              className="app-bar__action-button"
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              <Share2 size={20} />
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden w-48 z-20">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setShowShareOptions(false);
                    handleGenerateReport();
                  }}
                >
                  <Download size={16} className="mr-2" />
                  Generate Report
                </button>
              </div>
            )}
          </div>
          
          <button
            className="app-bar__action-button"
            onClick={handleGenerateReport}
          >
            <Download size={20} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Property Header */}
      <div className="p-4">
        <div className="modern-card">
          <div className="modern-card__content">
            <h2 className="text-lg font-bold mb-1">{property.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{property.address}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">
                  {new Date(inspection.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center">
                <User size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">
                  {inspection.inspector}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={`modern-status-badge ${
                  inspection.status === 'Completed' ? 'modern-status-badge--green' : 
                  inspection.status === 'In Progress' ? 'modern-status-badge--yellow' : 'modern-status-badge--blue'
                }`}>
                  {inspection.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inspection Score */}
      <div className="px-4 mb-3">
        <div className="modern-card">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-bold">NSPIRE Score</h3>
          </div>
          
          <div className="p-4 flex items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getScoreColorClass()}`}>
              {score}
            </div>
            
            <div className="ml-4">
              <p className="font-medium">{getInspectionCycle(score)} Inspection Cycle</p>
              <p className="text-sm text-gray-600">
                Based on {unitFindings + insideFindings + outsideFindings} findings
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inspection Areas */}
      <div className="px-4">
        <h3 className="font-bold mb-3">Inspection Areas</h3>
        
        {/* Units */}
        <div className="modern-card mb-3">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/areas/units`)}
          >
            <div className="flex items-center">
              <div className="modern-list-item__icon modern-list-item__icon--blue">
                <Home size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Units</h3>
                <p className="text-sm text-gray-600">
                  {unitCount} units, {unitFindings} findings
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {unitStatus !== 'none' && getSeverityStatusIcon(unitStatus)}
              <ChevronRight size={20} className="text-gray-400 ml-1" />
            </div>
          </button>
        </div>
        
        {/* Inside Areas */}
        <div className="modern-card mb-3">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/areas/inside`)}
          >
            <div className="flex items-center">
              <div className="modern-list-item__icon modern-list-item__icon--purple">
                <Building size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Inside Areas</h3>
                <p className="text-sm text-gray-600">
                  {insideLocations} locations, {insideFindings} findings
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {insideStatus !== 'none' && getSeverityStatusIcon(insideStatus)}
              <ChevronRight size={20} className="text-gray-400 ml-1" />
            </div>
          </button>
        </div>
        
        {/* Outside Areas */}
        <div className="modern-card mb-3">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/areas/outside`)}
          >
            <div className="flex items-center">
              <div className="modern-list-item__icon modern-list-item__icon--green">
                <Grid size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Outside Areas</h3>
                <p className="text-sm text-gray-600">
                  {outsideLocations} locations, {outsideFindings} findings
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {outsideStatus !== 'none' && getSeverityStatusIcon(outsideStatus)}
              <ChevronRight size={20} className="text-gray-400 ml-1" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="modern-bottom-bar">
        <button 
          className="modern-btn modern-btn--primary modern-btn--block"
          onClick={handleGenerateReport}
        >
          <Download size={20} className="mr-2" />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default InspectionMain;