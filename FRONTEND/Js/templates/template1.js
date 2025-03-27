// Template 1 Resume Builder Main JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "test.html?redirect=template1&error=auth_required";
    return;
  }

  // Initialize form and preview elements
  initializeFormListeners();
  setupUIComponents();

  // Check if loading an existing resume
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get("id");

  if (resumeId) {
    loadResumeById(resumeId);
  } else {
    // Add initial experience and education entries for new resume
    addExperienceEntry();
    addEducationEntry();
  }
});

/**
 * Set up form input listeners
 */
function initializeFormListeners() {
  // Listeners for inputs with direct preview mapping
  document.querySelectorAll("[data-preview]").forEach((input) => {
    input.addEventListener("input", function () {
      const previewId = this.getAttribute("data-preview");
      const previewElement = document.getElementById(previewId);

      if (previewElement) {
        previewElement.textContent = this.value || getDefaultText(previewId);
      }
    });
  });

  // Listeners for inputs without direct preview mapping
  document
    .querySelectorAll("input:not([data-preview]), textarea:not([data-preview])")
    .forEach((input) => {
      input.addEventListener("input", updateAllPreviews);
    });
}

/**
 * Set up UI components and button handlers
 */
function setupUIComponents() {
  // Back to templates button
  const backBtn = document.getElementById("back-to-templates-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "template.html";
    });
  }

  // Add experience button
  const addExpBtn = document.getElementById("add-experience");
  if (addExpBtn) {
    addExpBtn.addEventListener("click", addExperienceEntry);
  }

  // Add education button
  const addEduBtn = document.getElementById("add-education");
  if (addEduBtn) {
    addEduBtn.addEventListener("click", addEducationEntry);
  }

  // Save resume button
  const saveBtn = document.getElementById("save-resume");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveResume);
  }

  // My Resumes button - Changed from Load Resume
  const myResumesBtn = document.getElementById("my-resumes-btn");
  if (myResumesBtn) {
    myResumesBtn.addEventListener("click", () => {
      window.location.href = "my-resumes.html";
    });
  }

  // Export to PDF button
  const exportBtn = document.getElementById("export-pdf");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportResumeToPDF);
  }

  // AI Assist buttons
  document.querySelectorAll(".ai-assist").forEach((button) => {
    button.addEventListener("click", handleAIAssist);
  });
}

/**
 * Get default text for preview elements
 */
function getDefaultText(previewId) {
  const defaults = {
    "preview-name": "Your Name",
    "preview-title": "Job Title",
    "preview-email": "email@example.com",
    "preview-phone": "(123) 456-7890",
    "preview-location": "City, State",
    "preview-summary":
      "A brief summary of your professional background and career goals...",
  };

  return defaults[previewId] || "";
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
 * Initialize date inputs when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Other existing initialization code...

  // Initialize date input fields
  initializeDateInputs();

  // Update existing experience/education entries to use date formatting
  setupExistingDateFields();
});

/**
 * Setup existing date fields in the form
 */
function setupExistingDateFields() {
  // Apply date input masks to experience date fields
  document
    .querySelectorAll(
      ".experience-entry .exp-start, .experience-entry .exp-end"
    )
    .forEach((input) => {
      input.classList.add("date-input");
      setupDateInputMask(input);
    });

  // Apply date input masks to education date fields
  document
    .querySelectorAll(".education-entry .edu-start, .education-entry .edu-end")
    .forEach((input) => {
      input.classList.add("date-input");
      setupDateInputMask(input);
    });
}

/**
 * Add a new experience entry
 */
function addExperienceEntry() {
  const container = document.getElementById("experience-container");
  if (!container) return;

  // Create experience entry from template
  const template = document.getElementById("experience-entry-template");
  if (!template) {
    console.error("Experience entry template not found");
    return;
  }

  const newEntry = document
    .importNode(template.content, true)
    .querySelector(".experience-entry");

  // Add event listeners to inputs
  newEntry.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", updateExperiencePreview);
  });

  // Set up date inputs specifically
  const startDateInput = newEntry.querySelector(".exp-start");
  const endDateInput = newEntry.querySelector(".exp-end");

  if (startDateInput) {
    startDateInput.classList.add("date-input");
    startDateInput.placeholder = "MM/YYYY";
    setupDateInputMask(startDateInput);
  }

  if (endDateInput) {
    endDateInput.classList.add("date-input");
    endDateInput.placeholder = "MM/YYYY or Present";
    setupDateInputMask(endDateInput);
  }

  // Add remove button functionality
  const removeBtn = newEntry.querySelector(".btn-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      container.removeChild(newEntry);
      updateExperiencePreview();
    });
  }

  // Add AI assist button functionality
  const aiAssistBtn = newEntry.querySelector(".ai-assist");
  if (aiAssistBtn) {
    aiAssistBtn.addEventListener("click", handleAIAssist);
  }

  // Add to container
  container.appendChild(newEntry);

  // Update preview
  updateExperiencePreview();
}

