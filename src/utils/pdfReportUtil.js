import html2pdf from 'html2pdf.js';

// generatePDF
export const generatePDF = (elementId = 'report-content', filename = 'inspection-report.pdf', options = {}) => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      reject(new Error(`Element with ID "${elementId}" not found`));
      return;
    }
    
    // Create a clone of the element for printing
    const clone = element.cloneNode(true);
    clone.id = 'temp-for-pdf';
    
    // Apply checklist-style formatting and enlarge images
    const style = document.createElement('style');
    style.textContent = `
      /* Make the report more like a functional checklist */
      #temp-for-pdf {
        font-family: Arial, sans-serif;
        line-height: 1.3;
      }
      
      /* Remove fancy backgrounds from summary boxes */
      #temp-for-pdf .bg-blue-50,
      #temp-for-pdf .bg-purple-50,
      #temp-for-pdf .bg-green-50,
      #temp-for-pdf .bg-gray-50,
      #temp-for-pdf .bg-gray-100 {
        background-color: white !important;
        border: 1px solid #ddd !important;
      }
      
      /* Make severity indicators more straightforward */
      #temp-for-pdf .bg-red-100,
      #temp-for-pdf .bg-yellow-100,
      #temp-for-pdf .bg-blue-100,
      #temp-for-pdf .bg-green-100 {
        background-color: white !important;
        border: 1px solid currentColor !important;
        font-weight: bold !important;
      }
      
      /* Simplify borders and rounded corners */
      #temp-for-pdf .rounded-lg,
      #temp-for-pdf .rounded-xl {
        border-radius: 0 !important;
      }
      
      /* Make finding descriptions clearer */
      #temp-for-pdf .finding-deficiency {
        font-weight: bold !important;
        margin-bottom: 10px !important;
      }
      
      /* Double the size of all images */
      #temp-for-pdf .w-16.h-16,
      #temp-for-pdf .finding-photo,
      #temp-for-pdf .photo-thumbnail,
      #temp-for-pdf .finding-item__photo {
        width: 150px !important;
        height: 150px !important;
      }
      
      #temp-for-pdf img {
        object-fit: contain !important;
      }
      
      /* Make section titles more prominent */
      #temp-for-pdf h2,
      #temp-for-pdf h3 {
        font-weight: bold !important;
        border-bottom: 1px solid #000 !important;
        padding-bottom: 5px !important;
      }
    `;
    
    // Add style to clone
    clone.appendChild(style);
    
    // Remove any unnecessary elements
    const elementsToRemove = clone.querySelectorAll('.print-hide, button, .no-print');
    elementsToRemove.forEach(el => el.remove());
    
    // Append clone to body temporarily
    document.body.appendChild(clone);
    
    // Configure PDF options for better quality images
    const defaultOptions = {
      margin: [15, 15, 15, 15],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Use only the imported html2pdf version
    html2pdf()
      .from(clone)
      .set(mergedOptions)
      .save()
      .then(() => {
        // Clean up
        document.body.removeChild(clone);
        resolve({ success: true });
      })
      .catch(error => {
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
        console.error('Error generating PDF:', error);
        reject({ success: false, error });
      });
  });
};