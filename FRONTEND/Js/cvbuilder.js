document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'test.html?error=auth_required&redirect=cvbuilder';
    return;
  }

  // Initialize form
  const form = document.getElementById('resumeForm');
  if (!form) {
    console.error('Resume form not found');
    return;
  }

  // Initialize preview elements
  initializePreviewElements();

  // Initialize tab navigation
  initializeTabs();

  // Initialize form and preview updates
  initializeFormListeners();

  // Initialize save and print buttons
  initializeButtons();

  // Check URL for resume ID to load
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('id');
  if (resumeId) {
    loadResumeById(resumeId);
  }
});

// Initialize preview element references
function initializePreviewElements() {
  // List of preview elements to initialize
  const previewElements = [
    'previewName', 'previewEmail', 'previewPhone', 'previewStatement',
    'previewDegree', 'previewInstitution', 'previewGraduation', 'previewGpa',
    'previewCompany', 'previewStartDate', 'previewEndDate', 'previewJobTitle',
    'previewDescription', 'previewCertName', 'previewCertOrg', 'previewCertDate',
    'previewRefName', 'previewRelationship', 'previewRefContact'
  ];
  
  // Check if all preview elements exist
  previewElements.forEach(elementId => {
    if (!document.getElementById(elementId)) {
      console.warn(`Preview element ${elementId} not found`);
    }
  });
}

// Initialize tab navigation
function initializeTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab-pane'));
  const tabLinks = Array.from(document.querySelectorAll('.tabs ul li'));
  let currentTab = 0;

  // Show initial tab
  showTab(currentTab);

  // Add event listeners for tab navigation
  document.addEventListener('click', (e) => {
    // Next button
    if (e.target.matches('.next-btn') && currentTab < tabs.length - 1) {
      // Validate current tab before proceeding
      if (validateTab(currentTab)) {
        showTab(currentTab + 1);
      }
    } 
    // Previous button
    else if (e.target.matches('.prev-btn') && currentTab > 0) {
      showTab(currentTab - 1);
    } 
    // Tab links
    else if (e.target.matches('.tabs ul li')) {
      const newIndex = tabLinks.indexOf(e.target);
      if (newIndex !== -1) {
        // Only allow direct navigation to already visited tabs
        // or the next tab in sequence
        if (newIndex <= currentTab + 1) {
          // Validate current tab if moving forward
          if (newIndex > currentTab && !validateTab(currentTab)) {
            return;
          }
          showTab(newIndex);
        }
      }
    }
  });

  // Function to show a specific tab
  function showTab(index) {
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    tabLinks.forEach((link, i) => {
      link.classList.toggle('active', i === index);
      // Mark as visited
      if (i <= index) {
        link.classList.add('visited');
      }
    });
    currentTab = index;
    
    // Show/hide previous button
    const prevBtn = document.querySelector('.prev-btn');
    if (prevBtn) {
      prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
    }
    
    // Show/hide next and submit buttons
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (nextBtn && submitBtn) {
      nextBtn.style.display = index === tabs.length - 1 ? 'none' : 'inline-block';
      submitBtn.style.display = index === tabs.length - 1 ? 'inline-block' : 'none';
    }
  }

  // Validate current tab
  function validateTab(tabIndex) {
    const tab = tabs[tabIndex];
    if (!tab) return true;
    
    const requiredInputs = tab.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('is-invalid');
        
        const errorMessage = input.dataset.errorMessage || 'This field is required';
        
        // Create or update error message
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
          errorElement = document.createElement('div');
          errorElement.className = 'invalid-feedback';
          input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = errorMessage;
      } else {
        input.classList.remove('is-invalid');
      }
    });
    
    return isValid;
  }
}

// Initialize form listeners
function initializeFormListeners() {
  const form = document.getElementById('resumeForm');
  
  // Add input event listeners to all form fields
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', updatePreview);
    
    // Clear validation errors when field is edited
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const errorElement = input.nextElementSibling;
      if (errorElement && errorElement.classList.contains('invalid-feedback')) {
        errorElement.textContent = '';
      }
    });
  });
  
  // Add event listeners for multi-section fields (education, experience, etc.)
  initializeMultiSectionListeners();
}

// Initialize listeners for multi-section fields
function initializeMultiSectionListeners() {
  // Add education section
  const addEducationBtn = document.getElementById('add-education');
  if (addEducationBtn) {
    addEducationBtn.addEventListener('click', () => {
      const container = document.getElementById('education-container');
      const template = document.getElementById('education-template');
      
      if (container && template) {
        const newSection = template.content.cloneNode(true);
        
        // Add remove button functionality
        const removeBtn = newSection.querySelector('.remove-section');
        if (removeBtn) {
          removeBtn.addEventListener('click', function(e) {
            e.target.closest('.education-section').remove();
            updatePreview();
          });
        }
        
        // Add input listeners
        newSection.querySelectorAll('input, select, textarea').forEach(input => {
          input.addEventListener('input', updatePreview);
        });
        
        container.appendChild(newSection);
        updatePreview();
      }
    });
  }
  
  // Add experience section
  const addExperienceBtn = document.getElementById('add-experience');
  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', () => {
      const container = document.getElementById('experience-container');
      const template = document.getElementById('experience-template');
      
      if (container && template) {
        const newSection = template.content.cloneNode(true);
        
        // Add remove button functionality
        const removeBtn = newSection.querySelector('.remove-section');
        if (removeBtn) {
          removeBtn.addEventListener('click', function(e) {
            e.target.closest('.experience-section').remove();
            updatePreview();
          });
        }
        
        // Add input listeners
        newSection.querySelectorAll('input, select, textarea').forEach(input => {
          input.addEventListener('input', updatePreview);
        });
        
        container.appendChild(newSection);
        updatePreview();
      }
    });
  }
  
  // Add certification section
  const addCertBtn = document.getElementById('add-certification');
  if (addCertBtn) {
    addCertBtn.addEventListener('click', () => {
      const container = document.getElementById('certifications-container');
      const template = document.getElementById('certification-template');
      
      if (container && template) {
        const newSection = template.content.cloneNode(true);
        
        // Add remove button functionality
        const removeBtn = newSection.querySelector('.remove-section');
        if (removeBtn) {
          removeBtn.addEventListener('click', function(e) {
            e.target.closest('.certification-section').remove();
            updatePreview();
          });
        }
        
        // Add input listeners
        newSection.querySelectorAll('input, select, textarea').forEach(input => {
          input.addEventListener('input', updatePreview);
        });
        
        container.appendChild(newSection);
        updatePreview();
      }
    });
  }
  
  // Add reference section
  const addRefBtn = document.getElementById('add-reference');
  if (addRefBtn) {
    addRefBtn.addEventListener('click', () => {
      const container = document.getElementById('references-container');
      const template = document.getElementById('reference-template');
      
      if (container && template) {
        const newSection = template.content.cloneNode(true);
        
        // Add remove button functionality
        const removeBtn = newSection.querySelector('.remove-section');
        if (removeBtn) {
          removeBtn.addEventListener('click', function(e) {
            e.target.closest('.reference-section').remove();
            updatePreview();
          });
        }
        
        // Add input listeners
        newSection.querySelectorAll('input, select, textarea').forEach(input => {
          input.addEventListener('input', updatePreview);
        });
        
        container.appendChild(newSection);
        updatePreview();
      }
    });
  }
  
  // Initialize existing remove buttons
  document.querySelectorAll('.remove-section').forEach(button => {
    button.addEventListener('click', function(e) {
      const section = e.target.closest('.section-item');
      if (section) {
        section.remove();
        updatePreview();
      }
    });
  });
}