/**
 * Add a new education entry
 */
function addEducationEntry() {
  const container = document.getElementById("education-container");
  if (!container) return;

  // Create education entry from template
  const template = document.getElementById("education-entry-template");
  if (!template) {
    console.error("Education entry template not found");
    return;
  }

  const newEntry = document
    .importNode(template.content, true)
    .querySelector(".education-entry");

  // Add event listeners to inputs
  newEntry.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", updateEducationPreview);
  });

   // Set up date/year inputs specifically
   const startYearInput = newEntry.querySelector('.edu-start');
   const endYearInput = newEntry.querySelector('.edu-end');
   
   if (startYearInput) {
     startYearInput.placeholder = 'YYYY or MM/YYYY';
   }
   
   if (endYearInput) {
     endYearInput.placeholder = 'YYYY or Present';
   }

  // Add remove button functionality
  const removeBtn = newEntry.querySelector(".btn-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      container.removeChild(newEntry);
      updateEducationPreview();
    });
  }

  // Add AI assist button functionality
  const aiAssistBtn = newEntry.querySelector(".ai-assist");
  if (aiAssistBtn) {
    aiAssistBtn.addEventListener("click", handleAIAssist);
  }

  // Add to container
  container.appendChild(newEntry);

  // Update preview
  updateEducationPreview();
}

/**
 * Update experience preview
 */
function updateExperiencePreview() {
  const previewContainer = document.getElementById("preview-experience");
  if (!previewContainer) {
    console.error("Preview experience container not found");
    return;
  }

  const entries = document.querySelectorAll(".experience-entry");

  // Clear or show placeholder
  if (entries.length === 0) {
    previewContainer.innerHTML =
      '<p class="empty-section">Your work experience will appear here...</p>';
    return;
  }

  // Build preview HTML
  let html = "";
  entries.forEach((entry) => {
    const jobTitle = entry.querySelector(".exp-title")?.value || "";
    const company = entry.querySelector(".exp-company")?.value || "";
    const startDate = entry.querySelector(".exp-start")?.value || "";
    const endDate = entry.querySelector(".exp-end")?.value || "";
    const description = entry.querySelector(".exp-description")?.value || "";
    const formattedStartDate = formatDateDisplay(startDate);
    const formattedEndDate = formatDateDisplay(endDate);


    if (jobTitle || company || description) {
      html += `
        <div class="experience-item">
          <div class="job-title">${escapeHtml(jobTitle)}</div>
          <div class="company-dates">
            <span class="company">${escapeHtml(company)}</span>
            ${
              startDate || endDate
                ? `<span class="dates">${escapeHtml(startDate)} - ${escapeHtml(
                    endDate
                  )}</span>`
                : ""
            }
          </div>
          ${
            description
              ? `<div class="job-description">${formatDescription(
                  description
                )}</div>`
              : ""
          }
        </div>
      `;
    }
  });

  // Update preview container
  previewContainer.innerHTML =
    html ||
    '<p class="empty-section">Your work experience will appear here...</p>';
}

/**
 * Date formatting utility function if not imported from dateUtils.js
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
 * Format input field to enforce MM/YYYY format
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

/**
 * Update education preview
 */
