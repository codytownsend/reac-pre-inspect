// src/pages/shared/SharedReport.jsx - Updated for desktop view
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronDown, X, Printer, Download, Mail, Building, Home, Grid, AlertCircle } from 'lucide-react';

const SharedReport = () => {
  const { id } = useParams();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading inspection data for ID:", id);
        
        // Get inspection directly from Firestore
        const inspectionDoc = await getDoc(doc(db, 'inspections', id));
        
        if (!inspectionDoc.exists()) {
          console.error("Inspection document doesn't exist");
          setError('Inspection not found');
          setLoading(false);
          return;
        }
        
        const inspectionData = inspectionDoc.data();
        inspectionData.id = inspectionDoc.id;
        console.log("Loaded inspection data:", inspectionData);
        setInspection(inspectionData);
        
        // Get property details directly from Firestore
        if (!inspectionData.propertyId) {
          console.error("No propertyId in inspection data");
          setError('Property reference not found');
          setLoading(false);
          return;
        }
        
        const propertyDoc = await getDoc(doc(db, 'properties', inspectionData.propertyId));
        
        if (!propertyDoc.exists()) {
          console.error("Property document doesn't exist");
          setError('Property details not found');
          setLoading(false);
          return;
        }
        
        const propertyData = propertyDoc.data();
        propertyData.id = propertyDoc.id;
        console.log("Loaded property data:", propertyData);
        setProperty(propertyData);
        
        // Initialize expanded state for areas or categories
        const expandedState = {};
        if (inspectionData.areas && inspectionData.areas.length > 0) {
          // New structure - areas
          inspectionData.areas.forEach(area => {
            expandedState[area.id] = true; // Default to expanded
          });
        } else if (inspectionData.findings && inspectionData.findings.length > 0) {
          // Old structure - categories
          const categoryOrder = ['site', 'buildingExterior', 'buildingSystems', 'commonAreas', 'unit'];
          categoryOrder.forEach(category => {
            expandedState[category] = true; // Default to expanded
          });
        }
        setExpandedSections(expandedState);
      } catch (error) {
        console.error('Error loading shared report:', error);
        setError('Error generating report: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Toggle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Open image modal
  const openImageModal = (imageUrl, finding) => {
    setActiveImage({
      url: imageUrl,
      finding: finding
    });
    setShowImageModal(true);
  };
  
  // Handle print action
  const handlePrint = () => {
    window.print();
  };
  
  // Calculate NSPIRE score - Improved to correctly calculate based on findings
  const calculateScore = (inspection) => {
    let totalDeductions = 0;
    let totalFindings = 0;
    
    // Function to get deduction points by severity
    const getDeductionPoints = (severity) => {
      switch (severity) {
        case 'lifeThreatening': return 10;
        case 'severe': return 5;
        case 'moderate': return 3;
        case 'low': return 1;
        default: return 1;
      }
    };
    
    // Process all findings across all areas
    if (inspection.areas && inspection.areas.length > 0) {
      inspection.areas.forEach(area => {
        if (area.findings && area.findings.length > 0) {
          area.findings.forEach(finding => {
            totalFindings++;
            totalDeductions += getDeductionPoints(finding.severity);
          });
        }
      });
    } else if (inspection.findings && inspection.findings.length > 0) {
      // Backwards compatibility for old structure
      inspection.findings.forEach(finding => {
        totalFindings++;
        totalDeductions += getDeductionPoints(finding.severity);
      });
    }
    
    // If no findings, score is 100
    if (totalFindings === 0) {
      return 100;
    }
    
    // Calculate score - cap deductions at 75 to ensure minimum score of 25
    const cappedDeductions = Math.min(totalDeductions, 75);
    return Math.max(25, 100 - cappedDeductions);
  };
  
  // Get severity details
  const getSeverityDetails = (severity) => {
    switch (severity) {
      case 'lifeThreatening':
        return {
          label: "Life Threatening",
          color: "#f8d7da",
          textColor: "#721c24"
        };
      case 'severe':
        return {
          label: "Severe",
          color: "#fff3cd",
          textColor: "#856404"
        };
      case 'moderate':
        return {
          label: "Moderate",
          color: "#cce5ff",
          textColor: "#004085"
        };
      case 'low':
        return {
          label: "Low",
          color: "#d4edda",
          textColor: "#155724"
        };
      default:
        return {
          label: "Unknown",
          color: "#e9ecef",
          textColor: "#495057"
        };
    }
  };
  
  // Get area icon based on type
  const getAreaIcon = (areaType) => {
    switch (areaType) {
      case 'unit':
        return <Home size={20} />;
      case 'inside':
        return <Building size={20} />;
      case 'outside':
        return <Grid size={20} />;
      default:
        return null;
    }
  };
  
  // Generate summary data
  const generateSummary = (inspection) => {
    const summary = {
      totalFindings: 0,
      byCategory: {},
      bySeverity: {
        lifeThreatening: 0,
        severe: 0,
        moderate: 0,
        low: 0
      }
    };
    
    // Helper function to process a finding
    const processFinding = (finding) => {
      // Count by category
      if (!summary.byCategory[finding.category]) {
        summary.byCategory[finding.category] = 0;
      }
      summary.byCategory[finding.category]++;
      
      // Count by severity
      if (finding.severity) {
        summary.bySeverity[finding.severity] = 
          (summary.bySeverity[finding.severity] || 0) + 1;
      }
      
      summary.totalFindings++;
    };
    
    // If using new structure (areas)
    if (inspection.areas && inspection.areas.length > 0) {
      // Process all findings across all areas
      inspection.areas.forEach(area => {
        if (area.findings && area.findings.length > 0) {
          area.findings.forEach(processFinding);
        }
      });
    } 
    // Using old structure (findings directly on inspection)
    else if (inspection.findings && inspection.findings.length > 0) {
      inspection.findings.forEach(processFinding);
    }
    
    return summary;
  };
  
  if (loading) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh'
        }}>
          <div>Loading report...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '16px', 
          borderRadius: '4px', 
          marginBottom: '24px'
        }}>
          {error}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p>This report is not available or may have expired.</p>
        </div>
      </div>
    );
  }
  
  if (!inspection || !property) {
    return (
      <div className="container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '16px', 
          borderRadius: '4px', 
          marginBottom: '24px'
        }}>
          Could not generate report. Missing data.
        </div>
      </div>
    );
  }
  
  // Calculate the score
  const score = calculateScore(inspection);
  
  // Generate summary
  const summary = generateSummary(inspection);
  
  // Define category names for display
  const categoryNames = {
    site: 'Site',
    buildingExterior: 'Building Exterior',
    buildingSystems: 'Building Systems',
    commonAreas: 'Common Areas',
    unit: 'Unit'
  };
  
  // For old structure: group findings by category
  let findingsByCategory = {};
  if (!inspection.areas && inspection.findings) {
    // Old structure - organize by category
    const categoryOrder = ['site', 'buildingExterior', 'buildingSystems', 'commonAreas', 'unit'];
    categoryOrder.forEach(category => {
      findingsByCategory[category] = (inspection.findings || [])
        .filter(finding => finding.category === category)
        .sort((a, b) => b.severity - a.severity);
    });
  }
  
  return (
    <div className="report-container w-full">
      {/* Report header for shared view */}
      <div className="report-header bg-white shadow-sm mb-4">
        <div className="max-w-[2000px] mx-auto w-full px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold m-0">
            Property Inspection Report
          </h1>
          
          <div className="report-actions flex gap-2">
            <button 
              className="btn btn-secondary py-2 px-4 bg-gray-100 rounded flex items-center hover:bg-gray-200"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="max-w-[2000px] mx-auto w-full px-4 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Report Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">Property Inspection Report: {property.name}</h1>
            <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Property & Inspection Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 border-b pb-2">Property Details</h2>
              <p className="text-lg"><strong>Name:</strong> {property.name}</p>
              <p className="text-lg"><strong>Address:</strong> {property.address}</p>
              <p className="text-lg"><strong>Units:</strong> {property.units}</p>
              <p className="text-lg"><strong>Buildings:</strong> {property.buildingCount}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3 border-b pb-2">Inspection Details</h2>
              <p className="text-lg"><strong>Date:</strong> {new Date(inspection.date).toLocaleDateString()}</p>
              <p className="text-lg"><strong>Inspector:</strong> {inspection.inspector}</p>
              <p className="text-lg"><strong>Status:</strong> {inspection.status}</p>
              <div className="flex items-center mt-2">
                <span className="mr-2 text-lg"><strong>Score:</strong></span>
                <span className={`px-3 py-1 rounded-full font-semibold text-lg ${
                  score >= 90 ? 'bg-green-100 text-green-800' : 
                  score >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                  score >= 60 ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {score}
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Summary</h2>
            
            {/* First row: overall stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold mb-2">{summary.totalFindings}</div>
                <div className="text-lg text-gray-700">Total Findings</div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold mb-2">{score}</div>
                <div className="text-lg text-gray-700">Inspection Score</div>
              </div>
            </div>
            
            {/* Findings by Category */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Findings by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(summary.byCategory).map(([category, count]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-sm">{categoryNames[category] || category}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Findings by Severity */}
            <div>
              <h3 className="text-lg font-medium mb-3">Findings by Severity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.bySeverity).map(([severity, count]) => {
                  const details = getSeverityDetails(severity);
                  return (
                    <div 
                      key={severity} 
                      className="p-6 rounded-lg text-center shadow-sm"
                      style={{ backgroundColor: details.color, color: details.textColor }}
                    >
                      <div className="text-2xl font-bold mb-1">{count}</div>
                      <div className="text-base">{details.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Findings by Area */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detailed Findings</h2>
          
          {inspection.areas && inspection.areas.length > 0 ? (
            <div className="space-y-4">
              {inspection.areas.map(area => {
                const hasFindings = area.findings && area.findings.length > 0;
                if (!hasFindings) return null; // Skip areas with no findings
                
                return (
                  <div key={area.id} className="border rounded-lg overflow-hidden">
                    {/* Area Header */}
                    <div 
                      className={`p-4 flex items-center justify-between cursor-pointer
                        ${area.areaType === 'unit' ? 'bg-blue-50' : 
                          area.areaType === 'inside' ? 'bg-purple-50' : 'bg-green-50'}`}
                      onClick={() => toggleSection(area.id)}
                    >
                      <div className="flex items-center">
                        <div className={`mr-3 ${
                          area.areaType === 'unit' ? 'text-blue-600' : 
                          area.areaType === 'inside' ? 'text-purple-600' : 'text-green-600'
                        }`}>
                          {getAreaIcon(area.areaType)}
                        </div>
                        <h3 className="font-medium text-lg">
                          {area.name}
                          <span className="ml-2 text-sm text-gray-500">
                            ({hasFindings ? area.findings.length : 0} finding{hasFindings && area.findings.length !== 1 ? 's' : ''})
                          </span>
                        </h3>
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={`transform transition-transform ${expandedSections[area.id] ? 'rotate-180' : ''}`} 
                      />
                    </div>
                    
                    {/* Area Findings */}
                    {expandedSections[area.id] && (
                      <div className="p-4 border-t">
                        <div className="space-y-4">
                          {area.findings.map(finding => {
                            const severityDetails = getSeverityDetails(finding.severity);
                            return (
                              <div 
                                key={finding.id} 
                                className="border rounded-lg overflow-hidden shadow-sm"
                                style={{ borderLeftColor: severityDetails.color, borderLeftWidth: '8px' }}
                              >
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-lg">{finding.subcategory}</h4>
                                    <span 
                                      className="text-sm px-3 py-1 rounded"
                                      style={{ backgroundColor: severityDetails.color, color: severityDetails.textColor }}
                                    >
                                      {severityDetails.label}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <strong className="text-sm">Deficiency:</strong>
                                    <p className="finding-deficiency text-base">{finding.deficiency}</p>
                                  </div>
                                  
                                  {finding.notes && (
                                    <div className="mb-3">
                                      <strong className="text-sm">Notes:</strong>
                                      <p className="text-sm text-gray-700">{finding.notes}</p>
                                    </div>
                                  )}
                                  
                                  {finding.photos && finding.photos.length > 0 && (
                                    <div>
                                      <strong className="text-sm block mb-2">Photos ({finding.photos.length}):</strong>
                                      <div className="flex flex-wrap gap-2">
                                        {finding.photos.map((photo, index) => (
                                          <div 
                                            key={index} 
                                            className="w-20 h-20 rounded overflow-hidden border cursor-pointer"
                                            onClick={() => openImageModal(photo.data || photo.url, finding)}
                                          >
                                            <img 
                                              src={photo.data || photo.url} 
                                              alt={`Finding ${index + 1}`} 
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 text-center rounded-lg">
              <p className="text-gray-500">No areas have been added to this inspection.</p>
            </div>
          )}
        </div>
        
        {/* Report Footer */}
        <div className="text-center text-gray-500 text-sm mb-8">
          <p>Report generated on {new Date().toLocaleString()}</p>
          <p>© {new Date().getFullYear()} Property Inspection App</p>
        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && activeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="relative bg-white p-2 rounded-t-lg">
              <button 
                className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full"
                onClick={() => setShowImageModal(false)}
              >
                <X size={20} />
              </button>
              <img 
                src={activeImage.url} 
                alt="Finding" 
                className="max-h-[70vh] max-w-[90vw] object-contain rounded"
              />
            </div>
            <div className="bg-white p-4 rounded-b-lg">
              <h3 className="font-medium mb-1">{activeImage.finding.subcategory}</h3>
              <p className="text-sm text-gray-700">{activeImage.finding.deficiency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedReport;