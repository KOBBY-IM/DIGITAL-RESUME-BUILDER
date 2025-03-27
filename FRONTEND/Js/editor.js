document.addEventListener('DOMContentLoaded', function() {
  // Initialize form elements
  const form = document.querySelector('.editor');
  const addExperienceBtn = document.getElementById('add-experience');
  const addEducationBtn = document.getElementById('add-education');
  const printBtn = document.getElementById('print-resume');
  const saveBtn = document.getElementById('save-resume');
  const loadBtn = document.getElementById('load-resume');

  // Initialize preview elements
  const previewName = document.getElementById('preview-name');
  const previewTitle = document.getElementById('preview-title');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewLocation = document.getElementById('preview-location');
  const previewSummary = document.getElementById('preview-summary');
  const previewExperience = document.getElementById('preview-experience');
  const previewEducation = document.getElementById('preview-education');
  const previewSkills = document.getElementById('preview-skills');

  // Check if required elements exist
  if (!form) {
    console.error('Editor form not found');
    return;
  }

  // Initialize form listeners
  initializeFormListeners();

  // Check authentication
  checkAuthentication();

  // Load resume if ID is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('id');
  if (resumeId) {
    loadResumeById(resumeId);
  }

  // Initialize form listeners
  function initializeFormListeners() {
    // Add input listeners to all form elements with data-preview attribute
    document.querySelectorAll('[data-preview]').forEach(input => {
      input.addEventListener('input', updatePreviewFromInput);
    });
    
    // Add listeners to other inputs that need special handling
    document.querySelectorAll('input, textarea').forEach(input => {
      if (!input.hasAttribute('data-preview')) {
        input.addEventListener('input', updateAllPreviews);
      }
    });

    // Add experience button
    if (addExperienceBtn) {
      addExperienceBtn.addEventListener('click', addExperienceEntry);
    }

    // Add education button
    if (addEducationBtn) {
      addEducationBtn.addEventListener('click', addEducationEntry);
    }

    // Print button
    if (printBtn) {
      printBtn.addEventListener('click', printResume);
    }

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener('click', saveResume);
    }

    // Load button
    if (loadBtn) {
      loadBtn.addEventListener('click', loadResumes);
    }
  }

  // Update preview from an input with data-preview attribute
  function updatePreviewFromInput(event) {
    const input = event.target;
    const previewId = input.getAttribute('data-preview');
    if (!previewId) return;

    const previewElement = document.getElementById(previewId);
    if (!previewElement) return;

    previewElement.textContent = input.value || getDefaultText(previewId);
  }

  // Get default placeholder text for preview elements
  function getDefaultText(previewId) {
    const defaults = {
      'preview-name': 'Your Name',
      'preview-title': 'Job Title',
      'preview-email': 'email@example.com',
      'preview-phone': '(123) 456-7890',
      'preview-location': 'City, State',
      'preview-summary': 'A brief summary of your professional background and career goals...',
      'preview-skills': 'Your skills will appear here...'
    };
    
    return defaults[previewId] || '';
  }

  // Update all preview sections
  function updateAllPreviews() {
    updateExperiencePreview();
    updateEducationPreview();
    updateSkillsPreview();
  }

  // Add a new experience entry
  function addExperienceEntry() {
    const container = document.getElementById('experience-container');
    if (!container) return;
    
    const newEntry = document.createElement('div');
    newEntry.className = 'experience-entry';
    
    newEntry.innerHTML = `
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="exp-title" placeholder="e.g. Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" class="exp-company" placeholder="e.g. Tech Company Inc.">
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Start Date</label>
          <input type="text" class="exp-start" placeholder="e.g. Jan 2020">
        </div>
        <div class="form-group half">
          <label>End Date</label>
          <input type="text" class="exp-end" placeholder="e.g. Present">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="exp-description" placeholder="Describe your responsibilities and achievements" rows="3"></textarea>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;
    
    // Add remove button functionality
    const removeBtn = newEntry.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        container.removeChild(newEntry);
        updateExperiencePreview();
      });
    }
    
    // Add input listeners
    newEntry.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', updateExperiencePreview);
    });
    
    container.appendChild(newEntry);
    updateExperiencePreview();
  }

  // Add a new education entry
  function addEducationEntry() {
    const container = document.getElementById('education-container');
    if (!container) return;
    
    const newEntry = document.createElement('div');
    newEntry.className = 'education-entry';
    
    newEntry.innerHTML = `
      <div class="form-group">
        <label>Degree</label>
        <input type="text" class="edu-degree" placeholder="e.g. Bachelor of Science">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" class="edu-institution" placeholder="e.g. University Name">
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Start Year</label>
          <input type="text" class="edu-start" placeholder="e.g. 2016">
        </div>
        <div class="form-group half">
          <label>End Year</label>
          <input type="text" class="edu-end" placeholder="e.g. 2020">
        </div>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;
    
    // Add remove button functionality
    const removeBtn = newEntry.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        container.removeChild(newEntry);
        updateEducationPreview();
      });
    }
    
    // Add input listeners
    newEntry.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', updateEducationPreview);
    });
    
    container.appendChild(newEntry);
    updateEducationPreview();
  }

  // Update experience section in preview
  function updateExperiencePreview() {
    if (!previewExperience) return;
    
    const experienceEntries = document.querySelectorAll('.experience-entry');
    
    if (experienceEntries.length === 0) {
      previewExperience.innerHTML = '<p class="empty-section">Your work experience will appear here...</p>';
      return;
    }
    
    let html = '';
    
    experienceEntries.forEach(entry => {
      const title = entry.querySelector('.exp-title').value.trim();
      const company = entry.querySelector('.exp-company').value.trim();
      const startDate = entry.querySelector('.exp-start').value.trim();
      const endDate = entry.querySelector('.exp-end').value.trim();
      const description = entry.querySelector('.exp-description').value.trim();
      
      if (title || company || description) {
        html += `
          <div class="job">
            <h3>${escapeHtml(title)}</h3>
            <div class="job-info">
              <span class="company">${escapeHtml(company)}</span>
              ${startDate || endDate ? `<span class="dates">${escapeHtml(startDate)} - ${escapeHtml(endDate)}</span>` : ''}
            </div>
            ${description ? `<p class="description">${formatDescription(description)}</p>` : ''}
          </div>
        `;
      }
    });
    
    previewExperience.innerHTML = html || '<p class="empty-section">Your work experience will appear here...</p>';
  }

  // Format description with line breaks
  function formatDescription(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  // Update education section in preview
  function updateEducationPreview() {
    if (!previewEducation) return;
    
    const educationEntries = document.querySelectorAll('.education-entry');
    
    if (educationEntries.length === 0) {
      previewEducation.innerHTML = '<p class="empty-section">Your education will appear here...</p>';
      return;
    }
    
    let html = '';
    
    educationEntries.forEach(entry => {
      const degree = entry.querySelector('.edu-degree').value.trim();
      const institution = entry.querySelector('.edu-institution').value.trim();
      const startYear = entry.querySelector('.edu-start').value.trim();
      const endYear = entry.querySelector('.edu-end').value.trim();
      
      if (degree || institution) {
        html += `
          <div class="education">
            <h3>${escapeHtml(degree)}</h3>
            <div class="education-info">
              <span class="institution">${escapeHtml(institution)}</span>
              ${startYear || endYear ? `<span class="years">${escapeHtml(startYear)} - ${escapeHtml(endYear)}</span>` : ''}
            </div>
          </div>
        `;
      }
    });
    
    previewEducation.innerHTML = html || '<p class="empty-section">Your education will appear here...</p>';
  }

  // Update skills section in preview
  function updateSkillsPreview() {
    const skillsInput = document.getElementById('skills');
    if (!skillsInput || !previewSkills) return;
    
    const skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    
    if (skills.length === 0) {
      previewSkills.textContent = 'Your skills will appear here...';
      return;
    }
    
    previewSkills.innerHTML = skills.map(skill => `<span class="skill">${escapeHtml(skill)}</span>`).join(' ');
  }

  // Print resume
  function printResume() {
    const resumeElement = document.getElementById('resume');
    if (!resumeElement) return;
    
    const printWindow = window.open('', '_blank');
    
    // Get relevant CSS styles (this is simplified, may need adjustments)
    let styles = '';
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      styles += `<link rel="stylesheet" href="${link.href}">`;
    });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${previewName.textContent}</title>
        ${styles}
        <style>
          body { padding: 20px; }
          @media print {
            body { padding: 0; }
            .resume { box-shadow: none; }
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
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  }

  // Save resume
  async function saveResume() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save your resume');
      window.location.href = 'test.html';
      return;
    }
    
    const resumeData = collectResumeData();
    
    try {
      // If we have a resume ID, update existing resume
      const method = resumeId ? 'PUT' : 'POST';
      const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
      
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
      
      alert(data.message || 'Resume saved successfully!');
      
      // If this was a new resume, update URL with ID
      if (!resumeId && data.data && data.data._id) {
        window.history.replaceState(null, '', `?id=${data.data._id}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(error.message || 'Failed to save resume');
    }
  }

  // Collect all resume data from form
  function collectResumeData() {
    return {
      personalInfo: {
        fullName: document.getElementById('full-name')?.value.trim() || '',
        jobTitle: document.getElementById('job-title')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        location: document.getElementById('location')?.value.trim() || ''
      },
      summary: document.getElementById('summary')?.value.trim() || '',
      experience: collectExperienceData(),
      education: collectEducationData(),
      skills: document.getElementById('skills')?.value.split(',').map(s => s.trim()).filter(Boolean) || []
    };
  }

  // Collect experience data
  function collectExperienceData() {
    const entries = [];
    document.querySelectorAll('.experience-entry').forEach(entry => {
      entries.push({
        jobTitle: entry.querySelector('.exp-title')?.value.trim() || '',
        company: entry.querySelector('.exp-company')?.value.trim() || '',
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
      entries.push({
        degree: entry.querySelector('.edu-degree')?.value.trim() || '',
        institution: entry.querySelector('.edu-institution')?.value.trim() || '',
        startYear: entry.querySelector('.edu-start')?.value.trim() || '',
        endYear: entry.querySelector('.edu-end')?.value.trim() || ''
      });
    });
    return entries;
  }

  // Load resumes list
  async function loadResumes() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to load your resumes');
      window.location.href = 'test.html';
      return;
    }
    
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load resumes');
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
      
      showResumeListModal(data.data);
    } catch (error) {
      console.error('Load error:', error);
      alert(error.message || 'Failed to load resumes');
    }
  }

  // Show resume list in modal
  function showResumeListModal(resumes) {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('resume-list-modal');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'resume-list-modal';
      modalContainer.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      const closeBtn = document.createElement('span');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => modalContainer.style.display = 'none';
      
      const title = document.createElement('h3');
      title.textContent = 'Your Resumes';
      
      const listContainer = document.createElement('div');
      listContainer.id = 'resume-list';
      
      modalContent.appendChild(closeBtn);
      modalContent.appendChild(title);
      modalContent.appendChild(listContainer);
      modalContainer.appendChild(modalContent);
      
      document.body.appendChild(modalContainer);
    }
    
    const listContainer = document.getElementById('resume-list');
    if (!listContainer) return;
    
    if (resumes.length === 0) {
      listContainer.innerHTML = '<p>No resumes found. Create your first resume!</p>';
    } else {
      const list = document.createElement('ul');
      
      resumes.forEach(resume => {
        const item = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = `editor.html?id=${resume._id}`;
        link.textContent = resume.personalInfo?.fullName || 'Untitled Resume';
        if (resume.personalInfo?.jobTitle) {
          link.textContent += ` - ${resume.personalInfo.jobTitle}`;
        }
        
        item.appendChild(link);
        list.appendChild(item);
      });
      
      listContainer.innerHTML = '';
      listContainer.appendChild(list);
    }
    
    modalContainer.style.display = 'block';
  }

  // Load a specific resume by ID
  async function loadResumeById(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to load your resume');
      window.location.href = 'test.html';
      return;
    }
    
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load resume');
      }
      
      const data = await response.json();
      
      if (!data.data) {
        throw new Error('Invalid response format');
      }
      
      populateFormWithResumeData(data.data);
    } catch (error) {
      console.error('Load error:', error);
      alert(error.message || 'Failed to load resume');
    }
  }

  // Populate form with resume data
  function populateFormWithResumeData(resume) {
    // Personal info
    if (resume.personalInfo) {
      document.getElementById('full-name').value = resume.personalInfo.fullName || '';
      document.getElementById('job-title').value = resume.personalInfo.jobTitle || '';
      document.getElementById('email').value = resume.personalInfo.email || '';
      document.getElementById('phone').value = resume.personalInfo.phone || '';
      document.getElementById('location').value = resume.personalInfo.location || '';
    }
    
    // Summary
    document.getElementById('summary').value = resume.summary || '';
    
    // Experience
    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
      const container = document.getElementById('experience-container');
      
      // Clear all existing entries
      const existingEntries = container.querySelectorAll('.experience-entry');
      existingEntries.forEach(entry => {
        if (entry !== existingEntries[0]) { // Keep first entry
          container.removeChild(entry);
        }
      });
      
      // Update first entry with first experience item
      const firstEntry = container.querySelector('.experience-entry');
      if (firstEntry && resume.experience[0]) {
        firstEntry.querySelector('.exp-title').value = resume.experience[0].jobTitle || '';
        firstEntry.querySelector('.exp-company').value = resume.experience[0].company || '';
        firstEntry.querySelector('.exp-start').value = resume.experience[0].startDate || '';
        firstEntry.querySelector('.exp-end').value = resume.experience[0].endDate || '';
        firstEntry.querySelector('.exp-description').value = resume.experience[0].description || '';
      }
      
      // Add additional entries
      for (let i = 1; i < resume.experience.length; i++) {
        const experienceEntry = resume.experience[i];
        
        const newEntry = document.createElement('div');
        newEntry.className = 'experience-entry';
        
        newEntry.innerHTML = `
          <div class="form-group">
            <label>Job Title</label>
            <input type="text" class="exp-title" placeholder="e.g. Software Engineer" value="${escapeHtml(experienceEntry.jobTitle || '')}">
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" class="exp-company" placeholder="e.g. Tech Company Inc." value="${escapeHtml(experienceEntry.company || '')}">
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>Start Date</label>
              <input type="text" class="exp-start" placeholder="e.g. Jan 2020" value="${escapeHtml(experienceEntry.startDate || '')}">
            </div>
            <div class="form-group half">
              <label>End Date</label>
              <input type="text" class="exp-end" placeholder="e.g. Present" value="${escapeHtml(experienceEntry.endDate || '')}">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="exp-description" placeholder="Describe your responsibilities and achievements" rows="3">${escapeHtml(experienceEntry.description || '')}</textarea>
          </div>
          <button type="button" class="btn-remove">Remove</button>
        `;
        
        // Add remove button functionality
        const removeBtn = newEntry.querySelector('.btn-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', function() {
            container.removeChild(newEntry);
            updateExperiencePreview();
          });
        }
        
        // Add input listeners
        newEntry.querySelectorAll('input, textarea').forEach(input => {
          input.addEventListener('input', updateExperiencePreview);
        });
        
        container.appendChild(newEntry);
      }
    }
    
    // Education
    if (Array.isArray(resume.education) && resume.education.length > 0) {
      const container = document.getElementById('education-container');
      
      // Clear all existing entries
      const existingEntries = container.querySelectorAll('.education-entry');
      existingEntries.forEach(entry => {
        if (entry !== existingEntries[0]) { // Keep first entry
          container.removeChild(entry);
        }
      });
      
      // Update first entry with first education item
      const firstEntry = container.querySelector('.education-entry');
      if (firstEntry && resume.education[0]) {
        firstEntry.querySelector('.edu-degree').value = resume.education[0].degree || '';
        firstEntry.querySelector('.edu-institution').value = resume.education[0].institution || '';
        firstEntry.querySelector('.edu-start').value = resume.education[0].startYear || '';
        firstEntry.querySelector('.edu-end').value = resume.education[0].endYear || '';
      }
      
      // Add additional entries
      for (let i = 1; i < resume.education.length; i++) {
        const educationEntry = resume.education[i];
        
        const newEntry = document.createElement('div');
        newEntry.className = 'education-entry';
        
        newEntry.innerHTML = `
          <div class="form-group">
            <label>Degree</label>
            <input type="text" class="edu-degree" placeholder="e.g. Bachelor of Science" value="${escapeHtml(educationEntry.degree || '')}">
          </div>
          <div class="form-group">
            <label>Institution</label>
            <input type="text" class="edu-institution" placeholder="e.g. University Name" value="${escapeHtml(educationEntry.institution || '')}">
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>Start Year</label>
              <input type="text" class="edu-start" placeholder="e.g. 2016" value="${escapeHtml(educationEntry.startYear || '')}">
            </div>
            <div class="form-group half">
              <label>End Year</label>
              <input type="text" class="edu-end" placeholder="e.g. 2020" value="${escapeHtml(educationEntry.endYear || '')}">
            </div>
          </div>
          <button type="button" class="btn-remove">Remove</button>
        `;
        
        // Add remove button functionality
        const removeBtn = newEntry.querySelector('.btn-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', function() {
            container.removeChild(newEntry);
            updateEducationPreview();
          });
        }
        
        // Add input listeners
        newEntry.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', updateEducationPreview);
        });
        
        container.appendChild(newEntry);
      }
    }
    
    // Skills
    if (Array.isArray(resume.skills)) {
      document.getElementById('skills').value = resume.skills.join(', ');
    }
    
    // Update all previews
    document.querySelectorAll('input, textarea').forEach(input => {
      input.dispatchEvent(new Event('input'));
    });
    updateAllPreviews();
  }

  // Check authentication status
  function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if not authenticated
      window.location.href = 'test.html?redirect=editor';
    }
  }

  // Utility function to escape HTML
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