function updateEducationPreview() {
  const previewContainer = document.getElementById("preview-education");
  if (!previewContainer) {
    console.error("Preview education container not found");
    return;
  }

  const entries = document.querySelectorAll(".education-entry");

  // Clear or show placeholder
  if (entries.length === 0) {
    previewContainer.innerHTML =
      '<p class="empty-section">Your education will appear here...</p>';
    return;
  }

  // Build preview HTML
  let html = "";
  entries.forEach((entry) => {
    const degree = entry.querySelector(".edu-degree")?.value || "";
    const institution = entry.querySelector(".edu-institution")?.value || "";
    const startYear = entry.querySelector(".edu-start")?.value || "";
    const endYear = entry.querySelector(".edu-end")?.value || "";
    const gpa = entry.querySelector(".edu-gpa")?.value || "";
    const description = entry.querySelector(".edu-description")?.value || "";

    if (degree || institution) {
      html += `
        <div class="education-item">
          <div class="degree">${escapeHtml(degree)}</div>
          <div class="institution-years">
            <span class="institution">${escapeHtml(institution)}</span>
            ${
              startYear || endYear
                ? `<span class="years">${escapeHtml(startYear)} - ${escapeHtml(
                    endYear
                  )}</span>`
                : ""
            }
          </div>
          ${
            gpa
              ? `<div class="education-gpa">GPA: ${escapeHtml(gpa)}</div>`
              : ""
          }
          ${
            description
              ? `<div class="job-description">${formatDescriptionWithBullets(
                  description
                )}</div>`
              : ""
          }
        </div>
      `;
    }
  });

  // Update preview container
  previewContainer.innerHTML =
    html || '<p class="empty-section">Your education will appear here...</p>';
}

/**
 * Update skills preview
 */
function updateSkillsPreview() {
  const skillsInput = document.getElementById("skills-text");
  const previewContainer = document.getElementById("preview-skills");

  if (!skillsInput || !previewContainer) {
    console.error("Skills input or preview container not found");
    return;
  }

  const skillsText = skillsInput.value.trim();

  // Clear or show placeholder
  if (!skillsText) {
    previewContainer.innerHTML =
      '<p class="empty-section">Your skills will appear here...</p>';
    return;
  }

  // Create skill tags
  const skills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  if (skills.length === 0) {
    previewContainer.innerHTML =
      '<p class="empty-section">Your skills will appear here...</p>';
    return;
  }

  // Update preview
  previewContainer.innerHTML = skills
    .map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
    .join(" ");
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Utility: Format description with paragraphs
 */
function formatDescription(text) {
  if (!text) return "";

  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

/**
 * Handle AI Assist functionality
 */
function handleAIAssist(event) {
  const button = event.currentTarget;
  const textarea =
    button.closest(".textarea-container")?.querySelector("textarea") ||
    button.closest(".textarea-container")?.querySelector("input");

  if (!textarea) {
    console.error("No textarea or input found for AI assist");
    return;
  }

  // Check authentication
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Please log in to use AI assistance", "error");
    return;
  }

  // Save original button text
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  button.disabled = true;

  // Determine context type
  let context = "summary";
  if (textarea.classList.contains("exp-description")) {
    context = "experience";
  } else if (textarea.id === "skills-text") {
    context = "skills";
  } else if (textarea.classList.contains("edu-description")) {
    context = "education";
  } else if (textarea.classList.contains("custom-section-content")) {
    context = "custom";
  }

  // Create prompt based on context and form data
  const prompt = getAIPrompt(context, textarea);

  // Call AI service
  callAIService(prompt, context)
    .then((result) => {
      // Update textarea with result
      textarea.value = result;

      // Trigger input event to update preview
      textarea.dispatchEvent(new Event("input"));

      // Show success state
      button.innerHTML = '<i class="fas fa-check"></i> Done!';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 2000);
    })
    .catch((error) => {
      console.error("AI assist error:", error);
      button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 2000);

      // Show error message
      showToast("Failed to generate content. Please try again.", "error");
    });
}

/**
 * Generate AI prompt based on context
 */
