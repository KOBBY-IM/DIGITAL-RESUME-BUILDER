document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin();
      return;
    }
  
    // Initialize UI elements
    const saveButton = document.getElementById('save-resume');
    const loadButton = document.getElementById('load-resume');
    const printButton = document.getElementById('print-resume');
    
    // Check if we're in edit mode (has resumeId in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    if (resumeId) {
      // Load existing resume data
      loadResumeById(resumeId);
      
      // Update save button text
      if (saveButton) {
        saveButton.textContent = 'Update Resume';
      }
    }
    
    // Attach event listeners
    if (saveButton) {
      saveButton.addEventListener('click', saveResume);
    }
    
    if (loadButton) {
      loadButton.addEventListener('click', loadResumes);
    }
    
    if (printButton) {
      printButton.addEventListener('click', printResume);
    }
    
    // Setup AI buttons if they exist
    setupAIButtons();
  });
  
  // Redirect to login page
  function redirectToLogin() {
    window.location.href = 'test.html?error=auth_required';
  }
  
  // Set up AI assistance buttons
  function setupAIButtons() {
    const aiButtons = document.querySelectorAll('.button-ai');
    
    aiButtons.forEach(button => {
      button.addEventListener('click', handleAIAssist);
    });
  }
  
  // Handle AI assistance requests
  async function handleAIAssist(event) {
    const button = event.target;
    const textarea = button.previousElementSibling;
    if (!textarea) return;
    
    const originalButtonText = button.textContent;
    button.disabled = true;
    button.textContent = 'Generating...';
    
    try {
      // Determine context type
      let context = 'summary';
      if (textarea.classList.contains('exp-description')) {
        context = 'experience';
      } else if (textarea.id === 'skills') {
        context = 'skills';
      }
      
      // Get prompt content - current text or default placeholder
      const prompt = textarea.value || getDefaultPrompt(context, textarea);
      
      // Call AI service
      const result = await callAIService(prompt, context);
      
      // Update textarea with result
      textarea.value = result;
      
      // Trigger input event to update preview
      textarea.dispatchEvent(new Event('input'));
      
      // Success feedback
      button.textContent = '✓ Done';
      setTimeout(() => {
        button.textContent = originalButtonText;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('AI error:', error);
      button.textContent = 'Error';
      setTimeout(() => {
        button.textContent = originalButtonText;
        button.disabled = false;
      }, 2000);
    }
  }
  
  // Get default prompts based on context
  function getDefaultPrompt(context, element) {
    // Generate prompts based on other form fields
    const fullName = document.getElementById('full-name')?.value || '';
    const jobTitle = document.getElementById('job-title')?.value || '';
    
    // Add nearby form elements if available
    let company = '';
    let position = '';
    
    if (element.classList.contains('exp-description')) {
      const entryDiv = element.closest('.experience-entry');
      if (entryDiv) {
        company = entryDiv.querySelector('.exp-company')?.value || '';
        position = entryDiv.querySelector('.exp-title')?.value || '';
      }
    }
    
    const prompts = {
      summary: `Write a professional summary for ${fullName || 'a candidate'} seeking a ${jobTitle || 'professional'} position. Focus on strengths, experience, and value proposition.`,
      experience: `Write 3-4 bullet points for a ${position || 'professional'} role at ${company || 'a company'}. Highlight achievements, skills, and quantifiable results.`,
      skills: `List relevant technical and soft skills for a ${jobTitle || 'professional'} position, separated by commas.`
    };
    
    return prompts[context] || prompts.summary;
  }
  
  // Call AI service API
  async function callAIService(prompt, context) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
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
    } catch (error) {
      console.error('AI service error:', error);
      throw error;
    }
  }
  
  // Collect all resume data from form
  function collectResumeData() {
    return {
      personalInfo: {
        fullName: getInputValue('full-name'),
        jobTitle: getInputValue('job-title'),
        email: getInputValue('email'),
        phone: getInputValue('phone'),
        location: getInputValue('location')
      },
      summary: getInputValue('summary'),
      experience: collectExperienceData(),
      education: collectEducationData(),
      skills: getInputValue('skills').split(',').map(s => s.trim()).filter(Boolean)
    };
  }
  
  // Helper function to safely get input value
  function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  }
  
  // Collect work experience data
  function collectExperienceData() {
    const entries = [];
    document.querySelectorAll('.experience-entry').forEach(entry => {
      const jobTitle = entry.querySelector('.exp-title')?.value.trim();
      const company = entry.querySelector('.exp-company')?.value.trim();
      
      // Skip if both job title and company are empty
      if (!jobTitle && !company) return;
      
      entries.push({
        jobTitle: jobTitle || '',
        company: company || '',
        startDate: entry.querySelector('.exp-start')?.value.trim() || '',
        endDate: entry.querySelector('.exp-end')?.value.trim() || '',
        description: entry.querySelector('.exp-description')?.value.trim() || ''
      });
    });
    
    return entries;
  }
  
  // Collect education data
  function collectEducationData() {
    const entries = [];
    document.querySelectorAll('.education-entry').forEach(entry => {
      const degree = entry.querySelector('.edu-degree')?.value.trim();
      const institution = entry.querySelector('.edu-institution')?.value.trim();
      
      // Skip if both degree and institution are empty
      if (!degree && !institution) return;
      
      entries.push({
        degree: degree || '',
        institution: institution || '',
        startYear: entry.querySelector('.edu-start')?.value.trim() || '',
        endYear: entry.querySelector('.edu-end')?.value.trim() || ''
      });
    });
    
    return entries;
  }
  
  // Save or update resume
  async function saveResume() {
    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin();
      return;
    }
  
    const saveButton = document.getElementById('save-resume');
    if (!saveButton) return;
    
    // Get original button text
    const originalText = saveButton.textContent;
    
    // Show loading state
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
  
    try {
      const resumeData = collectResumeData();
      
      // Validate minimum data
      if (!resumeData.personalInfo.fullName) {
        throw new Error('Full name is required');
      }
      
      // Check if we're updating an existing resume
      const urlParams = new URLSearchParams(window.location.search);
      const resumeId = urlParams.get('id');
      
      let url = '/api/resumes';
      let method = 'POST';
      
      // If resumeId exists, use PUT to update
      if (resumeId) {
        url = `/api/resumes/${resumeId}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
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
      showMessage(data.message || 'Resume saved successfully!', 'success');
      
      // Update URL if this was a new resume
      if (!resumeId && data.data && data.data._id) {
        window.history.replaceState(null, '', `${window.location.pathname}?id=${data.data._id}`);
        
        // Update button text
        saveButton.textContent = 'Update Resume';
      } else {
        // Restore original button text for updates
        setTimeout(() => {
          saveButton.textContent = originalText;
        }, 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage(error.message || 'Failed to save resume', 'error');
    } finally {
      saveButton.disabled = false;
    }
  }
  
  // Load list of resumes
  async function loadResumes() {
    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin();
      return;
    }
  
    try {
      const loadButton = document.getElementById('load-resume');
      if (loadButton) {
        loadButton.disabled = true;
        loadButton.textContent = 'Loading...';
      }
      
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to load resumes');
      }
  
      const data = await response.json();
      const resumes = data.data || [];
      
      showResumeList(resumes);
    } catch (error) {
      console.error('Load error:', error);
      showMessage(error.message || 'Failed to load resumes', 'error');
    } finally {
      const loadButton = document.getElementById('load-resume');
      if (loadButton) {
        loadButton.disabled = false;
        loadButton.textContent = 'Load Resume';
      }
    }
  }
  
  // Load a specific resume by ID
  async function loadResumeById(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin();
      return;
    }
  
    try {
      // Show loading state
      document.body.classList.add('loading');
      
      const response = await fetch(`/api/resumes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to load resume');
      }
  
      const { data } = await response.json();
      
      if (!data) {
        throw new Error('Resume data not found');
      }
      
      // Populate form with resume data
      populateFormWithResumeData(data);
    } catch (error) {
      console.error('Load resume error:', error);
      showMessage(error.message || 'Failed to load resume', 'error');
    } finally {
      // Remove loading state
      document.body.classList.remove('loading');
    }
  }
  
  // Display list of resumes in a modal
  function showResumeList(resumes) {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('resume-list-modal');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'resume-list-modal';
      modalContainer.className = 'modal fade';
      modalContainer.tabIndex = '-1';
      modalContainer.setAttribute('aria-labelledby', 'resumeListModalLabel');
      modalContainer.setAttribute('aria-hidden', 'true');
      
      modalContainer.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="resumeListModalLabel">Your Resumes</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="resume-list-content"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modalContainer);
    }
    
    const listContainer = document.getElementById('resume-list-content');
    
    if (resumes.length === 0) {
      listContainer.innerHTML = '<p>No resumes found. Create your first resume!</p>';
    } else {
      const list = document.createElement('ul');
      list.className = 'list-group';
      
      resumes.forEach(resume => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const link = document.createElement('a');
        link.href = `${window.location.pathname}?id=${resume._id}`;
        link.textContent = `${resume.personalInfo?.fullName || 'Untitled'} - ${resume.personalInfo?.jobTitle || 'No title'}`;
        
        const lastUpdated = document.createElement('small');
        lastUpdated.className = 'text-muted';
        lastUpdated.textContent = new Date(resume.lastUpdated || resume.createdAt).toLocaleDateString();
        
        item.appendChild(link);
        item.appendChild(lastUpdated);
        list.appendChild(item);
      });
      
      listContainer.innerHTML = '';
      listContainer.appendChild(list);
    }
    
    const modal = new bootstrap.Modal(modalContainer);
    modal.show();
  }
  
  // Populate form with resume data
  function populateFormWithResumeData(resume) {
    // Fill in personal info
    if (resume.personalInfo) {
      setInputValue('full-name', resume.personalInfo.fullName);
      setInputValue('job-title', resume.personalInfo.jobTitle);
      setInputValue('email', resume.personalInfo.email);
      setInputValue('phone', resume.personalInfo.phone);
      setInputValue('location', resume.personalInfo.location);
    }
    
    // Fill in summary
    setInputValue('summary', resume.summary);
    
    // Fill in experience
    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
      const container = document.getElementById('experience-container');
      if (container) {
        // Clear existing entries except the first one
        while (container.children.length > 1) {
          container.removeChild(container.lastChild);
        }
        
        // Update the first entry
        const firstEntry = container.querySelector('.experience-entry');
        if (firstEntry) {
          const firstExperience = resume.experience[0];
          firstEntry.querySelector('.exp-title').value = firstExperience.jobTitle || '';
          firstEntry.querySelector('.exp-company').value = firstExperience.company || '';
          firstEntry.querySelector('.exp-start').value = firstExperience.startDate || '';
          firstEntry.querySelector('.exp-end').value = firstExperience.endDate || '';
          firstEntry.querySelector('.exp-description').value = firstExperience.description || '';
        }
        
        // Add additional entries
        for (let i = 1; i < resume.experience.length; i++) {
          const exp = resume.experience[i];
          addExperienceEntry(exp);
        }
      }
    }
    
    // Fill in education
    if (Array.isArray(resume.education) && resume.education.length > 0) {
      const container = document.getElementById('education-container');
      if (container) {
        // Clear existing entries except the first one
        while (container.children.length > 1) {
          container.removeChild(container.lastChild);
        }
        
        // Update the first entry
        const firstEntry = container.querySelector('.education-entry');
        if (firstEntry) {
          const firstEducation = resume.education[0];
          firstEntry.querySelector('.edu-degree').value = firstEducation.degree || '';
          firstEntry.querySelector('.edu-institution').value = firstEducation.institution || '';
          firstEntry.querySelector('.edu-start').value = firstEducation.startYear || '';
          firstEntry.querySelector('.edu-end').value = firstEducation.endYear || '';
        }
        
        // Add additional entries
        for (let i = 1; i < resume.education.length; i++) {
          const edu = resume.education[i];
          addEducationEntry(edu);
        }
      }
    }
    
    // Fill in skills
    if (Array.isArray(resume.skills)) {
      setInputValue('skills', resume.skills.join(', '));
    }
    
    // Update preview
    document.querySelectorAll('input, textarea').forEach(element => {
      element.dispatchEvent(new Event('input'));
    });
  }
  
  // Add a new experience entry with data
  function addExperienceEntry(data = {}) {
    const container = document.getElementById('experience-container');
    if (!container) return;
    
    const newEntry = document.createElement('div');
    newEntry.className = 'experience-entry';
    
    newEntry.innerHTML = `
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="exp-title" placeholder="e.g. Software Engineer" value="${escapeHtml(data.jobTitle || '')}">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" class="exp-company" placeholder="e.g. Tech Company Inc." value="${escapeHtml(data.company || '')}">
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Start Date</label>
          <input type="text" class="exp-start" placeholder="e.g. Jan 2020" value="${escapeHtml(data.startDate || '')}">
        </div>
        <div class="form-group half">
          <label>End Date</label>
          <input type="text" class="exp-end" placeholder="e.g. Present" value="${escapeHtml(data.endDate || '')}">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <div class="textarea-container">
          <textarea class="exp-description" placeholder="Describe your responsibilities and achievements" rows="3">${escapeHtml(data.description || '')}</textarea>
          <button class="button-ai" role="button">AI Assist</button>
        </div>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;
    
    // Setup remove button
    const removeButton = newEntry.querySelector('.btn-remove');
    if (removeButton) {
      removeButton.addEventListener('click', () => {
        container.removeChild(newEntry);
        updatePreview();
      });
    }
    
    // Setup AI button
    const aiButton = newEntry.querySelector('.button-ai');
    if (aiButton) {
      aiButton.addEventListener('click', handleAIAssist);
    }
    
    // Setup input event listeners
    newEntry.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', updatePreview);
    });
    
    container.appendChild(newEntry);
  }
  
  // Add a new education entry with data
  function addEducationEntry(data = {}) {
    const container = document.getElementById('education-container');
    if (!container) return;
    
    const newEntry = document.createElement('div');
    newEntry.className = 'education-entry';
    
    newEntry.innerHTML = `
      <div class="form-group">
        <label>Degree</label>
        <input type="text" class="edu-degree" placeholder="e.g. Bachelor of Science" value="${escapeHtml(data.degree || '')}">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" class="edu-institution" placeholder="e.g. University Name" value="${escapeHtml(data.institution || '')}">
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Start Year</label>
          <input type="text" class="edu-start" placeholder="e.g. 2016" value="${escapeHtml(data.startYear || '')}">
        </div>
        <div class="form-group half">
          <label>End Year</label>
          <input type="text" class="edu-end" placeholder="e.g. 2020" value="${escapeHtml(data.endYear || '')}">
        </div>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;
    
    // Setup remove button
    const removeButton = newEntry.querySelector('.btn-remove');
    if (removeButton) {
      removeButton.addEventListener('click', () => {
        container.removeChild(newEntry);
        updatePreview();
      });
    }
    
    // Setup input event listeners
    newEntry.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', updatePreview);
    });
    
    container.appendChild(newEntry);
  }
  
  // Handle print functionality
  function printResume() {
    const resumeElement = document.getElementById('resume');
    if (!resumeElement) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get resume styles
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Skip external stylesheets that may cause CORS issues
          return '';
        }
      })
      .join('\n');
    
    // Create print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${document.getElementById('preview-name').textContent}</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 20px; }
            .resume { box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        ${resumeElement.outerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for styles to load before printing
    setTimeout(() => {
      printWindow.print();
      // Close window after print (some browsers)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 500);
  }
  
  // Update the resume preview
  function updatePreview() {
    // This is a placeholder - actual implementation depends on your specific resume structure
    // You could define this function more fully or it may be imported from another module
    updatePersonalInfo();
    updateExperience();
    updateEducation();
    updateSkills();
  }
  
  // Update personal info in the preview
  function updatePersonalInfo() {
    setText('preview-name', 'full-name');
    setText('preview-title', 'job-title');
    setText('preview-email', 'email');
    setText('preview-phone', 'phone');
    setText('preview-location', 'location');
    setText('preview-summary', 'summary');
  }
  
  // Update experience section in the preview
  function updateExperience() {
    const container = document.getElementById('preview-experience');
    if (!container) return;
    
    const entries = document.querySelectorAll('.experience-entry');
    
    if (entries.length === 0) {
      container.innerHTML = '<p class="empty-section">Your work experience will appear here...</p>';
      return;
    }
    
    let html = '';
    
    entries.forEach(entry => {
      const jobTitle = entry.querySelector('.exp-title')?.value || '';
      const company = entry.querySelector('.exp-company')?.value || '';
      const startDate = entry.querySelector('.exp-start')?.value || '';
      const endDate = entry.querySelector('.exp-end')?.value || '';
      const description = entry.querySelector('.exp-description')?.value || '';
      
      if (jobTitle || company || description) {
        html += `
          <div class="experience-item">
            <div class="job-title">${escapeHtml(jobTitle)}</div>
            <div class="job-company">${escapeHtml(company)} <span class="job-dates">${escapeHtml(startDate)} - ${escapeHtml(endDate)}</span></div>
            <p class="job-description">${formatDescription(description)}</p>
          </div>
        `;
      }
    });
    
    container.innerHTML = html || '<p class="empty-section">Your work experience will appear here...</p>';
  }
  
  // Format job description text with bullet points
  function formatDescription(text) {
    if (!text) return '';
    
    // Convert line breaks to bullet points
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => `<li>${escapeHtml(line)}</li>`)
      .join('');
  }
  
  // Update education section in the preview
  function updateEducation() {
    const container = document.getElementById('preview-education');
    if (!container) return;
    
    const entries = document.querySelectorAll('.education-entry');
    
    if (entries.length === 0) {
      container.innerHTML = '<p class="empty-section">Your education will appear here...</p>';
      return;
    }
    
    let html = '';
    
    entries.forEach(entry => {
      const degree = entry.querySelector('.edu-degree')?.value || '';
      const institution = entry.querySelector('.edu-institution')?.value || '';
      const startYear = entry.querySelector('.edu-start')?.value || '';
      const endYear = entry.querySelector('.edu-end')?.value || '';
      
      if (degree || institution) {
        html += `
          <div class="education-item">
            <div class="education-degree">${escapeHtml(degree)}</div>
            <div class="education-institution">${escapeHtml(institution)} <span class="education-years">${escapeHtml(startYear)} - ${escapeHtml(endYear)}</span></div>
          </div>
        `;
      }
    });
    
    container.innerHTML = html || '<p class="empty-section">Your education will appear here...</p>';
  }
  
  // Update skills section in the preview
  function updateSkills() {
    const skillsInput = document.getElementById('skills');
    const skillsPreview = document.getElementById('preview-skills');
    
    if (!skillsInput || !skillsPreview) return;
    
    const skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    
    if (skills.length === 0) {
      skillsPreview.innerHTML = 'Your skills will appear here...';
      return;
    }
    
    skillsPreview.innerHTML = skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join(' ');
  }
  
  // Helper function to set preview text from input
  function setText(previewId, inputId) {
    const previewElement = document.getElementById(previewId);
    const inputElement = document.getElementById(inputId);
    
    if (previewElement && inputElement) {
      previewElement.textContent = inputElement.value || previewElement.getAttribute('data-default') || '';
    }
  }
  
  // Helper function to set input value
  function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value || '';
    }
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // Show toast message
  function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.backgroundColor = type === 'error' ? '#f44336' : '#4CAF50';
    toast.style.color = 'white';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      
      // Remove from DOM after fade out
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }