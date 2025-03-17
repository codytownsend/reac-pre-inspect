// src/models/Finding.js

/**
 * NSPIRE Finding data model
 * Represents a single deficiency found during an inspection
 */
export class Finding {
  constructor({
    id = null,
    inspectionId,
    areaId = null,
    area, // 'outside', 'inside', or 'units'
    category,
    subcategory = null,
    deficiencyId,
    severity, // 'lifeThreatening', 'severe', 'moderate', or 'low'
    description = '',
    location = '',
    repairDueDate = null,
    repairTimeframe = null,
    hcvRating = null, // 'pass' or 'fail'
    photos = [],
    notes = '',
    status = 'open', // 'open', 'scheduled', 'repaired', 'verified'
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.inspectionId = inspectionId;
    this.areaId = areaId;
    this.area = area;
    this.category = category;
    this.subcategory = subcategory;
    this.deficiencyId = deficiencyId;
    this.severity = severity;
    this.description = description;
    this.location = location;
    this.repairDueDate = repairDueDate;
    this.repairTimeframe = repairTimeframe;
    this.hcvRating = hcvRating;
    this.photos = photos;
    this.notes = notes;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calculate repair due date based on severity and program
   * @param {String} program - 'standard' or 'hcv'
   * @param {Date} inspectionDate - Date of inspection
   * @returns {Date} - Due date for repair
   */
  calculateRepairDueDate(program = 'standard', inspectionDate = new Date()) {
    let dueDate = new Date(inspectionDate);
    
    switch(this.severity) {
      case 'lifeThreatening':
        // 24 hours for all programs
        dueDate.setHours(dueDate.getHours() + 24);
        break;
      case 'severe':
        if (program === 'hcv' || program === 'pbv') {
          // 30 days for HCV/PBV
          dueDate.setDate(dueDate.getDate() + 30);
        } else {
          // 24 hours for other programs
          dueDate.setHours(dueDate.getHours() + 24);
        }
        break;
      case 'moderate':
        // 30 days for all programs
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case 'low':
        // 60 days for all programs
        dueDate.setDate(dueDate.getDate() + 60);
        break;
      default:
        // Default to 30 days
        dueDate.setDate(dueDate.getDate() + 30);
    }
    
    return dueDate;
  }
  
  /**
   * Determine if the finding results in a fail for voucher programs
   * @returns {Boolean} - True if the finding would cause a fail
   */
  isFailForVoucher() {
    // Life threatening and severe always fail
    if (this.severity === 'lifeThreatening' || this.severity === 'severe') {
      return true;
    }
    
    // For moderate and low, it depends on the specific standard
    // This would need to be expanded with the full NSPIRE rules
    if (this.severity === 'low') {
      return false; // Most low severity issues are a pass
    }
    
    return true; // Most moderate issues cause a fail
  }
}

// src/models/Inspection.js

/**
 * NSPIRE Inspection data model
 */
export class Inspection {
  constructor({
    id = null,
    propertyId,
    date = new Date().toISOString(),
    inspector = '',
    status = 'In Progress', // 'Scheduled', 'In Progress', 'Completed'
    type = 'reac', // 'reac', 'hcv', 'self', etc.
    areas = [], // Areas inspected (may include details like buildings, floors, units)
    findings = [],
    notes = '',
    score = null,
    unitSample = 0,
    totalUnits = 0,
    userId = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.propertyId = propertyId;
    this.date = date;
    this.inspector = inspector;
    this.status = status;
    this.type = type;
    this.areas = areas;
    this.findings = findings;
    this.notes = notes;
    this.score = score;
    this.unitSample = unitSample;
    this.totalUnits = totalUnits;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  /**
   * Calculate the inspection score based on NSPIRE standards
   * @returns {Object} - Score details
   */
  calculateScore() {
    if (!this.findings || this.findings.length === 0) {
      return {
        score: 100,
        pointsDeducted: { outside: 0, inside: 0, units: 0, total: 0 },
        failingUnitAdjustment: false,
        inspectionCycle: 3
      };
    }
    
    // Import and use the scoring utility
    // In a real implementation, you'd need to handle this import differently
    const { calculateNspireScore } = require('../utils/nspireScoring');
    return calculateNspireScore(this.findings, this.unitSample || 1);
  }
  
  /**
   * Determine if the inspection passes or fails for voucher programs
   * @returns {String} - 'pass' or 'fail'
   */
  getVoucherResult() {
    if (!this.findings || this.findings.length === 0) {
      return 'pass';
    }
    
    // If any finding results in a fail, the entire unit fails
    for (const finding of this.findings) {
      // Import or create a Finding object
      const findingObj = new Finding(finding);
      if (findingObj.isFailForVoucher()) {
        return 'fail';
      }
    }
    
    return 'pass';
  }
  
  /**
   * Determine if a full post-inspection survey is required
   * @returns {Boolean} - True if a full survey is required
   */
  requiresFullSurvey() {
    // If the score is below 60, a full survey is required
    if (this.score < 60) {
      return true;
    }
    return false;
  }
};