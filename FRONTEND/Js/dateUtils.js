/**
 * Date utilities for consistent date handling across the application
 */

/**
 * Formats a date string for display
 * @param {string} dateString - Date string in any format including "Present"
 * @param {string} format - Optional format specification (default: 'MMM YYYY')
 * @returns {string} Formatted date string
 */
function formatDateDisplay(dateString) {
    // Handle empty values
    if (!dateString || dateString.trim() === '') {
      return '';
    }
    
    // Handle "Present" case (case insensitive)
    if (dateString.trim().toLowerCase() === 'present') {
      return 'Present';
    }
    
    // Try to parse the date
    try {
      // Check if it's already in MM/YYYY format
      const mmyyyyRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
      if (mmyyyyRegex.test(dateString)) {
        const parts = dateString.split('/');
        const month = parseInt(parts[0], 10);
        const year = parts[1];
        
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        return `${monthNames[month - 1]} ${year}`;
      }
      
      // Try to parse as a date object
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short'
        });
      }
      
      // If we can't parse it, return as is
      return dateString;
    } catch (e) {
      console.warn('Date formatting error:', e);
      return dateString; // Return original string if error
    }
  }
  
  /**
   * Validates a date input that allows 'Present' as a valid value
   * @param {string} value - The date value to validate
   * @returns {boolean} Whether the value is valid
   */
  function validateDateInput(value) {
    // Empty value check - determine if this is required elsewhere
    if (!value || value.trim() === '') {
      return true; // Allow empty for optional fields
    }
    
    // Accept "Present" as valid (case insensitive)
    if (value.trim().toLowerCase() === 'present') {
      return true;
    }
    
    // Check MM/YYYY format
    const mmyyyyRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (mmyyyyRegex.test(value)) {
      return true;
    }
    
    // Check for Mon YYYY format (e.g., Jan 2020)
    const monYYYYRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    if (monYYYYRegex.test(value)) {
      return true;
    }
    
    // Try to parse as a date
    try {
      const date = new Date(value);
      return !isNaN(date.getTime());
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Formats an input element's value to MM/YYYY format
   * @param {HTMLElement} input - The input element to format
   */
  function setupDateInputMask(input) {
    input.addEventListener('input', function(e) {
      // If user types "Present" (case insensitive), allow it
      if (/^p|pr|pre|pres|prese|presen|present$/i.test(e.target.value)) {
        return;
      }
      
      // Otherwise try to format as MM/YYYY
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      
      if (value.length > 0) {
        // Don't allow month values > 12
        if (value.length >= 2 && parseInt(value.substring(0, 2)) > 12) {
          value = '12' + value.substring(2);
        }
        
        // Format with / after month
        if (value.length > 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 6);
        }
      }
      
      e.target.value = value;
    });
    
    // Add blur handler to ensure proper formatting
    input.addEventListener('blur', function(e) {
      const value = e.target.value.trim();
      
      // Skip if empty or "Present"
      if (!value || value.toLowerCase() === 'present') {
        return;
      }
      
      // Ensure month has leading zero
      const parts = value.split('/');
      if (parts.length === 2) {
        const month = parseInt(parts[0], 10);
        if (month > 0 && month <= 12) {
          const formattedMonth = month.toString().padStart(2, '0');
          e.target.value = `${formattedMonth}/${parts[1]}`;
        }
      }
    });
  }
  
  /**
   * Initialize date input fields across the application
   */
  function initializeDateInputs() {
    // Find all date inputs and apply formatting
    document.querySelectorAll('.date-input').forEach(input => {
      setupDateInputMask(input);
      
      // Add placeholder text for guidance
      if (!input.placeholder) {
        input.placeholder = 'MM/YYYY or Present';
      }
      
      // Add tooltip if needed
      if (!input.title) {
        input.title = 'Enter date as MM/YYYY (e.g., 05/2023) or "Present" for current positions';
      }
    });
  }
  
  // Export the utilities
  export { 
    formatDateDisplay, 
    validateDateInput, 
    setupDateInputMask,
    initializeDateInputs
  };