// src/pages/shared/SharedReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust this import path as needed
import { ChevronDown, X, Printer, Download, Mail } from 'lucide-react';

const SharedReport = () => {
  const { id } = useParams();
  
  const [inspection, setInspection] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    site: true,
    buildingExterior: true,
    buildingSystems: true,
    commonAreas: true,
    unit: true
  });
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
  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
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
  
  // Get severity label
  const getSeverityLabel = (level) => {
    switch (level) {
      case 1: return "Level 1 - Minor";
      case 2: return "Level 2 - Major";
      case 3: return "Level 3 - Severe/Life-Threatening";
      default: return "Unknown";
    }
  };
  
  // Get severity color
  const getSeverityColor = (level) => {
    switch (level) {
      case 1: return "#cce5ff"; // Light blue
      case 2: return "#fff3cd"; // Light yellow
      case 3: return "#f8d7da"; // Light red
      default: return "#e9ecef"; // Light gray
    }
  };
  
  // Get severity text color
  const getSeverityTextColor = (level) => {
    switch (level) {
      case 1: return "#004085"; // Dark blue
      case 2: return "#856404"; // Dark yellow
      case 3: return "#721c24"; // Dark red
      default: return "#495057"; // Dark gray
    }
  };
  
  // Calculate NSPIRE score
  const calculateScore = (findings) => {
    if (!findings || findings.length === 0) {
      return 100;
    }
    
    // Level 1: -1 point, Level 2: -3 points, Level 3: -5 points
    const deductions = findings.reduce((total, finding) => {
      switch (finding.severity) {
        case 1: return total + 1;
        case 2: return total + 3;
        case 3: return total + 5;
        default: return total;
      }
    }, 0);
    
    // Maximum possible score is 100
    return Math.max(0, 100 - deductions);
  };
  
  // Generate summary data
  const generateSummary = (findings) => {
    const summary = {
      totalFindings: findings.length,
      byCategory: {},
      bySeverity: {
        1: 0,
        2: 0,
        3: 0
      }
    };
    
    findings.forEach(finding => {
      // Count by category
      if (!summary.byCategory[finding.category]) {
        summary.byCategory[finding.category] = 0;
      }
      summary.byCategory[finding.category]++;
      
      // Count by severity
      if (finding.severity >= 1 && finding.severity <= 3) {
        summary.bySeverity[finding.severity]++;
      }
    });
    
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
      <div className="container" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
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
      <div className="container" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
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
  const score = calculateScore(inspection.findings || []);
  
  // Generate summary
  const summary = generateSummary(inspection.findings || []);
  
  // Define category order and names for display
  const categoryOrder = ['site', 'buildingExterior', 'buildingSystems', 'commonAreas', 'unit'];
  const categoryNames = {
    site: 'Site',
    buildingExterior: 'Building Exterior',
    buildingSystems: 'Building Systems',
    commonAreas: 'Common Areas',
    unit: 'Unit'
  };
  
  // Group findings by category
  const findingsByCategory = {};
  categoryOrder.forEach(category => {
    findingsByCategory[category] = (inspection.findings || [])
      .filter(finding => finding.category === category)
      .sort((a, b) => b.severity - a.severity);
  });
  
  // Log what we're rendering
  console.log("Rendering report with inspection:", inspection);
  console.log("Property:", property);
  console.log("Findings by category:", findingsByCategory);
  
  return (
    <div className="container report-container">
      {/* Report header for shared view */}
      <div className="report-header">
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          NSPIRE Inspection Report
        </h1>
        
        <div className="report-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handlePrint}
          >
            <Printer size={16} style={{ marginRight: '6px' }} />Print
          </button>
        </div>
      </div>
      
      {/* Shared version banner */}
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '12px 16px', 
        textAlign: 'center', 
        color: '#0d47a1',
        margin: '0 0 20px 0'
      }}>
        This is a shared version of the inspection report.
      </div>
      
      {/* Report content */}
      <div className="report-content">
        {/* Report Header */}
        <div className="report-title">
          <h1>NSPIRE Pre-Inspection Report: {property.name}</h1>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Property & Inspection Details */}
        <div className="report-info">
          {/* Property Details */}
          <div className="info-section">
            <h2>Property Details</h2>
            <div className="info-grid">
              <div>
                <p><strong>Name:</strong> {property.name}</p>
                <p><strong>Address:</strong> {property.address}</p>
              </div>
              <div>
                <p><strong>Units:</strong> {property.units}</p>
                <p><strong>Buildings:</strong> {property.buildingCount}</p>
              </div>
            </div>
          </div>
          
          {/* Inspection Details */}
          <div className="info-section">
            <h2>Inspection Details</h2>
            <div className="info-grid">
              <div>
                <p><strong>Date:</strong> {new Date(inspection.date).toLocaleDateString()}</p>
                <p><strong>Inspector:</strong> {inspection.inspector}</p>
              </div>
              <div>
                <p><strong>Total Findings:</strong> {summary.totalFindings}</p>
                <p className="score-display">
                  <span>NSPIRE Score: </span>
                  <span className={`score-badge ${
                    score >= 90 ? 'score-high' : 
                    score >= 80 ? 'score-medium' : 'score-low'
                  }`}>
                    {score}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="report-summary">
          <h2>Summary</h2>
          
          {/* Findings by Category */}
          <div className="summary-section">
            <h3>Findings by Category</h3>
            <div className="summary-cards">
              {Object.entries(summary.byCategory).map(([category, count]) => (
                <div key={category} className="summary-card">
                  <div className="summary-card-value">{count}</div>
                  <div className="summary-card-label">{categoryNames[category] || category}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Findings by Severity */}
          <div className="summary-section">
            <h3>Findings by Severity</h3>
            <div className="summary-cards">
              {Object.entries(summary.bySeverity).map(([level, count]) => {
                const severityLevel = parseInt(level);
                return (
                  <div 
                    key={level} 
                    className="summary-card"
                    style={{
                      backgroundColor: getSeverityColor(severityLevel),
                      color: getSeverityTextColor(severityLevel)
                    }}
                  >
                    <div className="summary-card-value">{count}</div>
                    <div className="summary-card-label">Level {level}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Detailed Findings */}
        <div className="report-findings">
          <h2>Detailed Findings</h2>
          
          {/* Render findings by category */}
          {inspection.findings && inspection.findings.length > 0 ? (
            categoryOrder.map(category => {
              const findings = findingsByCategory[category];
              if (!findings || findings.length === 0) return null;
              
              return (
                <div key={category} className="findings-category">
                  {/* Collapsible section header */}
                  <div 
                    className="category-header"
                    onClick={() => toggleSection(category)}
                  >
                    <h3>{categoryNames[category]} ({findings.length})</h3>
                    <ChevronDown 
                      className={`toggle-icon ${expandedSections[category] ? 'expanded' : ''}`} 
                      size={20}
                    />
                  </div>
                  
                  {/* Collapsible content */}
                  {expandedSections[category] && (
                    <div className="category-findings">
                      {findings.map((finding) => (
                        <div 
                          key={finding.id} 
                          className="finding-card"
                          style={{
                            borderColor: getSeverityColor(finding.severity)
                          }}
                        >
                          {/* Finding Header */}
                          <div 
                            className="finding-header"
                            style={{
                              backgroundColor: getSeverityColor(finding.severity),
                              color: getSeverityTextColor(finding.severity)
                            }}
                          >
                            <div className="finding-title">
                              {finding.subcategory}
                            </div>
                            <div className="finding-severity">
                              {getSeverityLabel(finding.severity)}
                            </div>
                          </div>
                          
                          {/* Finding Details */}
                          <div className="finding-content">
                            <div className="finding-details">
                              <p><strong>Location:</strong> {finding.location}</p>
                              <p><strong>Deficiency:</strong> {finding.deficiency}</p>
                              {finding.notes && (
                                <p><strong>Notes:</strong> {finding.notes}</p>
                              )}
                            </div>
                            
                            {/* Photo Evidence */}
                            {finding.photos && finding.photos.length > 0 && (
                              <div className="finding-photos">
                                <h4>Photo Evidence ({finding.photos.length})</h4>
                                <div className="photo-thumbnails">
                                  {finding.photos.map((photo, index) => (
                                    <div 
                                      key={index} 
                                      className="photo-thumbnail"
                                      onClick={() => openImageModal(photo.data || photo.url, finding)}
                                    >
                                      <img 
                                        src={photo.data || photo.url} 
                                        alt={`Finding ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                      <div className="zoom-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '24px', 
              textAlign: 'center', 
              borderRadius: '8px' 
            }}>
              <p>No findings have been recorded for this inspection.</p>
            </div>
          )}
        </div>
        
        {/* Report footer */}
        <div className="report-footer">
          <p>This report was generated using the NSPIRE Pre-Inspection Mobile App</p>
          <p>© 2025 NSPIRE Inspection Software</p>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && activeImage && (
        <div 
          className="image-modal-overlay"
          onClick={() => setShowImageModal(false)}
        >
          <div className="image-modal-container">
            <img 
              src={activeImage.url} 
              alt={`Finding: ${activeImage.finding.deficiency}`} 
              className="image-modal-image"
            />
            <button 
              className="image-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(false);
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="image-modal-details">
            <h3>{categoryNames[activeImage.finding.category]}: {activeImage.finding.subcategory}</h3>
            <p><strong>Location:</strong> {activeImage.finding.location}</p>
            <p><strong>Deficiency:</strong> {activeImage.finding.deficiency}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedReport;