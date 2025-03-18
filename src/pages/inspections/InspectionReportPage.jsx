// src/pages/inspections/InspectionReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { 
  Download,
  Printer,
  ChevronDown,
  X,
  ArrowLeft,
  Share2,
  Mail,
  Link as LinkIcon,
  Check,
  Building,
  Home,
  Grid
} from 'lucide-react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const InspectionReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection, calculateScore } = useInspection();
  const { getProperty } = useProperty();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get inspection details
        const inspection = getInspection(id);
        if (!inspection) {
          navigate('/inspections');
          return;
        }
        
        // Get property details
        const property = getProperty(inspection.propertyId);
        if (!property) {
          setError('Property not found for this inspection');
          setLoading(false);
          return;
        }
        
        // Generate report data
        const generatedReport = generateReport(inspection, property);
        setReport(generatedReport);
        
        // Initialize expanded sections
        const expandedState = {};
        if (generatedReport.areas) {
          generatedReport.areas.forEach(area => {
            expandedState[area.id] = true; // Default to expanded
          });
        }
        setExpandedSections(expandedState);
      } catch (error) {
        console.error('Error generating report:', error);
        setError('Error generating report: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, navigate]);

  const generateReport = (inspection, property) => {
    // Calculate score if needed
    const score = calculateScore(id);
    
    // Generate report object
    const report = {
      title: `Inspection Report: ${property.name}`,
      date: new Date().toISOString(),
      property: property,
      inspection: {
        ...inspection,
        score: score
      },
      areas: [],
      summary: {
        totalFindings: 0,
        byAreaType: {
          unit: 0,
          inside: 0,
          outside: 0
        },
        bySeverity: {
          lifeThreatening: 0,
          severe: 0,
          moderate: 0,
          low: 0
        }
      }
    };
    
    // Process areas and findings
    if (inspection.areas && inspection.areas.length > 0) {
      // Group areas by type for the report
      const unitAreas = inspection.areas.filter(area => area.areaType === 'unit');
      const insideAreas = inspection.areas.filter(area => area.areaType === 'inside');
      const outsideAreas = inspection.areas.filter(area => area.areaType === 'outside');
      
      report.areas = [...unitAreas, ...insideAreas, ...outsideAreas];
      
      // Calculate summary statistics
      report.areas.forEach(area => {
        if (area.findings && area.findings.length > 0) {
          // Count total findings
          report.summary.totalFindings += area.findings.length;
          
          // Count by area type
          report.summary.byAreaType[area.areaType] += area.findings.length;
          
          // Count by severity
          area.findings.forEach(finding => {
            if (finding.severity) {
              report.summary.bySeverity[finding.severity] = 
                (report.summary.bySeverity[finding.severity] || 0) + 1;
            }
          });
        }
      });
    }
    
    return report;
  };
  
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
  
  // Handle share report
  const handleShareReport = async () => {
    try {
      // Mark the inspection as shared in Firestore
      await updateDoc(doc(db, 'inspections', id), {
        isShared: true,
        sharedIds: arrayUnion(id),
        sharedAt: serverTimestamp()
      });
      
      // Generate the shareable link
      const shareableLink = `${window.location.origin}/shared/reports/${id}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          setShareSuccess('Link copied to clipboard! Anyone with this link can view the report.');
          setTimeout(() => setShareSuccess(''), 5000);
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          setError('Failed to copy link: ' + err.message);
          setTimeout(() => setError(''), 5000);
        });
        
      // Hide the share options dropdown
      setShowShareOptions(false);
    } catch (err) {
      console.error('Error sharing report:', err);
      setError('Error sharing report: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  // Handle email action
  const handleEmailReport = () => {
    const recipientEmail = prompt("Enter recipient's email address:");
    if (recipientEmail && recipientEmail.includes('@')) {
      // First mark as shared
      updateDoc(doc(db, 'inspections', id), {
        isShared: true,
        sharedIds: arrayUnion(id),
        sharedAt: serverTimestamp()
      }).then(() => {
        setShareSuccess(`Report will be emailed to ${recipientEmail}`);
        setTimeout(() => setShareSuccess(''), 5000);
      }).catch(err => {
        setError('Error preparing report for sharing: ' + err.message);
        setTimeout(() => setError(''), 5000);
      });
      
      setShowShareOptions(false);
    } else if (recipientEmail) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 5000);
    }
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container p-4">
        <div className="page-header flex items-center mb-4">
          <button 
            className="btn-icon mr-2"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Report Error</h1>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() => navigate(`/inspections/${id}`)}
        >
          Back to Inspection
        </button>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="container p-4">
        <div className="page-header flex items-center mb-4">
          <button 
            className="btn-icon mr-2"
            onClick={() => navigate(`/inspections/${id}`)}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Report Not Available</h1>
        </div>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
          Could not generate report. Please try again.
        </div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() => navigate(`/inspections/${id}`)}
        >
          Back to Inspection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Report Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 flex justify-between items-center">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => navigate(`/inspections/${id}`)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 bg-gray-100 rounded-lg flex items-center text-sm font-medium" 
            onClick={handlePrint}
          >
            <Printer size={16} className="mr-1" /> Print
          </button>
          
          <div className="relative">
            <button 
              className="p-2 bg-gray-100 rounded-lg flex items-center text-sm font-medium"
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              <Share2 size={16} className="mr-1" /> Share
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-48 overflow-hidden z-20">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center"
                  onClick={handleShareReport}
                >
                  <LinkIcon size={16} className="mr-2" />
                  Copy shareable link
                </button>
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center"
                  onClick={handleEmailReport}
                >
                  <Mail size={16} className="mr-2" />
                  Email as PDF
                </button>
              </div>
            )}
          </div>
          
          <button 
            className="p-2 bg-blue-500 text-white rounded-lg flex items-center text-sm font-medium"
            onClick={() => {
              // Handle PDF download (implementation would go here)
              alert('Download PDF functionality would go here');
            }}
          >
            <Download size={16} className="mr-1" /> Download
          </button>
        </div>
      </div>
      
      {/* Success Message Toast */}
      {shareSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
          <Check size={16} className="mr-2" />
          {shareSuccess}
        </div>
      )}
      
      {/* Report Content */}
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Report Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
            <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          {/* Property & Inspection Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Property Details</h2>
              <p><strong>Name:</strong> {report.property.name}</p>
              <p><strong>Address:</strong> {report.property.address}</p>
              <p><strong>Units:</strong> {report.property.units}</p>
              <p><strong>Buildings:</strong> {report.property.buildingCount}</p>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Inspection Details</h2>
              <p><strong>Date:</strong> {new Date(report.inspection.date).toLocaleDateString()}</p>
              <p><strong>Inspector:</strong> {report.inspection.inspector}</p>
              <p><strong>Status:</strong> {report.inspection.status}</p>
              <div className="flex items-center mt-2">
                <span className="mr-2"><strong>Score:</strong></span>
                <span className={`px-2 py-1 rounded-full font-semibold ${
                  report.inspection.score >= 90 ? 'bg-green-100 text-green-800' : 
                  report.inspection.score >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                  report.inspection.score >= 60 ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {report.inspection.score}
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{report.summary.totalFindings}</div>
                <div className="text-sm text-gray-600">Total Findings</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{report.summary.byAreaType.unit || 0}</div>
                <div className="text-sm text-gray-600">Unit Findings</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{report.summary.byAreaType.inside || 0}</div>
                <div className="text-sm text-gray-600">Inside Findings</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{report.summary.byAreaType.outside || 0}</div>
                <div className="text-sm text-gray-600">Outside Findings</div>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Findings by Severity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.summary.bySeverity).map(([severity, count]) => {
                const details = getSeverityDetails(severity);
                return (
                  <div 
                    key={severity} 
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: details.color, color: details.textColor }}
                  >
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-sm">{details.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Findings by Area */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Detailed Findings</h2>
          
          {report.areas.length > 0 ? (
            <div className="space-y-4">
              {report.areas.map(area => {
                const hasFindings = area.findings && area.findings.length > 0;
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
                        <h3 className="font-medium">
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
                        {!hasFindings ? (
                          <p className="text-gray-500 text-center py-4">No findings recorded for this area.</p>
                        ) : (
                          <div className="space-y-3">
                            {area.findings.map(finding => {
                              const severityDetails = getSeverityDetails(finding.severity);
                              return (
                                <div 
                                  key={finding.id} 
                                  className="border rounded-lg overflow-hidden"
                                  style={{ borderLeftColor: severityDetails.color, borderLeftWidth: '4px' }}
                                >
                                  <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium">{finding.subcategory}</h4>
                                      <span 
                                        className="text-xs px-2 py-1 rounded"
                                        style={{ backgroundColor: severityDetails.color, color: severityDetails.textColor }}
                                      >
                                        {severityDetails.label}
                                      </span>
                                    </div>
                                    
                                    <p className="mb-3">{finding.deficiency}</p>
                                    
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
                                              className="w-16 h-16 rounded overflow-hidden border cursor-pointer"
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
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
                className="max-h-[70vh] object-contain rounded"
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

export default InspectionReportPage;