/**
 * my-resumes.js - JavaScript for the My Resumes page
 * Handles loading, displaying, and managing saved resumes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if debug logging is available
    const canDebug = typeof debugLog === 'function';
    
    // Log function that falls back to console.log if debugLog is not available
    function log(message) {
      if (canDebug) {
        debugLog(message);
      } else {
        console.log(message);
      }
    }
    
    log('My Resumes page script initialized');
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      log('No authentication token found, redirecting to login page');
      window.location.href = 'test.html?error=auth_required&redirect=my-resumes';
      return;
    }
    
    log('Authentication token found');
    
    // Prevent any form submissions from navigating away
    document.addEventListener('submit', function(e) {
      e.preventDefault();
      log('Form submission prevented');
    });
  
    // Display user name
    displayUserName();
    
    // Initialize UI element references
    const resumesList = document.getElementById('resumes-list');
    if (!resumesList) {
      log('ERROR: resumes-list element not found!');
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load resumes data
    loadResumes();
    
    
    /**
     * Set up event listeners for buttons and interactions
     */
    function setupEventListeners() {
      log('Setting up event listeners');
      
      // Home button
      const homeBtn = document.getElementById('home-btn');
      if (homeBtn) {
        log('Home button found, adding click listener');
        homeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          log('Home button clicked, navigating to loginindex.html');
          window.location.replace('loginindex.html');
        });
      } else {
        log('ERROR: Home button not found!');
      }
      
      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        log('Logout button found, adding click listener');
        logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          log('Logout button clicked');
          handleLogout();
        });
      } else {
        log('ERROR: Logout button not found!');
      }
      
      // Global click event delegation for dynamic buttons
      document.addEventListener('click', function(event) {
        log('Document click detected');
        
        // Edit resume button
        if (event.target.closest('.edit-resume-btn')) {
          const button = event.target.closest('.edit-resume-btn');
          const resumeId = button.getAttribute('data-id');
          const templateType = button.getAttribute('data-template') || 'template1';
          
          log(`Edit button clicked for resume ID: ${resumeId}, template: ${templateType}`);
          
          if (resumeId) {
            event.preventDefault(); // Prevent any default behavior
            event.stopPropagation(); // Stop event bubbling
            
            // Use replace instead of href to avoid history issues
            log(`Navigating to ${templateType}.html?id=${resumeId}`);
            window.location.replace(`${templateType}.html?id=${resumeId}`);
            return false; // Extra prevention
          }
        }
        
        // Delete resume button
        if (event.target.closest('.delete-resume-btn')) {
          const button = event.target.closest('.delete-resume-btn');
          const resumeId = button.getAttribute('data-id');
          const resumeName = button.getAttribute('data-name') || 'this resume';
          
          log(`Delete button clicked for resume ID: ${resumeId}, name: ${resumeName}`);
          
          if (resumeId) {
            event.preventDefault();
            event.stopPropagation();
            confirmDeleteResume(resumeId, resumeName);
            return false;
          }
        }
        
        // Download resume button
        if (event.target.closest('.download-resume-btn')) {
          const button = event.target.closest('.download-resume-btn');
          const resumeId = button.getAttribute('data-id');
          
          log(`Download button clicked for resume ID: ${resumeId}`);
          
          if (resumeId) {
            event.preventDefault();
            event.stopPropagation();
            downloadResume(resumeId);
            return false;
          }
        }
        
        // Create new resume button
        if (event.target.closest('.create-new-btn')) {
          log('Create new resume button clicked');
          event.preventDefault();
          event.stopPropagation();
          
          // Use replace instead of href to avoid history issues
          log('Navigating to template.html');
          window.location.replace('template.html');
          return false;
        }
      });
    }
    
    /**
     * Fetch and display the user's saved resumes
     */
    async function loadResumes() {
      log('Loading resumes...');
      
      try {
        const token = localStorage.getItem('token');
        
        // Show loading indicator
        resumesList.innerHTML = `
          <div class="loading-indicator text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your resumes...</p>
          </div>
        `;
        
        // Fetch resumes from API
        log('Sending API request to /api/resumes');
        const response = await fetch('/api/resumes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          log(`API error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to load resumes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        log(`Received ${data.data ? data.data.length : 0} resumes from API`);
        
        // Handle response
        if (data.success) {
          displayResumes(data.data || []);
        } else {
          throw new Error(data.message || 'Error loading resumes');
        }
      } catch (error) {
        log(`Error: ${error.message}`);
        console.error('Error loading resumes:', error);
        
        // Show error state
        resumesList.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            Failed to load your resumes. Please try again later.
          </div>
          <button class="btn btn-primary" onclick="window.location.reload()">
            <i class="fas fa-sync-alt me-2"></i>Retry
          </button>
        `;
      }
    }
    
    /**
     * Display resumes in the UI
     * @param {Array} resumes - Array of resume objects
     */
    function displayResumes(resumes) {
      // Clear loading indicator
      resumesList.innerHTML = '';
      
      // Add "Create New Resume" button at the top
      const createNewBtn = document.createElement('div');
      createNewBtn.className = 'text-center mb-4';
      createNewBtn.innerHTML = `
        <button class="create-new-btn">
          <i class="fas fa-plus"></i>
          Create New Resume
        </button>
      `;
      resumesList.appendChild(createNewBtn);
      
      // Check if there are any resumes
      if (!resumes || resumes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
          <i class="fas fa-file-alt"></i>
          <h3>No resumes yet</h3>
          <p>Create your first resume to get started</p>
          <button class="btn btn-primary create-new-btn">
            <i class="fas fa-plus me-2"></i>
            Create Resume
          </button>
        `;
        resumesList.appendChild(emptyState);
        return;
      }
      
      // Display each resume
      resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'resume-card';
        
        // Format date
        const lastUpdated = resume.lastUpdated || resume.createdAt;
        const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Unknown date';
        
        // Get template type (default to template1)
        const templateType = resume.template || 'template1';
        
        card.innerHTML = `
          <div class="resume-card-row">
            <div class="resume-info">
              <h3 class="resume-title">${escapeHtml(resume.personalInfo?.fullName || 'Untitled Resume')}</h3>
              <p class="resume-subtitle">${escapeHtml(resume.personalInfo?.jobTitle || 'No job title')}</p>
              <span class="date-meta">Last updated: ${formattedDate}</span>
            </div>
            <div class="resume-actions">
              <button class="btn btn-primary edit-resume-btn" data-id="${resume._id}" data-template="${templateType}">
                <i class="fas fa-edit"></i>
                <span class="d-none d-md-inline">Edit</span>
              </button>
              <button class="btn btn-secondary download-resume-btn" data-id="${resume._id}">
                <i class="fas fa-download"></i>
                <span class="d-none d-md-inline">Download</span>
              </button>
              <button class="btn btn-danger delete-resume-btn" data-id="${resume._id}" data-name="${escapeHtml(resume.personalInfo?.fullName || 'Untitled Resume')}">
                <i class="fas fa-trash"></i>
                <span class="d-none d-md-inline">Delete</span>
              </button>
            </div>
          </div>
        `;
        
        resumesList.appendChild(card);
      });
    }
    
    /**
     * Display confirmation dialog before deleting a resume
     * @param {string} id - Resume ID
     * @param {string} name - Resume name for confirmation message
     */
    function confirmDeleteResume(id, name) {
      if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        deleteResume(id);
      }
    }
    
    /**
     * Delete a resume
     * @param {string} id - Resume ID to delete
     */
    async function deleteResume(id) {
      try {
        const token = localStorage.getItem('token');
        
        // Send delete request
        const response = await fetch(`/api/resumes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete resume');
        }
        
        // Handle success
        showToast('Resume deleted successfully', 'success');
        
        // Reload resumes to update the UI
        loadResumes();
      } catch (error) {
        console.error('Error deleting resume:', error);
        showToast('Failed to delete resume', 'error');
      }
    }
    
 /**
 * Enhanced download resume function with built-in viewer
 * @param {string} id - Resume ID to download
 */
async function downloadResume(id) {
  try {
    const token = localStorage.getItem('token');
    
    // Show loading toast
    showToast('Generating PDF...', 'info');
    
    // Fetch the PDF file
    const response = await fetch(`/api/resumes/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'resume.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    // Convert response to blob
    const blob = await response.blob();
    
    // Option 1: Direct download approach
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    
    // Clean up after download
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);
    
    // Option 2: Display PDF in browser
    const viewUrl = window.URL.createObjectURL(blob);
    
    // Create a modal dialog for viewing the PDF
    const modalHtml = `
      <div class="modal fade" id="pdfViewerModal" tabindex="-1" aria-labelledby="pdfViewerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="pdfViewerModalLabel">Resume Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0" style="height: 75vh;">
              <iframe src="${viewUrl}#toolbar=1&navpanes=1" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <a href="${downloadUrl}" download="${filename}" class="btn btn-primary" id="downloadPdfBtn">
                <i class="fas fa-download"></i> Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page if it doesn't exist
    if (!document.getElementById('pdfViewerModal')) {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
    } else {
      // Update existing modal
      document.getElementById('pdfViewerModal').outerHTML = modalHtml;
    }
    
    // Show the modal using Bootstrap
    const viewerModal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
    viewerModal.show();
    
    // Add event listener to close modal
    document.getElementById('pdfViewerModal').addEventListener('hidden.bs.modal', function () {
      window.URL.revokeObjectURL(viewUrl);
    });
    
    showToast('PDF generated successfully', 'success');
  } catch (error) {
    console.error('Error downloading resume:', error);
    showToast('Failed to download resume. Please try again.', 'error');
  }
}

/**
 * Simple PDF download with direct object URL creation
 * for browsers that have issues with the combined approach
 */
function simplePdfDownload(id) {
  try {
    // Show loading toast
    showToast('Downloading resume...', 'info');
    
    // Create direct link to PDF
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    
    // Use URL parameters instead of headers
    link.href = `/api/resumes/${id}/download?token=${encodeURIComponent(token)}`;
    link.download = 'resume.pdf';
    link.target = '_blank'; 
    
    // Add to body, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Remove link after a delay
    setTimeout(() => {
      document.body.removeChild(link);
      showToast('Download initiated', 'success');
    }, 1000);
  } catch (error) {
    console.error('Simple download error:', error);
    showToast('Failed to download resume', 'error');
  }
}
    
    /**
     * Handle user logout
     */
    async function handleLogout() {
      log('Handling logout...');
      
      try {
        const token = localStorage.getItem('token');
        
        // Call logout API
        log('Calling logout API');
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        log('Logout API call successful');
      } catch (error) {
        log(`Logout API error: ${error.message}`);
        console.error('Logout error:', error);
        // Continue with local logout even if API call fails
      }
      
      // Clear local storage
      log('Clearing localStorage tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page - use replace to avoid history issues
      log('Redirecting to test.html?logout=true');
      window.location.replace('test.html?logout=true');
    }
    
    /**
     * Display user name from localStorage
     */
    function displayUserName() {
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userNameElement.textContent = userData.name || 'User';
      }
    }
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type ('success' or 'error')
     */
    function showToast(message, type = 'success') {
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      // Style the toast
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
      toast.style.color = 'white';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '9999';
      toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      
      // Add to document
      document.body.appendChild(toast);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 500);
      }, 3000);
    }
    
    /**
     * Utility: Escape HTML to prevent XSS
     * @param {string} unsafe - String to escape
     * @returns {string} Escaped string
     */
    function escapeHtml(unsafe) {
      if (!unsafe) return '';
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });