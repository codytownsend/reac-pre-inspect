// src/utils/nspireScoring.js

/**
 * Severity point values for NSPIRE scoring by area
 */
export const SEVERITY_POINTS = {
  lifeThreatening: {
    outside: 49.60,
    inside: 54.50,
    units: 60.00
  },
  severe: {
    outside: 12.20,
    inside: 13.40,
    units: 14.80
  },
  moderate: {
    outside: 4.50,
    inside: 5.00,
    units: 5.50
  },
  low: {
    outside: 2.00,
    inside: 2.20,
    units: 2.40
  }
};

/**
 * Repair timeframes based on severity and program
 */
export const REPAIR_TIMEFRAMES = {
  lifeThreatening: {
    standard: 24, // hours
    hcv: 24 // hours
  },
  severe: {
    standard: 24, // hours
    hcv: 30 // days
  },
  moderate: {
    standard: 30, // days
    hcv: 30 // days
  },
  low: {
    standard: 60, // days
    hcv: 60 // days
  }
};

/**
 * Calculate the NSPIRE score for an inspection
 * 
 * @param {Array} findings - Array of finding objects with severity and area properties
 * @param {Number} unitSample - Number of units in the sample
 * @returns {Object} - Score details including total score and area breakdowns
 */
export const calculateNspireScore = (findings, unitSample) => {
  // Group findings by area and severity
  const groupedFindings = {
    outside: { lifeThreatening: 0, severe: 0, moderate: 0, low: 0 },
    inside: { lifeThreatening: 0, severe: 0, moderate: 0, low: 0 },
    units: { lifeThreatening: 0, severe: 0, moderate: 0, low: 0 }
  };
  
  // Count findings by area and severity
  findings.forEach(finding => {
    if (groupedFindings[finding.area] && 
        groupedFindings[finding.area][finding.severity]) {
      groupedFindings[finding.area][finding.severity]++;
    }
  });
  
  // Calculate points deducted for each area/severity combination
  const pointsDeducted = {
    outside: 0,
    inside: 0,
    units: 0,
    total: 0
  };
  
  Object.keys(groupedFindings).forEach(area => {
    Object.keys(groupedFindings[area]).forEach(severity => {
      const findingCount = groupedFindings[area][severity];
      if (findingCount > 0) {
        const points = (SEVERITY_POINTS[severity][area] * findingCount) / unitSample;
        pointsDeducted[area] += points;
        pointsDeducted.total += points;
      }
    });
  });
  
  // Check if unit score deduction exceeds 30 points (automatic failing score)
  let finalScore = 100 - pointsDeducted.total;
  if (pointsDeducted.units > 30) {
    finalScore = Math.min(finalScore, 59);
  }
  
  // Round to nearest whole number, with one exception
  if (finalScore > 59 && finalScore < 60) {
    finalScore = 59; // Properties scoring between 59 and 60 are rounded down to 59
  } else {
    finalScore = Math.round(finalScore);
  }
  
  return {
    score: finalScore,
    pointsDeducted,
    failingUnitAdjustment: pointsDeducted.units > 30,
    inspectionCycle: getInspectionCycle(finalScore)
  };
};

/**
 * Determine inspection cycle based on score
 */
function getInspectionCycle(score) {
  if (score >= 90) return 3; // years
  if (score >= 80) return 2; // years
  if (score >= 60) return 1; // year
  return 0; // fail
}

/**
 * Determine if a finding results in a pass or fail for voucher programs
 */
export const getVoucherResult = (finding) => {
  // This is a simplified version - would need to be expanded with the full NSPIRE rules
  if (finding.severity === 'lifeThreatening' || finding.severity === 'severe') {
    return 'fail';
  }
  
  // For moderate and low findings, check specific standards
  // This would need a complete mapping of all standards
  
  // Default to pass for low severity items
  if (finding.severity === 'low') {
    return 'pass';
  }
  
  // For moderate, would need more context from the specific deficiency
  return 'fail'; // Most moderate issues cause a fail
};