function getAIPrompt(context, textarea) {
  // Get relevant information from the form
  const fullName = document.getElementById("full-name")?.value || "";
  const jobTitle = document.getElementById("job-title")?.value || "";

  // For experience sections, get more context
  let company = "";
  let position = "";

  if (context === "experience") {
    const experienceEntry = textarea.closest(".experience-entry");
    if (experienceEntry) {
      company = experienceEntry.querySelector(".exp-company")?.value || "";
      position = experienceEntry.querySelector(".exp-title")?.value || "";
    }
  }

  // For education sections, get more context
  let degree = "";
  let institution = "";

  if (context === "education") {
    const educationEntry = textarea.closest(".education-entry");
    if (educationEntry) {
      degree = educationEntry.querySelector(".edu-degree")?.value || "";
      institution =
        educationEntry.querySelector(".edu-institution")?.value || "";
    }
  }

  // Context-specific prompts
  const prompts = {
    summary: `Write a professional summary for ${
      fullName || "a candidate"
    } seeking a ${
      jobTitle || "position"
    }. Focus on key strengths, experience, and career achievements. Keep it to 3-4 sentences maximum.`,
    experience: `Write 3-4 bullet points for a ${
      position || "professional"
    } role at ${
      company || "a company"
    }. Include achievements with quantifiable results where possible. Start each bullet with a strong action verb.`,
    skills: `List relevant technical and soft skills for a ${
      jobTitle || "professional"
    } position, separated by commas. Include 8-12 skills that are most in-demand for this role.`,
    education: `Write a brief description for ${degree || "a degree"} from ${
      institution || "a university"
    }. Highlight relevant coursework, achievements, or academic projects.`,
    custom: `Write professional content for a custom resume section. Keep it concise and achievement-focused.`,
  };

  return prompts[context] || prompts.summary;
}

/**
 * AI Service implementation
 */
async function callAIService(prompt, context) {
  try {
    // Use TemplateCore for AI assistance
    return await TemplateCore.getAIAssistance(prompt, context);
  } catch (error) {
    console.error("AI service error:", error);
    throw error;
  }
}

/**
 * Save resume
 */
