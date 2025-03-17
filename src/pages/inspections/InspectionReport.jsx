// src/pages/inspections/InspectionReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { useProperty } from '../../context/PropertyContext';
import { generateReport, getSeverityLabel, getSeverityColor, getSeverityTextColor } from '../../utils/report';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust this import path to match your Firebase setup
import {
  Download,
  Printer,
  ChevronDown,
  X,
  ArrowLeft,
  Share2,
  Mail,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InspectionReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInspection } = useInspection();
  const { getProperty } = useProperty();
  
  const [report, setReport] = useState(null);
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
        
        // Generate the report
        const generatedReport = generateReport(inspection, property);
        setReport(generatedReport);
      } catch (error) {
        setError('Error generating report: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getInspection, getProperty, navigate]);
  
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
  
  // Handle share report - updated to mark the inspection as shared
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
          console.error('Failed to copy: ', err);
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
      // First mark as shared in case it isn't already
      updateDoc(doc(db, 'inspections', id), {
        isShared: true,
        sharedIds: arrayUnion(id),
        sharedAt: serverTimestamp()
      }).then(() => {
        // In a real app, you would call your API to send the email
        // Here we'll just show a success message
        setShareSuccess(`Report will be emailed to ${recipientEmail}`);
        setTimeout(() => setShareSuccess(''), 5000);
      }).catch(err => {
        setError('Error preparing report for sharing: ' + err.message);
        setTimeout(() => setError(''), 5000);
      });
      
      // Hide the share options dropdown
      setShowShareOptions(false);
    } else if (recipientEmail) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 5000);
    }
  };
  
  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!report) return;
    
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text(report.title, 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date(report.date).toLocaleDateString()}`, 14, 30);
      
      // Property Details
      doc.setFontSize(14);
      doc.text('Property Details', 14, 40);
      
      doc.setFontSize(10);
      doc.text(`Name: ${report.property.name}`, 14, 48);
      doc.text(`Address: ${report.property.address}`, 14, 54);
      doc.text(`Units: ${report.property.units}`, 14, 60);
      doc.text(`Buildings: ${report.property.buildingCount}`, 14, 66);
      
      // Inspection Details
      doc.setFontSize(14);
      doc.text('Inspection Details', 14, 76);
      
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(report.inspection.date).toLocaleDateString()}`, 14, 84);
      doc.text(`Inspector: ${report.inspection.inspector}`, 14, 90);
      doc.text(`Total Findings: ${report.summary.totalFindings}`, 14, 96);
      doc.text(`NSPIRE Score: ${report.inspection.score}`, 14, 102);
      
      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 112);
      
      // Findings by Category
      doc.setFontSize(12);
      doc.text('Findings by Category', 14, 120);
      
      // Table for categories
      const categoriesData = Object.entries(report.summary.byCategory).map(([category, count]) => {
        const categoryNames = {
          site: 'Site',
          buildingExterior: 'Building Exterior',
          buildingSystems: 'Building Systems',
          commonAreas: 'Common Areas',
          unit: 'Unit'
        };
        return [categoryNames[category] || category, count];
      });
      
      doc.autoTable({
        startY: 124,
        head: [['Category', 'Count']],
        body: categoriesData,
        theme: 'grid',
        headStyles: { fillColor: [51, 51, 51] }
      });
      
      // Findings by Severity
      const severityTableY = doc.autoTable.previous.finalY + 10;
      doc.setFontSize(12);
      doc.text('Findings by Severity', 14, severityTableY);
      
      // Table for severity
      const severityData = Object.entries(report.summary.bySeverity).map(([level, count]) => {
        return [`Level ${level} - ${level === '1' ? 'Minor' : level === '2' ? 'Major' : 'Severe'}`, count];
      });
      
      doc.autoTable({
        startY: severityTableY + 4,
        head: [['Severity', 'Count']],
        body: severityData,
        theme: 'grid',
        headStyles: { fillColor: [51, 51, 51] }
      });
      
      // Detailed Findings
      const findingsY = doc.autoTable.previous.finalY + 10;
      doc.setFontSize(14);
      doc.text('Detailed Findings', 14, findingsY);
      
      // Add a new page for findings
      doc.addPage();
      
      // Define category order
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
        findingsByCategory[category] = report.inspection.findings
          .filter(finding => finding.category === category)
          .sort((a, b) => b.severity - a.severity);
      });
      
      let currentY = 20;
      
      // Process each category and its findings
      categoryOrder.forEach(category => {
        const findings = findingsByCategory[category];
        if (findings.length === 0) return;
        
        // Check if we need a new page
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }
        
        // Category header
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${categoryNames[category]} (${findings.length})`, 14, currentY);
        doc.setFont(undefined, 'normal');
        currentY += 8;
        
        // Process each finding
        findings.forEach((finding, index) => {
          // Check if we need a new page
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }
          
          // Finding header with severity
          const severityText = `${finding.subcategory} - ${getSeverityLabel(finding.severity)}`;
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.text(severityText, 14, currentY);
          doc.setFont(undefined, 'normal');
          currentY += 6;
          
          // Finding details
          doc.setFontSize(9);
          doc.text(`Location: ${finding.location}`, 14, currentY);
          currentY += 5;
          doc.text(`Deficiency: ${finding.deficiency}`, 14, currentY);
          currentY += 5;
          
          if (finding.notes) {
            doc.text(`Notes: ${finding.notes}`, 14, currentY);
            currentY += 5;
          }
          
          // Photo count
          if (finding.photoCount > 0) {
            doc.text(`Photos: ${finding.photoCount}`, 14, currentY);
            currentY += 5;
          }
          
          // Add some space between findings
          currentY += 5;
        });
        
        // Add space between categories
        currentY += 5;
      });
      
      // Save the PDF
      doc.save(`NSPIRE_Report_${report.property.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF report. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px'
        }}>
          <div>Generating report...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Report Error</h1>
        </div>
        <div className="alert alert-danger">{error}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/inspections/${id}`)}
        >
          Back to Inspection
        </button>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Report Not Available</h1>
        </div>
        <div className="alert alert-warning">Could not generate report. Please try again.</div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/inspections/${id}`)}
        >
          Back to Inspection
        </button>
      </div>
    );
  }
  
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
    findingsByCategory[category] = report.inspection.findings
      .filter(finding => finding.category === category)
      .sort((a, b) => b.severity - a.severity);
  });
  
  return (
    <div className="container report-container">
      {/* Enhanced header with sharing options */}
      <div className="report-header">
        <button
          className="back-button"
          onClick={() => navigate(`/inspections/${id}`)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="report-actions" style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} /> Print
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowShareOptions(!showShareOptions)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={16} /> Share
          </button>
          
          {/* Share options dropdown */}
          {showShareOptions && (
            <div 
              style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '8px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                zIndex: 100,
                minWidth: '200px'
              }}
            >
              <div 
                style={{ 
                  padding: '12px 16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  borderBottom: '1px solid #eee'
                }}
                onClick={handleShareReport}
              >
                <LinkIcon size={16} />
                <span>Copy shareable link</span>
              </div>
              <div 
                style={{ 
                  padding: '12px 16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
                onClick={handleEmailReport}
              >
                <Mail size={16} />
                <span>Email as PDF</span>
              </div>
            </div>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
      
      {/* Success/error messages */}
      {shareSuccess && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '10px 16px', 
            borderRadius: '4px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Check size={16} />
          {shareSuccess}
        </div>
      )}
      
      {/* Report content */}
      <div className="report-content">
        {/* Report Header */}
        <div className="report-title">
          <h1>{report.title}</h1>
          <p>Generated on {new Date(report.date).toLocaleDateString()}</p>
        </div>
        
        {/* Property & Inspection Details */}
        <div className="report-info">
          {/* Property Details */}
          <div className="info-section">
            <h2>Property Details</h2>
            <div className="info-grid">
              <div>
                <p><strong>Name:</strong> {report.property.name}</p>
                <p><strong>Address:</strong> {report.property.address}</p>
              </div>
              <div>
                <p><strong>Units:</strong> {report.property.units}</p>
                <p><strong>Buildings:</strong> {report.property.buildingCount}</p>
              </div>
            </div>
          </div>
          
          {/* Inspection Details */}
          <div className="info-section">
            <h2>Inspection Details</h2>
            <div className="info-grid">
              <div>
                <p><strong>Date:</strong> {new Date(report.inspection.date).toLocaleDateString()}</p>
                <p><strong>Inspector:</strong> {report.inspection.inspector}</p>
              </div>
              <div>
                <p><strong>Total Findings:</strong> {report.summary.totalFindings}</p>
                <p className="score-display">
                  <span>NSPIRE Score: </span>
                  <span className={`score-badge ${
                    report.inspection.score >= 90 ? 'score-high' : 
                    report.inspection.score >= 80 ? 'score-medium' : 'score-low'
                  }`}>
                    {report.inspection.score}
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
              {Object.entries(report.summary.byCategory).map(([category, count]) => (
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
              {Object.entries(report.summary.bySeverity).map(([level, count]) => {
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
          {categoryOrder.map(category => {
            const findings = findingsByCategory[category];
            if (findings.length === 0) return null;
            
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
                          {finding.photoCount > 0 && finding.photos && (
                            <div className="finding-photos">
                              <h4>Photo Evidence ({finding.photoCount})</h4>
                              <div className="photo-thumbnails">
                                {finding.photos.map((photo, index) => (
                                  <div 
                                    key={index} 
                                    className="photo-thumbnail"
                                    onClick={() => openImageModal(photo, finding)}
                                  >
                                    <img src={photo} alt={`Finding ${index + 1}`} />
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
          })}
        </div>
        
        {/* Enhanced footer with sharing info */}
        <div className="report-footer">
          <p>This report was generated using the NSPIRE Pre-Inspection Mobile App</p>
          <p>© 2025 NSPIRE Inspection Software</p>
          <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#888' }}>
            Share this report with colleagues and clients using the Share button
          </p>
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
            <h3>{activeImage.finding.categoryName}: {activeImage.finding.subcategory}</h3>
            <p><strong>Location:</strong> {activeImage.finding.location}</p>
            <p><strong>Deficiency:</strong> {activeImage.finding.deficiency}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionReport;