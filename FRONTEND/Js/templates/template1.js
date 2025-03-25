/**
 * template1.js - Clean implementation for Template 1 Resume Builder
 */

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  checkAuthentication();
  
  // Initialize the application components
  initializeApp();
});

/**
 * Check if the user is authenticated, redirect to login if not
 */
function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'test.html?redirect=template1&error=auth_required';
    return false;
  }
  return true;
}

/**
 * Initialize all application components
 */
function initializeApp() {
  // Set up form input listeners
  setupFormListeners();
  
  // Initialize UI components and buttons
  setupUIComponents();
  
  // Check if we need to load an existing resume
  checkForExistingResume();
}

/**
 * Set up event listeners for form inputs to update preview
 */
function setupFormListeners() {
  // Add listeners to all inputs with data-preview attribute
  document.querySelectorAll('[data-preview]').forEach(input => {
    input.addEventListener('input', function() {
      const previewId = this.getAttribute('data-preview');
      const previewElement = document.getElementById(previewId);
      
      if (previewElement) {
        previewElement.textContent = this.value || getDefaultText(previewId);
      }
    });
  });
  
  // Set up listeners for inputs without direct preview mappings
  document.querySelectorAll('input:not([data-preview]), textarea:not([data-preview])').forEach(input => {
    input.addEventListener('input', updateAllPreviews);
  });
}

/**
 * Set up UI components and button handlers
 */
function setupUIComponents() {
  // Back to templates button
  const backBtn = document.getElementById('back-to-templates-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = 'template.html';
    });
  }
  
  // Add experience button
  const addExpBtn = document.getElementById('add-experience');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', addExperienceEntry);
  }
  
  // Add education button
  const addEduBtn = document.getElementById('add-education');
  if (addEduBtn) {
    addEduBtn.addEventListener('click', addEducationEntry);
  }
  
  // Save resume button
  const saveBtn = document.getElementById('save-resume');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveResume);
  }
  
  // Load resume button
  const loadBtn = document.getElementById('load-resume');
  if (loadBtn) {
    loadBtn.addEventListener('click', showResumesList);
  }
  
  // Export to PDF button
  const exportBtn = document.getElementById('export-pdf');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportResumeToPDF);
  }
}

/**
 * Check if there's an existing resume ID in the URL parameters
 */
function checkForExistingResume() {
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('id');
  
  if (resumeId) {
    loadResumeById(resumeId);
  } else {
    // Add empty experience and education entries for new resume
    addExperienceEntry();
    addEducationEntry();
  }
}

/**
 * Get default text for preview elements
 */
function getDefaultText(previewId) {
  const defaults = {
    'preview-name': 'Your Name',
    'preview-title': 'Job Title',
    'preview-email': 'email@example.com',
    'preview-phone': '(123) 456-7890',
    'preview-location': 'City, State',
    'preview-summary': 'A brief summary of your professional background and career goals...'
  };
  
  return defaults[previewId] || '';
}

/**
 * Update all dynamic preview sections
 */
function updateAllPreviews() {
  updateExperiencePreview();
  updateEducationPreview();
  updateSkillsPreview();
}

/**
 * Add a new experience entry to the form
 */
function addExperienceEntry() {
  const container = document.getElementById('experience-container');
  if (!container) return;
  
  // Create experience entry template
  const template = document.getElementById('experience-entry-template');
  if (!template) {
    console.error('Experience entry template not found');
    return;
  }
  
  // Clone the template
  const clone = document.importNode(template.content, true);
  
  // Add event listeners to inputs
  clone.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', updateExperiencePreview);
  });
  
  // Add event listener to remove button
  const removeBtn = clone.querySelector('.btn-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', function(e) {
      const entry = e.target.closest('.experience-entry');
      if (entry && entry.parentNode) {
        entry.parentNode.removeChild(entry);
        updateExperiencePreview();
      }
    });
  }
  
  // Add event listener to AI assist button
  const aiAssistBtn = clone.querySelector('.ai-assist');
  if (aiAssistBtn) {
    aiAssistBtn.addEventListener('click', handleAIAssist);
  }
  
  // Add the new entry to the container
  container.appendChild(clone);
  
  // Update the preview
  updateExperiencePreview();
}

/**
 * Add a new education entry to the form
 */
function addEducationEntry() {
  const container = document.getElementById('education-container');
  if (!container) return;
  
  // Create education entry template
  const template = document.getElementById('education-entry-template');
  if (!template) {
    console.error('Education entry template not found');
    return;
  }
  
  // Clone the template
  const clone = document.importNode(template.content, true);
  
  // Add event listeners to inputs
  clone.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', updateEducationPreview);
  });
  
  // Add event listener to remove button
  const removeBtn = clone.querySelector('.btn-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', function(e) {
      const entry = e.target.closest('.education-entry');
      if (entry && entry.parentNode) {
        entry.parentNode.removeChild(entry);
        updateEducationPreview();
      }
    });
  }
  
  // Add the new entry to the container
  container.appendChild(clone);
  
  // Update the preview
  updateEducationPreview();
}

/**
 * Update the experience section in the preview
 */
function updateExperiencePreview() {
  const previewContainer = document.getElementById('preview-experience');
  if (!previewContainer) return;
  
  const entries = document.querySelectorAll('.experience-entry');
  
  // If there are no entries, show placeholder text
  if (entries.length === 0) {
    previewContainer.innerHTML = '<p class="empty-section">Your work experience will appear here...</p>';
    return;
  }
  
  let html = '';
  
  // Iterate through experience entries and build HTML
  entries.forEach(entry => {
    const jobTitle = entry.querySelector('.exp-title')?.value || '';
    const company = entry.querySelector('.exp-company')?.value || '';
    const startDate = entry.querySelector('.exp-start')?.value || '';
    const endDate = entry.querySelector('.exp-end')?.value || '';
    const description = entry.querySelector('.exp-description')?.value || '';
    
    if (jobTitle || company || description) {
      html += `
        <div class="experience-item">
          <div class="job-title">${escapeHtml(jobTitle || 'Position Title')}</div>
          <div class="company-dates">
            <span class="company">${escapeHtml(company || 'Company')}</span>
            ${startDate || endDate ? `<span class="dates">${escapeHtml(startDate || '')} - ${escapeHtml(endDate || '')}</span>` : ''}
          </div>
          ${description ? `<div class="job-description">${formatDescription(description)}</div>` : ''}
        </div>
      `;
    }
  });
  
  // Update the preview container
  previewContainer.innerHTML = html || '<p class="empty-section">Your work experience will appear here...</p>';
}

/**
 * Update the education section in the preview
 */
function updateEducationPreview() {
  const previewContainer = document.getElementById('preview-education');
  if (!previewContainer) return;
  
  const entries = document.querySelectorAll('.education-entry');
  
  // If there are no entries, show placeholder text
  if (entries.length === 0) {
    previewContainer.innerHTML = '<p class="empty-section">Your education will appear here...</p>';
    return;
  }
  
  let html = '';
  
  // Iterate through education entries and build HTML
  entries.forEach(entry => {
    const degree = entry.querySelector('.edu-degree')?.value || '';
    const institution = entry.querySelector('.edu-institution')?.value || '';
    const startYear = entry.querySelector('.edu-start')?.value || '';
    const endYear = entry.querySelector('.edu-end')?.value || '';
    const description = entry.querySelector('.edu-description')?.value || '';
    
    if (degree || institution) {
      html += `
        <div class="education-item">
          <div class="degree">${escapeHtml(degree || 'Degree')}</div>
          <div class="institution-years">
            <span class="institution">${escapeHtml(institution || 'Institution')}</span>
            ${startYear || endYear ? `<span class="years">${escapeHtml(startYear || '')} - ${escapeHtml(endYear || '')}</span>` : ''}
          </div>
          ${description ? `<div class="education-description">${formatDescription(description)}</div>` : ''}
        </div>
      `;
    }
  });
  
  // Update the preview container
  previewContainer.innerHTML = html || '<p class="empty-section">Your education will appear here...</p>';
}

/**
 * Update the skills section in the preview
 */
