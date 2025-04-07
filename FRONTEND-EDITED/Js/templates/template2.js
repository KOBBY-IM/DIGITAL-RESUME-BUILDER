function updatePreview() {
  // Update text fields in the preview section
  document.getElementById("preview-name").textContent =
    document.getElementById("name").value || "Your Name";
  document.getElementById("preview-title").textContent =
    document.getElementById("title").value || "Job Title";
  document.getElementById("preview-summary").textContent =
    document.getElementById("summary").value ||
    "A brief summary about yourself.";

  // Update work experience
  const expInputs = document.querySelectorAll(
    "#experience-list .experience-item"
  );
  const previewExperience = document.getElementById("preview-experience");
  previewExperience.innerHTML = "";

  expInputs.forEach((item) => {
    const jobTitle = item.children[0].value;
    const companyYear = item.children[1].value;
    const description = item.children[2].value;

    const jobDiv = document.createElement("div");
    jobDiv.innerHTML = `<h4>${jobTitle || "Job Title"}</h4>
                            <p>${companyYear || "Company - Year"}</p>
                            <p>${description || "Job description"}</p>`;
    previewExperience.appendChild(jobDiv);
  });

  // Update LinkedIn in the preview section
  const linkedInInput = document.getElementById("linkedin").value;
  const linkedInPreview = document.getElementById("preview-linkedin");

  if (linkedInInput) {
    linkedInPreview.innerHTML = `<a href="${linkedInInput}" target="_blank">LinkedIn</a>`;
  } else {
    linkedInPreview.innerHTML = null;
  }

  // Update skills
  const skillInputs = document.querySelectorAll("#skills-list input");
  const previewSkills = document.getElementById("preview-skills");
  previewSkills.innerHTML = "";

  skillInputs.forEach((input) => {
    const skillText = input.value;
    if (skillText) {
      const skillItem = document.createElement("li");
      skillItem.textContent = skillText;
      previewSkills.appendChild(skillItem);
    }
  });
}

// Function to add new experience
function addExperience() {
  const experienceList = document.getElementById("experience-list");
  const newExperience = document.createElement("div");
  newExperience.classList.add("experience-item");

  newExperience.innerHTML = `
        <input type="text" placeholder="Job Title" oninput="updatePreview()">
        <input type="text" placeholder="Company - Year" oninput="updatePreview()">
        <textarea placeholder="Job description" oninput="updatePreview()"></textarea>
    `;

  experienceList.appendChild(newExperience);
}

// Function to add new skill
function addSkill() {
  const skillList = document.getElementById("skills-list");
  const newSkill = document.createElement("input");
  newSkill.type = "text";
  newSkill.placeholder = "New Skill";
  newSkill.oninput = updatePreview;
  skillList.appendChild(newSkill);
}

// Function to download resume as PDF
document.getElementById("download-btn").addEventListener("click", () => {
  window.print(); // Simple print-to-PDF functionality
});
