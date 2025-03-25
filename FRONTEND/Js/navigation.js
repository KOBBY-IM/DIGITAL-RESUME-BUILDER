/**
 * navigation.js - Common navigation functions for resume templates
 */

// Function to navigate to templates page
function goToTemplates() {
    // Check if there are unsaved changes
    if (hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
            return;
        }
    }
    window.location.href = 'template.html';
}

// Function to navigate to home page
function goToHome() {
    // Check if there are unsaved changes
    if (hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
            return;
        }
    }
    window.location.href = 'loginindex.html';
}

// Function to check for unsaved changes (stub - would be implemented in each template)
function hasUnsavedChanges() {
    // This would need to be implemented specifically for each template
    // The actual implementation would compare the current form state to the last saved state
    return false;
}

// Function to load a saved resume
function loadSavedResume(resumeId) {
    // Redirect to the appropriate template with the resume ID
    window.location.href = `template2.html?id=${resumeId}`;
}

// Initialize Back buttons on page load
document.addEventListener('DOMContentLoaded', function() {
    // Find all back to templates buttons
    const backButtons = document.querySelectorAll('.back-to-templates-btn, #back-to-templates-btn');
    
    // Add click handler to each
    backButtons.forEach(button => {
        button.addEventListener('click', goToTemplates);
    });
    
    // Find all home buttons
    const homeButtons = document.querySelectorAll('.home-btn, #home-btn');
    
    // Add click handler to each
    homeButtons.forEach(button => {
        button.addEventListener('click', goToHome);
    });
});