function updateSkillsPreview() {
  const skillsInput = document.getElementById('skills-text');
  const previewContainer = document.getElementById('preview-skills');
  
  if (!skillsInput || !previewContainer) return;
  
  const skillsText = skillsInput.value.trim();
  
  // If there are no skills, show placeholder text
  if (!skillsText) {
    previewContainer.innerHTML = '<p class="empty-section">Your skills will appear here...</p>';
    return;
  }
  
  // Split by commas and filter out empty entries
  const skills = skillsText.split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
  
  if (skills.length === 0) {
    previewContainer.innerHTML = '<p class="empty-section">Your skills will appear here...</p>';
    return;
  }
  
  // Create skill tags
  let html = skills.map(skill => 
    `<span class="skill-tag">${escapeHtml(skill)}</span>`
  ).join(' ');
  
  // Update the preview container
  previewContainer.innerHTML = html;
}

/**
 * Format description text with proper paragraph breaks
 */
function formatDescription(text) {
  if (!text) return '';
  
  return escapeHtml(text)
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `<p>${line}</p>`)
    .join('');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Handle AI assist button clicks
 */
function handleAIAssist(event) {
  const button = event.currentTarget;
  const textarea = button.closest('.textarea-container')?.querySelector('textarea');
  
  if (!textarea) {
    console.error('No textarea found for AI assist');
    return;
  }
  
  // Save original button text
  const originalText = button.textContent;
  button.textContent = 'Generating...';
  button.disabled = true;
  
  // Determine context type
  let context = 'summary';
  if (textarea.classList.contains('exp-description')) {
    context = 'experience';
  } else if (textarea.id === 'skills-text') {
    context = 'skills';
  }
  
  // Create prompt based on content or use default prompt
  const prompt = textarea.value || getDefaultPrompt(context, textarea);
  
  // Call the AI service
  callAIService(prompt, context)
    .then(result => {
      // Update textarea with result
      textarea.value = result;
      
      // Trigger input event to update preview
      textarea.dispatchEvent(new Event('input'));
      
      // Show success state
      button.textContent = 'Done!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    })
    .catch(error => {
      console.error('AI assist error:', error);
      button.textContent = 'Error';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
      
      // Show error message
      showToast('Failed to generate content. Please try again.', 'error');
    });
}

/**
 * Get default prompt based on context
 */
function getDefaultPrompt(context, textarea) {
  // Get relevant data from form
  const fullName = document.getElementById('full-name')?.value || '';
  const jobTitle = document.getElementById('job-title')?.value || '';
  
  // For experience sections, get company and position
  let company = '';
  let position = '';
  
  if (context === 'experience') {
    const entryContainer = textarea.closest('.experience-entry');
    if (entryContainer) {
      position = entryContainer.querySelector('.exp-title')?.value || '';
      company = entryContainer.querySelector('.exp-company')?.value || '';
    }
  }
  
  // Default prompts by context
  const prompts = {
    summary: `Write a professional summary for ${fullName || 'a candidate'} seeking a ${jobTitle || 'professional'} position. Focus on strengths, experience, and value proposition. Keep it to 3-4 sentences.`,
    experience: `Write 3-4 bullet points for a ${position || 'professional'} role at ${company || 'a company'}. Include achievements with metrics where possible and use action verbs.`,
    skills: `List 8-12 relevant technical and soft skills for a ${jobTitle || 'professional'} position, separated by commas.`
  };
  
  return prompts[context] || prompts.summary;
}

/**
 * Call the AI service API
 */
async function callAIService(prompt, context) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch('/api/ai/assist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, context })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'AI service error');
  }
  
  const data = await response.json();
  return data.result;
}

/**
 * Save or update the resume
 */
async function saveResume() {
  try {
    // Check authentication
    if (!checkAuthentication()) return;
    
    // Get save button for status updates
    const saveButton = document.getElementById('save-resume');
    if (saveButton) {
      const originalText = saveButton.textContent;
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
    }
    
    // Collect resume data
    const resumeData = collectResumeData();
    
    // Validate basic data
    if (!resumeData.personalInfo.fullName) {
      showToast('Please enter your full name', 'error');
      
      if (saveButton) {
        saveButton.textContent = 'Save';
        saveButton.disabled = false;
      }
      
      return;
    }
    
    // Check if updating existing resume or creating new one
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    const endpoint = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
    const method = resumeId ? 'PUT' : 'POST';
    
    // Make API call
    const token = localStorage.getItem('token');
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resumeData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save resume');
    }
    
    const data = await response.json();
    
    // Show success message
    showToast('Resume saved successfully!', 'success');
    
    // Update URL if new resume was created
    if (!resumeId && data.data && data.data._id) {
      window.history.replaceState(null, '', `?id=${data.data._id}`);
    }
    
    // Reset button
    if (saveButton) {
      saveButton.textContent = 'Saved!';
      setTimeout(() => {
        saveButton.textContent = 'Save Resume';
        saveButton.disabled = false;
      }, 2000);
    }
    
  } catch (error) {
    console.error('Save error:', error);
    showToast(error.message || 'Failed to save resume', 'error');
    
    const saveButton = document.getElementById('save-resume');
    if (saveButton) {
      saveButton.textContent = 'Save Resume';
      saveButton.disabled = false;
    }
  }
}

/**
 * Collect all resume data from the form
 */
function collectResumeData() {
  return {
    personalInfo: {
      fullName: document.getElementById('full-name')?.value || '',
      jobTitle: document.getElementById('job-title')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      location: document.getElementById('location')?.value || ''
    },
    summary: document.getElementById('summary-text')?.value || '',
    experience: collectExperienceData(),
    education: collectEducationData(),
    skills: (document.getElementById('skills-text')?.value || '')
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
  };
}

/**
 * Collect experience data from form
 */
function collectExperienceData() {
  const experiences = [];
  const entries = document.querySelectorAll('.experience-entry');
  
  entries.forEach(entry => {
    const jobTitle = entry.querySelector('.exp-title')?.value || '';
    const company = entry.querySelector('.exp-company')?.value || '';
    const startDate = entry.querySelector('.exp-start')?.value || '';
    const endDate = entry.querySelector('.exp-end')?.value || '';
    const description = entry.querySelector('.exp-description')?.value || '';
    
    // Only add if essential fields have values
    if (jobTitle || company) {
      experiences.push({
        jobTitle,
        company,
        startDate,
        endDate,
        description
      });
    }
  });
  
  return experiences;
}

/**
 * Collect education data from form
 */
function collectEducationData() {
  const educations = [];
  const entries = document.querySelectorAll('.education-entry');
  
  entries.forEach(entry => {
    const degree = entry.querySelector('.edu-degree')?.value || '';
    const institution = entry.querySelector('.edu-institution')?.value || '';
    const startYear = entry.querySelector('.edu-start')?.value || '';
    const endYear = entry.querySelector('.edu-end')?.value || '';
    const description = entry.querySelector('.edu-description')?.value || '';
    
    // Only add if essential fields have values
    if (degree || institution) {
      educations.push({
        degree,
        institution,
        startYear,
        endYear,
        description
      });
    }
  });
  
  return educations;
}

/**
 * Load resume data by ID
 */
async function loadResumeById(id) {
  try {
    // Check authentication
    if (!checkAuthentication()) return;
    
    // Show loading state
    document.body.classList.add('loading');
    
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/resumes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load resume');
    }
    
    const result = await response.json();
    
    if (!result.data) {
      throw new Error('Resume data not found');
    }
    
    // Populate form with resume data
    populateFormWithResumeData(result.data);
    
  } catch (error) {
    console.error('Load error:', error);
    showToast(error.message || 'Failed to load resume', 'error');
  } finally {
    // Remove loading state
    document.body.classList.remove('loading');
  }
}

/**
 * Populate form with resume data
 */