// Initialize save and print buttons
function initializeButtons() {
  const form = document.getElementById('resumeForm');
  
  // Save button (form submission)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all tabs before saving
    const tabs = Array.from(document.querySelectorAll('.tab-pane'));
    let isValid = true;
    
    for (let i = 0; i < tabs.length; i++) {
      if (!validateTab(i)) {
        isValid = false;
        break;
      }
    }
    
    if (!isValid) {
      showMessage('Please fill out all required fields', 'error');
      return;
    }
    
    // Collect resume data
    const resumeData = collectResumeData();
    
    // Save resume
    await saveResume(resumeData);
  });
  
  // Print button
  const printBtn = document.getElementById('print-resume');
  if (printBtn) {
    printBtn.addEventListener('click', printResume);
  }
  
  // Home button
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', goToHome);
  }
}

// Function to validate a specific tab
function validateTab(tabIndex) {
  const tab = document.querySelectorAll('.tab-pane')[tabIndex];
  if (!tab) return true;
  
  const requiredInputs = tab.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('is-invalid');
      
      // Create error message
      let errorMsg = input.nextElementSibling;
      if (!errorMsg || !errorMsg.classList.contains('invalid-feedback')) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'invalid-feedback';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
      }
      
      errorMsg.textContent = 'This field is required';
    } else {
      input.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

// Update preview based on form input
function updatePreview() {
  const formData = new FormData(document.getElementById('resumeForm'));
  
  // Update simple preview fields
  updateSimplePreviewFields(formData);
  
  // Update complex sections
  updateEducationPreview();
  updateExperiencePreview();
  updateCertificationsPreview();
  updateReferencesPreview();
}

// Update simple preview fields
function updateSimplePreviewFields(formData) {
  // Personal info fields
  document.getElementById('previewName').textContent = formData.get('name') || 'Your Name';
  document.getElementById('previewEmail').textContent = formData.get('email') || 'email@example.com';
  document.getElementById('previewPhone').textContent = formData.get('phone') || '000-000-0000';
  document.getElementById('previewStatement').textContent = formData.get('statement') || 'Personal Statement';
}

// Update education preview
function updateEducationPreview() {
  const educationSections = document.querySelectorAll('.education-section');
  const previewDegree = document.getElementById('previewDegree');
  const previewInstitution = document.getElementById('previewInstitution');
  const previewGraduation = document.getElementById('previewGraduation');
  const previewGpa = document.getElementById('previewGpa');
  
  if (!previewDegree || !previewInstitution || !previewGraduation || !previewGpa) return;
  
  if (educationSections.length === 0) {
    previewDegree.textContent = 'Degree';
    previewInstitution.textContent = 'Institution';
    previewGraduation.textContent = 'Graduation Date';
    previewGpa.textContent = 'GPA/Grade';
    return;
  }
  
  // For simplicity, just show the first education entry in the preview
  const firstEducation = educationSections[0];
  
  previewDegree.textContent = firstEducation.querySelector('[name^="degree"]').value || 'Degree';
  previewInstitution.textContent = firstEducation.querySelector('[name^="institution"]').value || 'Institution';
  previewGraduation.textContent = firstEducation.querySelector('[name^="graduation"]').value || 'Graduation Date';
  previewGpa.textContent = firstEducation.querySelector('[name^="gpa"]').value || 'GPA/Grade';
}

// Update experience preview
function updateExperiencePreview() {
  const experienceSections = document.querySelectorAll('.experience-section');
  const previewCompany = document.getElementById('previewCompany');
  const previewStartDate = document.getElementById('previewStartDate');
  const previewEndDate = document.getElementById('previewEndDate');
  const previewJobTitle = document.getElementById('previewJobTitle');
  const previewDescription = document.getElementById('previewDescription');
  
  if (!previewCompany || !previewStartDate || !previewEndDate || !previewJobTitle || !previewDescription) return;
  
  if (experienceSections.length === 0) {
    previewCompany.textContent = 'Company';
    previewStartDate.textContent = 'Start Date';
    previewEndDate.textContent = 'End Date';
    previewJobTitle.textContent = 'Job Title';
    previewDescription.textContent = 'Description';
    return;
  }
  
  // For simplicity, just show the first experience entry in the preview
  const firstExperience = experienceSections[0];
  
  previewCompany.textContent = firstExperience.querySelector('[name^="company"]').value || 'Company';
  previewStartDate.textContent = firstExperience.querySelector('[name^="start_date"]').value || 'Start Date';
  previewEndDate.textContent = firstExperience.querySelector('[name^="end_date"]').value || 'End Date';
  previewJobTitle.textContent = firstExperience.querySelector('[name^="job_title"]').value || 'Job Title';
  previewDescription.textContent = firstExperience.querySelector('[name^="description"]').value || 'Description';
}

// Update certifications preview
function updateCertificationsPreview() {
  const certSections = document.querySelectorAll('.certification-section');
  const previewCertName = document.getElementById('previewCertName');
  const previewCertOrg = document.getElementById('previewCertOrg');
  const previewCertDate = document.getElementById('previewCertDate');
  
  if (!previewCertName || !previewCertOrg || !previewCertDate) return;
  
  if (certSections.length === 0) {
    previewCertName.textContent = 'Certification Name';
    previewCertOrg.textContent = 'Issuing Organization';
    previewCertDate.textContent = 'Date Earned';
    return;
  }
  
  // For simplicity, just show the first certification entry in the preview
  const firstCert = certSections[0];
  
  previewCertName.textContent = firstCert.querySelector('[name^="cert_name"]').value || 'Certification Name';
  previewCertOrg.textContent = firstCert.querySelector('[name^="cert_org"]').value || 'Issuing Organization';
  previewCertDate.textContent = firstCert.querySelector('[name^="cert_date"]').value || 'Date Earned';
}

// Update references preview
function updateReferencesPreview() {
  const refSections = document.querySelectorAll('.reference-section');
  const previewRefName = document.getElementById('previewRefName');
  const previewRelationship = document.getElementById('previewRelationship');
  const previewRefContact = document.getElementById('previewRefContact');
  
  if (!previewRefName || !previewRelationship || !previewRefContact) return;
  
  if (refSections.length === 0) {
    previewRefName.textContent = 'Reference Name';
    previewRelationship.textContent = 'Relationship';
    previewRefContact.textContent = 'Contact';
    return;
  }
  
  // For simplicity, just show the first reference entry in the preview
  const firstRef = refSections[0];
  
  previewRefName.textContent = firstRef.querySelector('[name^="ref_name"]').value || 'Reference Name';
  previewRelationship.textContent = firstRef.querySelector('[name^="relationship"]').value || 'Relationship';
  previewRefContact.textContent = firstRef.querySelector('[name^="ref_contact"]').value || 'Contact';
}

// Collect all resume data from form
function collectResumeData() {
  const form = document.getElementById('resumeForm');
  const formData = new FormData(form);
  
  const resumeData = {
    personalInfo: {
      fullName: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      location: formData.get('location') || '',
      jobTitle: formData.get('job_title') || ''
    },
    summary: formData.get('statement') || '',
    education: collectEducationData(),
    experience: collectExperienceData(),
    certifications: collectCertificationData(),
    references: collectReferenceData(),
    skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : []
  };
  
  return resumeData;
}

// Collect education data from form
function collectEducationData() {
  const educationSections = document.querySelectorAll('.education-section');
  const education = [];
  
  educationSections.forEach((section, index) => {
    const degree = section.querySelector('[name^="degree"]').value;
    const institution = section.querySelector('[name^="institution"]').value;
    
    // Only add if at least degree or institution is provided
    if (degree || institution) {
      education.push({
        degree,
        institution,
        graduation: section.querySelector('[name^="graduation"]').value || '',
        gpa: section.querySelector('[name^="gpa"]').value || ''
      });
    }
  });
  
  return education;
}

// Collect experience data from form
function collectExperienceData() {
  const experienceSections = document.querySelectorAll('.experience-section');
  const experience = [];
  
  experienceSections.forEach((section, index) => {
    const company = section.querySelector('[name^="company"]').value;
    const jobTitle = section.querySelector('[name^="job_title"]').value;
    
    // Only add if at least company or job title is provided
    if (company || jobTitle) {
      experience.push({
        company,
        jobTitle,
        startDate: section.querySelector('[name^="start_date"]').value || '',
        endDate: section.querySelector('[name^="end_date"]').value || '',
        description: section.querySelector('[name^="description"]').value || ''
      });
    }
  });
  
  return experience;
}

// Collect certification data from form
function collectCertificationData() {
  const certSections = document.querySelectorAll('.certification-section');
  const certifications = [];
  
  certSections.forEach((section, index) => {
    const certName = section.querySelector('[name^="cert_name"]').value;
    const certOrg = section.querySelector('[name^="cert_org"]').value;
    
    // Only add if at least certification name or organization is provided
    if (certName || certOrg) {
      certifications.push({
        certName,
        certOrg,
        certDate: section.querySelector('[name^="cert_date"]').value || ''
      });
    }
  });
  
  return certifications;
}

// Collect reference data from form
function collectReferenceData() {
  const refSections = document.querySelectorAll('.reference-section');
  const references = [];
  
  refSections.forEach((section, index) => {
    const refName = section.querySelector('[name^="ref_name"]').value;
    const relationship = section.querySelector('[name^="relationship"]').value;
    
    // Only add if at least reference name or relationship is provided
    if (refName || relationship) {
      references.push({
        refName,
        relationship,
        refContact: section.querySelector('[name^="ref_contact"]').value || ''
      });
    }
  });
  
  return references;
}

// Save resume to the server
async function saveResume(resumeData) {
  const saveButton = document.querySelector('button[type="submit"]');
  if (!saveButton) return;
  
  // Save original button text
  const originalText = saveButton.textContent;
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...';
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You are not logged in. Please log in to save your resume.');
    }
    
    // Determine if this is a new resume or an existing one
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
    const method = resumeId ? 'PUT' : 'POST';
    
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
    showMessage('Resume saved successfully!', 'success');
    
    // If this was a new resume, update URL with ID
    if (!resumeId && data.data && data.data._id) {
      window.history.replaceState(null, '', `?id=${data.data._id}`);
    }
    
    // Return to dashboard after successful save (optional)
    setTimeout(() => {
      window.location.href = 'loginindex.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error saving resume:', error);
    showMessage(error.message || 'An error occurred while saving', 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = originalText;
  }
}

// Load a resume by ID
async function loadResumeById(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You are not logged in. Please log in to load your resume.');
    }
    
    // Show loading indicator
    document.body.classList.add('loading');
    
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
      throw new Error('Resume data not found');
    }
    
    // Populate form with resume data
    populateFormWithResumeData(data.data);
    
  } catch (error) {
    console.error('Error loading resume:', error);
    showMessage(error.message, 'error');
  } finally {
    // Hide loading indicator
    document.body.classList.remove('loading');
  }
}