async function saveResume() {
  try {
    // Get save button for status updates
    const saveButton = document.getElementById("save-resume");
    if (!saveButton) return;

    // Save original button text
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveButton.disabled = true;

    // Collect resume data
    const resumeData = collectResumeData();

    // Validate basic data
    if (!resumeData.personalInfo.fullName) {
      showToast("Please enter your full name", "error");

      saveButton.innerHTML = originalText;
      saveButton.disabled = false;
      return;
    }

    // Check if updating existing resume or creating new one
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get("id");

    let result;
    if (resumeId) {
      // Update existing resume
      result = await TemplateCore.saveResume(resumeData, resumeId);
    } else {
      // Create new resume
      result = await TemplateCore.saveResume(resumeData);
    }

    // Show success message
    showToast("Resume saved successfully!", "success");

    // Update URL if new resume was created
    if (!resumeId && result.data && result.data._id) {
      window.history.replaceState(null, "", `?id=${result.data._id}`);
    }

    // Reset button
    saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
    setTimeout(() => {
      saveButton.innerHTML = originalText;
      saveButton.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Save error:", error);
    showToast(error.message || "Failed to save resume", "error");

    const saveButton = document.getElementById("save-resume");
    if (saveButton) {
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
      saveButton.disabled = false;
    }
  }
}

/**
 * Load a specific resume by ID - improved version
 */
async function loadResumeById(id) {
  // Show loading state
  document.body.classList.add("loading");
  showToast("Loading resume...", "info");

  try {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    console.log("Loading resume with ID:", id);

    // Get resume data from server
    const response = await fetch(`/api/resumes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", errorText);
      throw new Error("Failed to load resume");
    }

    const result = await response.json();
    console.log("Resume data received:", result);

    if (!result.data) {
      throw new Error("Resume data not found in server response");
    }

    // Populate form with resume data
    populateFormWithResumeData(result.data);

    showToast("Resume loaded successfully", "success");
  } catch (error) {
    console.error("Load error:", error);
    showToast(error.message || "Failed to load resume", "error");
  } finally {
    // Remove loading state
    document.body.classList.remove("loading");
  }
}

/**
 * Populate form with resume data - completely fixed version
 */
function populateFormWithResumeData(resume) {
  // For debugging - log the resume data to see what's available
  console.log("Resume data to populate:", resume);

  // Clear existing entries first
  const expContainer = document.getElementById("experience-container");
  const eduContainer = document.getElementById("education-container");
  const customSectionsContainer = document.getElementById(
    "custom-sections-container"
  );

  if (expContainer) expContainer.innerHTML = "";
  if (eduContainer) eduContainer.innerHTML = "";

  // Clear existing custom sections
  if (customSectionsContainer) {
    customSectionsContainer.innerHTML = "";
    // Add the default no sections message
    const noSectionsMsg = document.createElement("div");
    noSectionsMsg.className = "no-custom-sections";
    noSectionsMsg.innerHTML =
      "<p>Add custom sections like Certifications, Projects, Languages, etc.</p>";
    customSectionsContainer.appendChild(noSectionsMsg);
  }

  // Populate personal info - with fallbacks and better error handling
  try {
    if (resume.personalInfo) {
      // Get all form fields
      const fullNameInput = document.getElementById("full-name");
      const jobTitleInput = document.getElementById("job-title");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const locationInput = document.getElementById("location");

      // Set values with checks for each field
      if (fullNameInput)
        fullNameInput.value = resume.personalInfo.fullName || "";
      if (jobTitleInput)
        jobTitleInput.value = resume.personalInfo.jobTitle || "";
      if (emailInput) emailInput.value = resume.personalInfo.email || "";
      if (phoneInput) phoneInput.value = resume.personalInfo.phone || "";
      if (locationInput)
        locationInput.value = resume.personalInfo.location || "";

      // Log any missing fields for debugging
      if (!fullNameInput) console.warn("full-name input field not found");
      if (!jobTitleInput) console.warn("job-title input field not found");
      if (!emailInput) console.warn("email input field not found");
      if (!phoneInput) console.warn("phone input field not found");
      if (!locationInput) console.warn("location input field not found");
    }
  } catch (error) {
    console.error("Error populating personal info:", error);
  }

  // Populate summary
  try {
    const summaryInput = document.getElementById("summary-text");
    if (summaryInput) {
      summaryInput.value = resume.summary || "";
    } else {
      console.warn("summary-text input field not found");
    }
  } catch (error) {
    console.error("Error populating summary:", error);
  }

  // Populate experience entries
  try {
    if (
      Array.isArray(resume.experience) &&
      resume.experience.length > 0 &&
      expContainer
    ) {
      resume.experience.forEach((exp) => {
        addExperienceEntry();
        const entries = document.querySelectorAll(".experience-entry");
        if (entries.length === 0) {
          console.error("No experience entries found after adding");
          return;
        }

        const latestEntry = entries[entries.length - 1];

        // Set values with checks for each field
        const titleInput = latestEntry.querySelector(".exp-title");
        const companyInput = latestEntry.querySelector(".exp-company");
        const startInput = latestEntry.querySelector(".exp-start");
        const endInput = latestEntry.querySelector(".exp-end");
        const descInput = latestEntry.querySelector(".exp-description");

        if (titleInput) titleInput.value = exp.jobTitle || "";
        if (companyInput) companyInput.value = exp.company || "";
        if (startInput)
          startInput.value = exp.startDate
            ? formatDateDisplay(exp.startDate)
            : "";
        if (endInput)
          endInput.value = exp.endDate ? formatDateDisplay(exp.endDate) : "";
        if (descInput) descInput.value = exp.description || "";
      });
    } else {
      // Add default entry if no experience
      addExperienceEntry();
    }
  } catch (error) {
    console.error("Error populating experience:", error);
    // Try to add a default entry
    try {
      addExperienceEntry();
    } catch (e) {
      console.error("Error adding default experience entry:", e);
    }
  }

  // Populate education entries
  try {
    if (
      Array.isArray(resume.education) &&
      resume.education.length > 0 &&
      eduContainer
    ) {
      resume.education.forEach((edu) => {
        addEducationEntry();
        const entries = document.querySelectorAll(".education-entry");
        if (entries.length === 0) {
          console.error("No education entries found after adding");
          return;
        }

        const latestEntry = entries[entries.length - 1];

        // Set values with checks for each field
        const degreeInput = latestEntry.querySelector(".edu-degree");
        const institutionInput = latestEntry.querySelector(".edu-institution");
        const startInput = latestEntry.querySelector(".edu-start");
        const endInput = latestEntry.querySelector(".edu-end");
        const gpaInput = latestEntry.querySelector(".edu-gpa");
        const descInput = latestEntry.querySelector(".edu-description");

        if (degreeInput) degreeInput.value = edu.degree || "";
        if (institutionInput) institutionInput.value = edu.institution || "";
        if (startInput) startInput.value = edu.startYear || "";
        if (endInput) endInput.value = edu.endYear || "";
        if (gpaInput) gpaInput.value = edu.gpa || "";
        if (descInput) descInput.value = edu.description || "";
      });
    } else {
      // Add default entry if no education
      addEducationEntry();
    }
  } catch (error) {
    console.error("Error populating education:", error);
    // Try to add a default entry
    try {
      addEducationEntry();
    } catch (e) {
      console.error("Error adding default education entry:", e);
    }
  }

  // Populate skills
  try {
    const skillsInput = document.getElementById("skills-text");
    if (skillsInput && Array.isArray(resume.skills)) {
      skillsInput.value = resume.skills.join(", ");
    }
  } catch (error) {
    console.error("Error populating skills:", error);
  }

  // Populate custom sections if available
  try {
    if (
      Array.isArray(resume.customSections) &&
      resume.customSections.length > 0 &&
      customSectionsContainer
    ) {
      // Remove the no sections message
      const noSectionsMsg = customSectionsContainer.querySelector(
        ".no-custom-sections"
      );
      if (noSectionsMsg) {
        customSectionsContainer.removeChild(noSectionsMsg);
      }

      // Add each custom section
      resume.customSections.forEach((section) => {
        // Add a new empty section
        if (typeof addCustomSection === "function") {
          addCustomSection();

          // Get the latest section added
          const sections =
            customSectionsContainer.querySelectorAll(".custom-section");
          if (sections.length === 0) {
            console.error("No custom sections found after adding");
            return;
          }

          const latestSection = sections[sections.length - 1];

          // Populate the fields
          const titleInput = latestSection.querySelector(
            ".custom-section-title"
          );
          const contentInput = latestSection.querySelector(
            ".custom-section-content"
          );

          if (titleInput) titleInput.value = section.title || "";
          if (contentInput) contentInput.value = section.content || "";
        } else {
          console.error("addCustomSection function not found");
        }
      });
    }
  } catch (error) {
    console.error("Error populating custom sections:", error);
  }

  // Trigger preview updates for all inputs
  try {
    document.querySelectorAll("input, textarea").forEach((input) => {
      input.dispatchEvent(new Event("input"));
    });
  } catch (error) {
    console.error("Error triggering preview updates:", error);
  }

  // Update custom sections preview
  try {
    if (typeof updateCustomSectionsPreview === "function") {
      updateCustomSectionsPreview();
    }
  } catch (error) {
    console.error("Error updating custom sections preview:", error);
  }

  // Log completion
  console.log("Resume data population complete");
}
/**
 * Format date for display
 */
function formatDateDisplay(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if not valid date

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch (e) {
    return dateString; // Return original string if error
  }
}

/**
 * Show list of saved resumes
 */
async function showResumesList() {
  try {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please log in to load your resumes", "error");
      return;
    }

    // Make API request to get all user resumes
    const response = await fetch("/api/resumes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load resumes");
    }

    const result = await response.json();

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid resume data");
    }

    // Display resumes in a modal
    displayResumesModal(result.data);
  } catch (error) {
    console.error("Load resumes error:", error);
    showToast(error.message || "Failed to load resumes", "error");
  }
}

/**
 * Delete a resume by ID
 */
async function deleteResume(id) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`/api/resumes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete resume");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

/**
 * Display list of resumes in a modal
 */
function displayResumesModal(resumes) {
  // Create modal container
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.zIndex = "1000";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.overflow = "auto";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.margin = "10% auto";
  modalContent.style.padding = "20px";
  modalContent.style.border = "1px solid #ddd";
  modalContent.style.width = "80%";
  modalContent.style.maxWidth = "600px";
  modalContent.style.borderRadius = "8px";
  modalContent.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

  // Create close button
  const closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.style.float = "right";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Create title
  const title = document.createElement("h3");
  title.textContent = "Your Resumes";
  title.style.marginBottom = "20px";

  // Add to modal content
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);

  // Create resume list
  if (resumes.length === 0) {
    const noResumesMessage = document.createElement("p");
    noResumesMessage.textContent =
      "No resumes found. Create your first resume!";
    noResumesMessage.style.textAlign = "center";
    noResumesMessage.style.color = "#666";
    modalContent.appendChild(noResumesMessage);
  } else {
    const resumeList = document.createElement("ul");
    resumeList.style.listStyle = "none";
    resumeList.style.padding = "0";

    resumes.forEach((resume) => {
      const listItem = document.createElement("li");
      listItem.style.padding = "10px";
      listItem.style.borderBottom = "1px solid #eee";
      listItem.style.display = "flex";
      listItem.style.justifyContent = "space-between";
      listItem.style.alignItems = "center";

      const resumeInfo = document.createElement("div");
      resumeInfo.innerHTML = `
        <strong>${resume.personalInfo?.fullName || "Untitled Resume"}</strong>
        <br>
        <small>${resume.personalInfo?.jobTitle || ""}</small>
      `;

      // Action buttons container
      const actionButtons = document.createElement("div");
      actionButtons.style.display = "flex";
      actionButtons.style.gap = "8px";

      // Load button
      const loadButton = document.createElement("button");
      loadButton.textContent = "Load";
      loadButton.style.backgroundColor = "#3498db";
      loadButton.style.color = "white";
      loadButton.style.border = "none";
      loadButton.style.borderRadius = "4px";
      loadButton.style.padding = "5px 10px";
      loadButton.style.cursor = "pointer";
      loadButton.addEventListener("click", () => {
        // Load the selected resume
        window.location.href = `template1.html?id=${resume._id}`;
      });

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.backgroundColor = "#e74c3c";
      deleteButton.style.color = "white";
      deleteButton.style.border = "none";
      deleteButton.style.borderRadius = "4px";
      deleteButton.style.padding = "5px 10px";
      deleteButton.style.cursor = "pointer";
      deleteButton.addEventListener("click", async () => {
        if (
          confirm(
            `Are you sure you want to delete "${
              resume.personalInfo?.fullName || "this resume"
            }"?`
          )
        ) {
          try {
            // Disable delete button while processing
            deleteButton.disabled = true;
            deleteButton.textContent = "Deleting...";

            // Call delete API
            await deleteResume(resume._id);

            // Remove this item from the list
            resumeList.removeChild(listItem);

            // Show success message
            showToast("Resume deleted successfully", "success");

            // If no more resumes, show empty message
            if (resumeList.children.length === 0) {
              const noResumesMessage = document.createElement("p");
              noResumesMessage.textContent =
                "No resumes found. Create your first resume!";
              noResumesMessage.style.textAlign = "center";
              noResumesMessage.style.color = "#666";

              // Clear the list and append the message
              modalContent.removeChild(resumeList);
              modalContent.appendChild(noResumesMessage);
            }

            // If current resume is being viewed, redirect to templates
            const urlParams = new URLSearchParams(window.location.search);
            const currentResumeId = urlParams.get("id");
            if (currentResumeId === resume._id) {
              window.location.href = "template.html";
            }
          } catch (error) {
            showToast(error.message || "Failed to delete resume", "error");

            // Reset delete button
            deleteButton.disabled = false;
            deleteButton.textContent = "Delete";
          }
        }
      });

      // Add buttons to container
      actionButtons.appendChild(loadButton);
      actionButtons.appendChild(deleteButton);

      // Add elements to list item
      listItem.appendChild(resumeInfo);
      listItem.appendChild(actionButtons);
      resumeList.appendChild(listItem);
    });

    modalContent.appendChild(resumeList);
  }

  // Add modal to page
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Export resume to PDF
 */
function exportResumeToPDF() {
  // Get resume element
  const resumeElement = document.getElementById("resume");
  if (!resumeElement) {
    showToast("Resume element not found", "error");
    return;
  }

  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get("id");

  // If resume isn't saved yet, use client-side PDF generation
  if (!resumeId) {
    generateClientPDF();
    return;
  }

  // Otherwise, use server-side PDF generation if available
  try {
    // Collect current resume data
    const resumeData = collectResumeData();
    resumeData._id = resumeId;

    // Use TemplateCore to export PDF
    TemplateCore.exportToPDF("template1", resumeData).catch((error) => {
      console.error(
        "Server PDF export failed, falling back to client-side:",
        error
      );
      generateClientPDF();
    });
  } catch (error) {
    console.error("PDF export error:", error);
    generateClientPDF();
  }

  // Client-side PDF generation as fallback
  function generateClientPDF() {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Please allow pop-ups to export your resume", "error");
      return;
    }

    // Get the name from the resume for the title
    const name = document.getElementById("preview-name").textContent || "Resume";

    // Write the HTML content to the new window with fixes for blank pages
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${escapeHtml(name)}</title>
        <style>
          /* Base styles */
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
            /* Remove any default margins that might cause extra pages */
            background-color: white;
          }
          
          /* Remove page breaks inside elements */
          * {
            page-break-inside: avoid;
          }
          
          /* Container for the resume with controlled height */
          .resume-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            /* Explicit height calculation to prevent overflow */
            min-height: auto;
            max-height: 29.7cm; /* A4 height */
            box-sizing: border-box;
            overflow: visible;
          }
          
          .resume {
            /* No fixed height to prevent forcing page breaks */
            width: 100%;
          }
          
          .resume-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3498db;
          }
          
          .resume-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #2c3e50;
          }
          
          .resume-header p {
            font-size: 16px;
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
            margin-bottom: 15px;
          }
          
          .resume-section h2 {
            font-size: 16px;
            color: #3498db;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          
          .job-title, .degree {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
          }
          
          .company-dates, .institution-years {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 14px;
            color: #666;
          }
          
          .job-description p {
            margin: 3px 0;
          }
          
          .skill-tag {
            display: inline-block;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 2px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 12px;
          }
          
          /* Print-specific styles */
          @media print {
            body {
              width: 210mm; /* A4 width */
              height: 297mm; /* A4 height */
              margin: 0;
              padding: 0;
            }
            
            /* Force page break before specific elements if needed */
            .page-break {
              page-break-before: always;
            }
            
            /* Ensure no extra space at bottom */
            html, body {
              margin-bottom: 0;
              padding-bottom: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          ${resumeElement.innerHTML}
        </div>
        <script>
          window.onload = function() {
            // Remove any unnecessary elements that could cause extra pages
            document.querySelectorAll('footer, .page-break').forEach(elem => {
              if (elem.offsetTop > (document.body.offsetHeight - 100)) {
                elem.remove();
              }
            });
            
            // Automatically print when loaded
            setTimeout(function() {
              window.print();
              // Close window after printing (works in some browsers)
              window.onfocus = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            }, 300);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }
}


/**
 * Collect all resume data from form
 */
function collectResumeData() {
  // Collect custom sections data if the function exists
  const customSections = window.collectCustomSectionsData
    ? window.collectCustomSectionsData()
    : [];

  return {
    personalInfo: {
      fullName: document.getElementById("full-name")?.value || "",
      jobTitle: document.getElementById("job-title")?.value || "",
      email: document.getElementById("email")?.value || "",
      phone: document.getElementById("phone")?.value || "",
      location: document.getElementById("location")?.value || "",
    },
    summary: document.getElementById("summary-text")?.value || "",
    experience: collectExperienceData(),
    education: collectEducationData(),
    skills: (document.getElementById("skills-text")?.value || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0),
    customSections: customSections,
  };
}

/**
 * Collect experience data from form
 */
function collectExperienceData() {
  const experiences = [];
  const entries = document.querySelectorAll(".experience-entry");

  entries.forEach((entry) => {
    const jobTitle = entry.querySelector(".exp-title")?.value || "";
    const company = entry.querySelector(".exp-company")?.value || "";
    const startDate = entry.querySelector(".exp-start")?.value || "";
    const endDate = entry.querySelector(".exp-end")?.value || "";
    const description = entry.querySelector(".exp-description")?.value || "";

    // Only add if essential fields have values
    if (jobTitle || company) {
      experiences.push({
        company: company,
        jobTitle: jobTitle,
        startDate: startDate || null,
        endDate: endDate || null,
        description: description,
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
  const entries = document.querySelectorAll(".education-entry");

  entries.forEach((entry) => {
    const degree = entry.querySelector(".edu-degree")?.value || "";
    const institution = entry.querySelector(".edu-institution")?.value || "";
    const startYear = entry.querySelector(".edu-start")?.value || "";
    const endYear = entry.querySelector(".edu-end")?.value || "";
    const gpa = entry.querySelector(".edu-gpa")?.value || "";
    const description = entry.querySelector(".edu-description")?.value || "";

    // Only add if essential fields have values
    if (degree || institution) {
      educations.push({
        institution: institution,
        degree: degree,
        startYear: startYear || null,
        endYear: endYear || null,
        gpa: gpa || "",
        description: description || "",
      });
    }
  });

  return educations;
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${
    type === "error" ? "toast-error" : "toast-success"
  }`;
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "4px";
  toast.style.backgroundColor = type === "error" ? "#e74c3c" : "#2ecc71";
  toast.style.color = "white";
  toast.style.zIndex = "9999";
  toast.style.minWidth = "250px";
  toast.style.textAlign = "center";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