function populateFormWithResumeData(resume) {
  // Clear existing entries
  document.getElementById('experience-container').innerHTML = '';
  document.getElementById('education-container').innerHTML = '';
  
  // Populate personal info
  if (resume.personalInfo) {
    document.getElementById('full-name').value = resume.personalInfo.fullName || '';
    document.getElementById('job-title').value = resume.personalInfo.jobTitle || '';
    document.getElementById('email').value = resume.personalInfo.email || '';
    document.getElementById('phone').value = resume.personalInfo.phone || '';
    document.getElementById('location').value = resume.personalInfo.location || '';
  }
  
  // Populate summary
  document.getElementById('summary-text').value = resume.summary || '';
  
  // Populate experience entries
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    resume.experience.forEach(exp => {
      addExperienceEntry();
      const entries = document.querySelectorAll('.experience-entry');
      const latestEntry = entries[entries.length - 1];
      
      latestEntry.querySelector('.exp-title').value = exp.jobTitle || '';
      latestEntry.querySelector('.exp-company').value = exp.company || '';
      latestEntry.querySelector('.exp-start').value = exp.startDate || '';
      latestEntry.querySelector('.exp-end').value = exp.endDate || '';
      latestEntry.querySelector('.exp-description').value = exp.description || '';
    });
  } else {
    addExperienceEntry();
  }
  
  // Populate education entries
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    resume.education.forEach(edu => {
      addEducationEntry();
      const entries = document.querySelectorAll('.education-entry');
      const latestEntry = entries[entries.length - 1];
      
      latestEntry.querySelector('.edu-degree').value = edu.degree || '';
      latestEntry.querySelector('.edu-institution').value = edu.institution || '';
      latestEntry.querySelector('.edu-start').value = edu.startYear || '';
      latestEntry.querySelector('.edu-end').value = edu.endYear || '';
      
      const descField = latestEntry.querySelector('.edu-description');
      if (descField) {
        descField.value = edu.description || '';
      }
    });
  } else {
    addEducationEntry();
  }
  
  // Populate skills
  if (Array.isArray(resume.skills)) {
    document.getElementById('skills-text').value = resume.skills.join(', ');
  }
  
  // Update preview
  document.querySelectorAll('input, textarea').forEach(input => {
    input.dispatchEvent(new Event('input'));
  });
}

/**
 * Show list of saved resumes
 */
async function showResumesList() {
  try {
    // Check authentication
    if (!checkAuthentication()) return;
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/resumes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load resumes');
    }
    
    const result = await response.json();
    
    if (!Array.isArray(result.data)) {
      throw new Error('Invalid resume data');
    }
    
    // Show resume list in modal
    displayResumesModal(result.data);
    
  } catch (error) {
    console.error('Load resumes error:', error);
    showToast(error.message || 'Failed to load resumes', 'error');
  }
}

/**
 * Delete a resume
 */