// Populate form with resume data
function populateFormWithResumeData(resume) {
  const form = document.getElementById('resumeForm');
  
  // Personal info
  if (resume.personalInfo) {
    form.querySelector('[name="name"]').value = resume.personalInfo.fullName || '';
    form.querySelector('[name="email"]').value = resume.personalInfo.email || '';
    form.querySelector('[name="phone"]').value = resume.personalInfo.phone || '';
    
    // Optional fields that might not exist
    const locationField = form.querySelector('[name="location"]');
    if (locationField) locationField.value = resume.personalInfo.location || '';
    
    const jobTitleField = form.querySelector('[name="job_title"]');
    if (jobTitleField) jobTitleField.value = resume.personalInfo.jobTitle || '';
  }
  
  // Summary/Statement
  const statementField = form.querySelector('[name="statement"]');
  if (statementField) statementField.value = resume.summary || '';
  
  // Skills
  const skillsField = form.querySelector('[name="skills"]');
  if (skillsField && Array.isArray(resume.skills)) {
    skillsField.value = resume.skills.join(', ');
  }
  
  // Education
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    populateMultiSectionData('education', resume.education);
  }
  
  // Experience
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    populateMultiSectionData('experience', resume.experience);
  }
  
  // Certifications
  if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    populateMultiSectionData('certification', resume.certifications);
  }
  
  // References
  if (Array.isArray(resume.references) && resume.references.length > 0) {
    populateMultiSectionData('reference', resume.references);
  }
  
  // Update preview
  updatePreview();
}

