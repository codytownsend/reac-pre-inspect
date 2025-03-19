// src/pages/inspections/InspectionMain.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { 
  AlertCircle, 
  ArrowLeft,
  Download, 
  Building,
  Home,
  Grid,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight
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
  
  const getSeverityStatusIcon = (status) => {
    if (status === 'critical') return <AlertCircle className="text-red-500" size={18} />;
    if (status === 'serious') return <AlertTriangle className="text-orange-500" size={18} />;
    if (status === 'concerns') return <Clock className="text-yellow-500" size={18} />;
    return <CheckCircle className="text-green-500" size={18} />;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection details...</p>
        </div>
      </div>
    );
  }
  
  if (!inspection || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Inspection Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The inspection you're looking for doesn't exist or has been removed."}
          </p>
          <button 
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium"
            onClick={() => navigate('/inspections')}
          >
            Back to Inspections
          </button>
        </div>
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
  
  // Get area status for each area type
  const unitStatus = getAreaStatusSeverity('unit');
  const insideStatus = getAreaStatusSeverity('inside');
  const outsideStatus = getAreaStatusSeverity('outside');
  
  const handleGenerateReport = () => {
    navigate(`/inspections/${id}/report`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* App Bar */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            onClick={() => navigate('/inspections')}
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Inspection Details</h1>
        </div>
        
        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            onClick={handleGenerateReport}
            aria-label="Generate Report"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
            
      {/* Property Header */}
      <div className="px-4 mt-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div class="flex gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl bg-green-500`}>
              {score}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1 text-gray-900">{property.name}</h2>
              <p className="text-gray-500 text-sm mb-3">{property.address}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200 pt-3">
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-700 text-sm">
                {new Date(inspection.date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center">
              <User size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-700 text-sm">
                {inspection.inspector}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
                {inspection.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inspection Areas */}
      <div className="px-4">
        <h3 className="font-bold mb-3 text-gray-800">Inspection Areas</h3>
        
        {/* Units */}
        <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/units`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3 text-blue-500">
                <Home size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Units</h3>
                <p className="text-sm text-gray-500">
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
        <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/inside`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mr-3 text-purple-500">
                <Building size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Inside Areas</h3>
                <p className="text-sm text-gray-500">
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
        <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
          <button 
            className="w-full p-4 flex items-center justify-between"
            onClick={() => navigate(`/inspections/${id}/outside`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mr-3 text-green-500">
                <Grid size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Outside Areas</h3>
                <p className="text-sm text-gray-500">
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
      
      {/* Report Button */}
      <div className="fixed bottom-16 left-0 right-0 py-4 px-4 bg-white border-t border-gray-200 shadow-md">
        <button 
          className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium flex items-center justify-center shadow-sm hover:bg-gray-700 active:bg-gray-900 transition-colors"
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