async function deleteResume(id, modalElement) {
  try {
    // Check authentication
    if (!checkAuthentication()) return;
    
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/resumes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
    
    // Show success message
    showToast('Resume deleted successfully', 'success');
    
    // Remove modal
    if (modalElement && modalElement.parentNode) {
      document.body.removeChild(modalElement);
    }
    
    // If we're currently viewing the deleted resume, go back to templates
    const urlParams = new URLSearchParams(window.location.search);
    const currentResumeId = urlParams.get('id');
    
    if (currentResumeId === id) {
      window.location.href = 'template.html';
    } else {
      // Refresh the resumes list
      showResumesList();
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast(error.message || 'Failed to delete resume', 'error');
  }
}

/**
 * Export resume to PDF
 */
function exportResumeToPDF() {
  const resumeElement = document.querySelector('.resume');
  if (!resumeElement) {
    showToast('Resume element not found', 'error');
    return;
  }
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Please allow pop-ups to export your resume', 'error');
    return;
  }
  
  // Get the name from the resume for the title
  const name = document.getElementById('preview-name').textContent || 'Resume';
  
  // Write the HTML content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(name)}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        
        .resume {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .resume-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid #3498db;
        }
        
        .resume-header h1 {
          font-size: 28px;
          margin-bottom: 5px;
          color: #2c3e50;
        }
        
        .resume-header p {
          font-size: 18px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 14px;
          color: #666;
        }
        
        .resume-section {
          margin-bottom: 20px;
        }
        
        .resume-section h2 {
          font-size: 18px;
          color: #3498db;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        
        .job-title, .degree {
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        
        .company-dates, .institution-years {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 14px;
          color: #666;
        }
        
        .job-description p {
          margin: 5px 0;
        }
        
        .skill-tag {
          display: inline-block;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 3px 10px;
          margin: 3px;
          border-radius: 15px;
          font-size: 13px;
        }
        
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume">
        ${resumeElement.innerHTML}
      </div>
      <script>
        window.onload = function() {
          // Automatically print when loaded
          window.print();
          // Close window after printing (works in some browsers)
          window.onfocus = function() {
            setTimeout(function() {
              window.close();
            }, 500);
          };
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
  toast.textContent = message;
  
  // Style the toast
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '4px';
  toast.style.backgroundColor = type === 'error' ? '#e74c3c' : '#2ecc71';
  toast.style.color = 'white';
  toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  toast.style.zIndex = '10000';
  toast.style.minWidth = '200px';
  toast.style.textAlign = 'center';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  toast.style.opacity = '0';
  
  // Add to document
  document.body.appendChild(toast);
  
  // Trigger reflow to enable transition
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Display modal with resumes list
 */
function displayResumesModal(resumes) {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1000';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.overflow = 'auto';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.margin = '10% auto';
  modalContent.style.padding = '20px';
  modalContent.style.border = '1px solid #ddd';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '600px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  
  // Create close button
  const closeButton = document.createElement('span');
  closeButton.className = 'close-modal';
  closeButton.innerHTML = '&times;';
  closeButton.style.color = '#aaa';
  closeButton.style.float = 'right';
  closeButton.style.fontSize = '28px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  
  closeButton.addEventListener('click', function() {
    document.body.removeChild(modal);
  });
  
  // Create modal title
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Your Resumes';
  modalTitle.style.marginBottom = '20px';
  
  // Add content to modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(modalTitle);
  
  // Create resumes list
  if (resumes.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'You don\'t have any saved resumes yet.';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#666';
    modalContent.appendChild(emptyMessage);
  } else {
    const resumesList = document.createElement('ul');
    resumesList.style.listStyle = 'none';
    resumesList.style.padding = '0';
    
    resumes.forEach(resume => {
      const listItem = document.createElement('li');
      listItem.style.padding = '10px 15px';
      listItem.style.marginBottom = '10px';
      listItem.style.border = '1px solid #eee';
      listItem.style.borderRadius = '4px';
      listItem.style.display = 'flex';
      listItem.style.justifyContent = 'space-between';
      listItem.style.alignItems = 'center';
      
      // Resume info
      const resumeInfo = document.createElement('div');
      
      const resumeName = document.createElement('div');
      resumeName.textContent = resume.personalInfo?.fullName || 'Untitled Resume';
      resumeName.style.fontWeight = 'bold';
      
      const resumeDetails = document.createElement('div');
      resumeDetails.textContent = `${resume.personalInfo?.jobTitle || ''} - Last updated: ${new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}`;
      resumeDetails.style.fontSize = '0.85em';
      resumeDetails.style.color = '#666';
      
      resumeInfo.appendChild(resumeName);
      resumeInfo.appendChild(resumeDetails);
      
      // Action buttons
      const actions = document.createElement('div');
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
      editButton.className = 'btn-edit';
      editButton.style.marginRight = '10px';
      editButton.style.backgroundColor = '#3498db';
      editButton.style.color = 'white';
      editButton.style.border = 'none';
      editButton.style.padding = '5px 10px';
      editButton.style.borderRadius = '4px';
      editButton.style.cursor = 'pointer';
      
      editButton.addEventListener('click', function() {
        window.location.href = `template1.html?id=${resume._id}`;
      });
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
      deleteButton.className = 'btn-delete';
      deleteButton.style.backgroundColor = '#e74c3c';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '5px 10px';
      deleteButton.style.borderRadius = '4px';
      deleteButton.style.cursor = 'pointer';
      
      deleteButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this resume?')) {
          deleteResume(resume._id, modal);
        }
      });
      
      actions.appendChild(editButton);
      actions.appendChild(deleteButton);
      
      listItem.appendChild(resumeInfo);
      listItem.appendChild(actions);
      resumesList.appendChild(listItem);
    });
    
    modalContent.appendChild(resumesList);
  }
  
  // Add close button at bottom
  const closeButtonBottom = document.createElement('button');
  closeButtonBottom.textContent = 'Close';
  closeButtonBottom.className = 'btn-close';
  closeButtonBottom.style.marginTop = '20px';
  closeButtonBottom.style.padding = '8px 16px';
  closeButtonBottom.style.backgroundColor = '#6c757d';
  closeButtonBottom.style.color = 'white';
  closeButtonBottom.style.border = 'none';
  closeButtonBottom.style.borderRadius = '4px';
  closeButtonBottom.style.cursor = 'pointer';
  closeButtonBottom.style.float = 'right';
  
  closeButtonBottom.addEventListener('click', function() {
    document.body.removeChild(modal);
  });
  
  modalContent.appendChild(closeButtonBottom);
  
  // Add clear div to fix float
  const clearDiv = document.createElement('div');
  clearDiv.style.clear = 'both';
  modalContent.appendChild(clearDiv);
  
  // Add modal to page
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}