// Populate multi-section data (education, experience, etc.)
function populateMultiSectionData(sectionType, items) {
  // Clear existing sections except the first one
  const container = document.getElementById(`${sectionType}s-container`) || 
                    document.getElementById(`${sectionType}-container`);
  
  if (!container) return;
  
  // Remove existing sections
  const existingSections = container.querySelectorAll(`.${sectionType}-section`);
  existingSections.forEach((section, index) => {
    if (index > 0) section.remove();
  });
  
  // If we have the first section, populate it
  const firstSection = container.querySelector(`.${sectionType}-section`);
  
  // Add button IDs
  const addBtnMap = {
    'education': 'add-education',
    'experience': 'add-experience',
    'certification': 'add-certification',
    'reference': 'add-reference'
  };
  
  // Field mapping for each section type
  const fieldMappings = {
    'education': {
      'degree': 'degree',
      'institution': 'institution',
      'graduation': 'graduation',
      'gpa': 'gpa'
    },
    'experience': {
      'company': 'company',
      'jobTitle': 'job_title',
      'startDate': 'start_date',
      'endDate': 'end_date',
      'description': 'description'
    },
    'certification': {
      'certName': 'cert_name',
      'certOrg': 'cert_org',
      'certDate': 'cert_date'
    },
    'reference': {
      'refName': 'ref_name',
      'relationship': 'relationship',
      'refContact': 'ref_contact'
    }
  };
  
  // Get field mapping for this section type
  const fieldMap = fieldMappings[sectionType];
  if (!fieldMap) return;
  
  // Add first item to the first section
  if (firstSection && items[0]) {
    for (const [dataKey, formKey] of Object.entries(fieldMap)) {
      const input = firstSection.querySelector(`[name^="${formKey}"]`);
      if (input) input.value = items[0][dataKey] || '';
    }
  }
  
  // Add additional items
  const addBtn = document.getElementById(addBtnMap[sectionType]);
  
  for (let i = 1; i < items.length; i++) {
    // Simulate click on add button to create a new section
    if (addBtn) addBtn.click();
    
    // Get the newly created section
    const newSection = container.querySelector(`.${sectionType}-section:last-child`);
    
    if (newSection) {
      // Populate the new section
      for (const [dataKey, formKey] of Object.entries(fieldMap)) {
        const input = newSection.querySelector(`[name^="${formKey}"]`);
        if (input) input.value = items[i][dataKey] || '';
      }
    }
  }
}

// Print resume
function printResume() {
  const previewSection = document.querySelector('.preview-section');
  if (!previewSection) return;
  
  const printWindow = window.open('', '_blank');
  
  // Create a clean version of the resume for printing
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume - ${document.getElementById('previewName').textContent}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .resume {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          margin-top: 0;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-title {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="resume">
        ${previewSection.innerHTML}
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    // Close after printing
    printWindow.onafterprint = () => printWindow.close();
  }, 500);
}

// Navigate to home page
function goToHome() {
  window.location.href = "loginindex.html"; 
}

// Show message to user
function showMessage(message, type = 'info') {
  const messageContainer = document.createElement('div');
  messageContainer.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
  messageContainer.textContent = message;
  messageContainer.style.position = 'fixed';
  messageContainer.style.top = '20px';
  messageContainer.style.left = '50%';
  messageContainer.style.transform = 'translateX(-50%)';
  messageContainer.style.zIndex = '9999';
  messageContainer.style.padding = '10px 20px';
  messageContainer.style.borderRadius = '5px';
  
  document.body.appendChild(messageContainer);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    messageContainer.style.opacity = '0';
    messageContainer.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      document.body.removeChild(messageContainer);
    }, 500);
  }, 3000);
}