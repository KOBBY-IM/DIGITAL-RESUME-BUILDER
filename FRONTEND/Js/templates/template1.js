document.addEventListener("DOMContentLoaded", () => {
  // Initialize the form with live updates
  initFormListeners();

  // Initialize buttons for adding experience and education
  initAddButtons();

  // Initialize print functionality
  initPrintButton();
});

function initFormListeners() {
  // Add event listeners to all input and textarea elements
  const formElements = document.querySelectorAll("input, textarea");

  formElements.forEach((element) => {
    element.addEventListener("input", function () {
      // If the element has a data-preview attribute, update that element
      const previewId = this.getAttribute("data-preview");
      if (previewId) {
        updatePreviewElement(previewId, this.value);
      }

      // For experience and education sections, update the preview
      if (
        this.classList.contains("exp-title") ||
        this.classList.contains("exp-company") ||
        this.classList.contains("exp-start") ||
        this.classList.contains("exp-end") ||
        this.classList.contains("exp-description")
      ) {
        updateExperiencePreview();
      }

      if (
        this.classList.contains("edu-degree") ||
        this.classList.contains("edu-institution") ||
        this.classList.contains("edu-start") ||
        this.classList.contains("edu-end")
      ) {
        updateEducationPreview();
      }

      // For skills, format them as tags
      if (this.id === "skills") {
        updateSkillsPreview(this.value);
      }
    });
  });
}

function updatePreviewElement(previewId, value) {
  const previewElement = document.getElementById(previewId);
  if (previewElement) {
    previewElement.textContent = value || getPlaceholderText(previewId);
  }
}

function getPlaceholderText(elementId) {
  const placeholders = {
    "preview-name": "Your Name",
    "preview-title": "Job Title",
    "preview-email": "email@example.com",
    "preview-phone": "(123) 456-7890",
    "preview-location": "City, State",
    "preview-summary":
      "A brief summary of your professional background and career goals...",
    "preview-skills": "Your skills will appear here...",
  };

  return placeholders[elementId] || "";
}

function updateExperiencePreview() {
  const experienceEntries = document.querySelectorAll(".experience-entry");
  const previewExperience = document.getElementById("preview-experience");

  if (experienceEntries.length === 0) {
    previewExperience.innerHTML =
      '<p class="empty-section">Your work experience will appear here...</p>';
    return;
  }

  let html = "";

  experienceEntries.forEach((entry) => {
    const title = entry.querySelector(".exp-title").value || "Job Title";
    const company = entry.querySelector(".exp-company").value || "Company";
    const startDate = entry.querySelector(".exp-start").value || "Start Date";
    const endDate = entry.querySelector(".exp-end").value || "End Date";
    const description =
      entry.querySelector(".exp-description").value || "Job description...";

    html += `
      <div class="experience-item">
        <h3>${title}</h3>
        <div class="company">${company}</div>
        <div class="dates">${startDate} - ${endDate}</div>
        <p>${description}</p>
      </div>
    `;
  });

  previewExperience.innerHTML = html;
}

function updateEducationPreview() {
  const educationEntries = document.querySelectorAll(".education-entry");
  const previewEducation = document.getElementById("preview-education");

  if (educationEntries.length === 0) {
    previewEducation.innerHTML =
      '<p class="empty-section">Your education will appear here...</p>';
    return;
  }

  let html = "";

  educationEntries.forEach((entry) => {
    const degree = entry.querySelector(".edu-degree").value || "Degree";
    const institution =
      entry.querySelector(".edu-institution").value || "Institution";
    const startYear = entry.querySelector(".edu-start").value || "Start Year";
    const endYear = entry.querySelector(".edu-end").value || "End Year";

    html += `
      <div class="education-item">
        <h3>${degree}</h3>
        <div class="institution">${institution}</div>
        <div class="dates">${startYear} - ${endYear}</div>
      </div>
    `;
  });

  previewEducation.innerHTML = html;
}

function updateSkillsPreview(skillsText) {
  const previewSkills = document.getElementById("preview-skills");

  if (!skillsText.trim()) {
    previewSkills.innerHTML = "Your skills will appear here...";
    return;
  }

  const skills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill);

  if (skills.length === 0) {
    previewSkills.innerHTML = "Your skills will appear here...";
    return;
  }

  let html = '<div class="skills-list">';
  skills.forEach((skill) => {
    html += `<span class="skill-tag">${skill}</span>`;
  });
  html += "</div>";

  previewSkills.innerHTML = html;
}

function initAddButtons() {
  // Add Experience Button
  const addExperienceBtn = document.getElementById("add-experience");
  addExperienceBtn.addEventListener("click", () => {
    const container = document.getElementById("experience-container");
    const newEntry = document.createElement("div");
    newEntry.className = "experience-entry";
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
      <button class="btn-remove">Remove</button>
    `;

    // Add remove button styling
    const removeBtn = newEntry.querySelector(".btn-remove");
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "1rem";
    removeBtn.style.right = "1rem";
    removeBtn.style.background = "transparent";
    removeBtn.style.border = "none";
    removeBtn.style.color = "#ff3860";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "0.9rem";

    removeBtn.addEventListener("click", () => {
      container.removeChild(newEntry);
      updateExperiencePreview();
    });

    container.appendChild(newEntry);

    // Add event listeners to new inputs
    const newInputs = newEntry.querySelectorAll("input, textarea");
    newInputs.forEach((input) => {
      input.addEventListener("input", updateExperiencePreview);
    });
  });

  // Add Education Button
  const addEducationBtn = document.getElementById("add-education");
  addEducationBtn.addEventListener("click", () => {
    const container = document.getElementById("education-container");
    const newEntry = document.createElement("div");
    newEntry.className = "education-entry";
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
      <button class="btn-remove">Remove</button>
    `;

    // Add remove button styling
    const removeBtn = newEntry.querySelector(".btn-remove");
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "1rem";
    removeBtn.style.right = "1rem";
    removeBtn.style.background = "transparent";
    removeBtn.style.border = "none";
    removeBtn.style.color = "#ff3860";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "0.9rem";

    removeBtn.addEventListener("click", () => {
      container.removeChild(newEntry);
      updateEducationPreview();
    });

    container.appendChild(newEntry);

    // Add event listeners to new inputs
    const newInputs = newEntry.querySelectorAll("input");
    newInputs.forEach((input) => {
      input.addEventListener("input", updateEducationPreview);
    });
  });
}

function initPrintButton() {
  const printBtn = document.getElementById("print-resume");
  printBtn.addEventListener("click", () => {
    window.print();
  });
}
