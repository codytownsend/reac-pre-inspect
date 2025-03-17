// src/utils/report.js
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
      findings: []
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

  // No findings
  if (!inspection.findings || inspection.findings.length === 0) {
    report.inspection.score = 100;
    return report;
  }

  // Process all findings
  report.inspection.findings = inspection.findings.map(finding => ({
    id: finding.id,
    category: finding.category,
    categoryName: categoryNames[finding.category] || 'Other',
    subcategory: finding.subcategory,
    location: finding.location,
    deficiency: finding.deficiency,
    severity: finding.severity,
    notes: finding.notes,
    photoCount: finding.photos ? finding.photos.length : 0,
    photos: finding.photos ? finding.photos.map(photo => photo.url || photo.data) : []
  }));

  // Calculate summary statistics
  report.summary.totalFindings = inspection.findings.length;

  // Group by category
  inspection.findings.forEach(finding => {
    if (!report.summary.byCategory[finding.category]) {
      report.summary.byCategory[finding.category] = 0;
    }
    report.summary.byCategory[finding.category]++;
    
    // Count by severity
    if (finding.severity >= 1 && finding.severity <= 3) {
      report.summary.bySeverity[finding.severity]++;
    }
  });

  // Calculate inspection score (simplified version of NSPIRE scoring)
  const deductions = inspection.findings.reduce((total, finding) => {
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