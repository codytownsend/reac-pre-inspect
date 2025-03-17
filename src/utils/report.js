// src/utils/report.js - generateReport function

const generateReport = (inspection, property) => {
  // Get category names mapping
  const categoryNames = {
    site: 'Site',
    buildingExterior: 'Building Exterior',
    buildingSystems: 'Building Systems',
    commonAreas: 'Common Areas',
    unit: 'Unit'
  };

  // Create a blank report object
  const report = {
    title: `NSPIRE Pre-Inspection Report: ${property.name}`,
    date: new Date().toISOString(),
    property: {
      name: property.name,
      address: property.address,
      units: property.units,
      buildingCount: property.buildingCount
    },
    inspection: {
      date: inspection.date,
      inspector: inspection.inspector,
      score: 0, // Will be calculated
      areas: []
    },
    summary: {
      totalFindings: 0,
      byCategory: {},
      bySeverity: {
        1: 0,
        2: 0,
        3: 0
      }
    }
  };

  // If still using the old format (findings directly on inspection)
  if (inspection.findings && !inspection.areas) {
    // Convert to new format for report
    const allFindings = {
      id: 'all-findings',
      name: 'All Findings',
      areaType: 'all',
      findings: inspection.findings.map(finding => ({
        id: finding.id,
        category: finding.category,
        categoryName: categoryNames[finding.category] || 'Other',
        subcategory: finding.subcategory,
        location: finding.location,
        deficiency: finding.deficiency,
        severity: finding.severity,
        notes: finding.notes,
        photoCount: finding.photos ? finding.photos.length : 0,
        photos: finding.photos ? finding.photos.map(photo => photo.data || photo.url) : []
      }))
    };
    
    report.inspection.areas = [allFindings];
    
    // Populate summary statistics
    allFindings.findings.forEach(finding => {
      // Increment total findings
      report.summary.totalFindings++;
      
      // Group by category
      if (!report.summary.byCategory[finding.category]) {
        report.summary.byCategory[finding.category] = 0;
      }
      report.summary.byCategory[finding.category]++;
      
      // Count by severity
      if (finding.severity >= 1 && finding.severity <= 3) {
        report.summary.bySeverity[finding.severity]++;
      }
    });
    
    // Calculate score based on findings
    const deductions = allFindings.findings.reduce((total, finding) => {
      switch (finding.severity) {
        case 1: return total + 1;
        case 2: return total + 3;
        case 3: return total + 5;
        default: return total;
      }
    }, 0);
    
    // Maximum possible score is 100
    report.inspection.score = Math.max(0, 100 - deductions);
    
    return report;
  }

  // No areas or findings
  if (!inspection.areas || inspection.areas.length === 0) {
    report.inspection.score = 100;
    return report;
  }

  // Process all areas and their findings
  report.inspection.areas = inspection.areas.map(area => {
    // Process findings for this area
    const areaFindings = area.findings.map(finding => ({
      id: finding.id,
      category: finding.category,
      categoryName: categoryNames[finding.category] || 'Other',
      subcategory: finding.subcategory,
      deficiency: finding.deficiency,
      severity: finding.severity,
      notes: finding.notes,
      photoCount: finding.photos ? finding.photos.length : 0,
      photos: finding.photos ? finding.photos.map(photo => photo.data || photo.url) : []
    }));

    // Update summary statistics
    areaFindings.forEach(finding => {
      // Increment total findings
      report.summary.totalFindings++;

      // Group by category
      if (!report.summary.byCategory[finding.category]) {
        report.summary.byCategory[finding.category] = 0;
      }
      report.summary.byCategory[finding.category]++;
      
      // Count by severity
      if (finding.severity >= 1 && finding.severity <= 3) {
        report.summary.bySeverity[finding.severity]++;
      }
    });

    return {
      id: area.id,
      name: area.name,
      areaType: area.areaType,
      findings: areaFindings
    };
  });

  // Calculate inspection score
  const deductions = inspection.areas.reduce((total, area) => {
    return total + area.findings.reduce((areaTotal, finding) => {
      switch (finding.severity) {
        case 1: return areaTotal + 1;
        case 2: return areaTotal + 3;
        case 3: return areaTotal + 5;
        default: return areaTotal;
      }
    }, 0);
  }, 0);
  
  // Maximum possible score is 100
  report.inspection.score = Math.max(0, 100 - deductions);

  return report;
};

// Helper functions for report display
const getSeverityLabel = (level) => {
  switch (level) {
    case 1: return "Level 1 - Minor";
    case 2: return "Level 2 - Major";
    case 3: return "Level 3 - Severe/Life-Threatening";
    default: return "Unknown";
  }
};

const getSeverityColor = (level) => {
  switch (level) {
    case 1: return "#cce5ff"; // Light blue
    case 2: return "#fff3cd"; // Light yellow
    case 3: return "#f8d7da"; // Light red
    default: return "#e9ecef"; // Light gray
  }
};

const getSeverityTextColor = (level) => {
  switch (level) {
    case 1: return "#004085"; // Dark blue
    case 2: return "#856404"; // Dark yellow
    case 3: return "#721c24"; // Dark red
    default: return "#495057"; // Dark gray
  }
};

export { 
  generateReport,
  getSeverityLabel,
  getSeverityColor,
  getSeverityTextColor
};