// src/utils/pdfGenerator.js
import html2pdf from 'html2pdf.js';

/**
 * Generates a PDF from HTML content
 * 
 * @param {string} elementId - The ID of the element to convert to PDF
 * @param {string} filename - The name of the output file
 * @param {Object} options - Custom configuration options for html2pdf
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generatePDF = (elementId = 'report-content', filename = 'inspection-report.pdf', options = {}) => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }
  
  // Default options - can be overridden by passed options
  const defaultOptions = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 3,  // Increased from 2 to 3 for better quality
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait' 
    }
  };
  
  // Merge default options with passed options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Create a clone of the element for printing
  // This allows us to make temporary modifications for print
  const clone = element.cloneNode(true);
  clone.id = 'temp-for-pdf';
  
  // Temporarily append the clone to the document body
  document.body.appendChild(clone);
  
  // Temporarily add print styles
  const originalDisplayStyles = [];
  
  // Hide elements we don't want in the PDF
  const elementsToHide = clone.querySelectorAll('.no-print, button, .print-hide');
  elementsToHide.forEach((el, index) => {
    originalDisplayStyles[index] = el.style.display;
    el.style.display = 'none';
  });
  
  // Generate PDF
  return html2pdf()
    .set(mergedOptions)
    .from(clone)
    .save()
    .then(() => {
      // Clean up - remove the clone and restore original styles
      document.body.removeChild(clone);
      
      return {
        success: true,
        message: `PDF "${filename}" generated successfully`
      };
    })
    .catch(error => {
      // Clean up even if there's an error
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      
      console.error('Error generating PDF:', error);
      
      return {
        success: false,
        message: 'Failed to generate PDF',
        error
      };
    });
};