/**
 * template2.js - JavaScript functionality for Resume Template 2
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form field elements
    const fullNameInput = document.getElementById('fullName');
    const jobTitleInput = document.getElementById('jobTitle');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const websiteInput = document.getElementById('website');
    const summaryInput = document.getElementById('summary');
    const skillsInput = document.getElementById('skillsInput');
    const addSkillBtn = document.getElementById('addSkill');
    const skillsContainer = document.getElementById('skills-container');

    // Preview elements
    const previewName = document.getElementById('preview-name');
    const previewJobTitle = document.getElementById('preview-job-title');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewLocation = document.getElementById('preview-location');
    const previewWebsite = document.getElementById('preview-website');
    const previewSummary = document.getElementById('preview-summary');
    const previewSkillsList = document.getElementById('preview-skills');
    const previewExperience = document.getElementById('preview-experience');
    const previewEducation = document.getElementById('preview-education');

    // Template navigation buttons
    const backToTemplatesBtn = document.getElementById('back-to-templates-btn');
    const saveResumeBtn = document.getElementById('save-resume');
    const printResumeBtn = document.getElementById('print-resume');
    const exportPdfBtns = document.querySelectorAll('.export-pdf');

    // Add experience and education buttons
    const addExperienceBtn = document.getElementById('add-experience');
    const addEducationBtn = document.getElementById('add-education');
    
    // Initialize the event listeners
    initializeEventListeners();
    
    // Initialize the form with any saved data (if applicable)
    initializeFormData();
    
    /**
     * Initialize all event listeners
     */
    function initializeEventListeners() {
        // Personal information input listeners
        if (fullNameInput) fullNameInput.addEventListener('input', updatePersonalInfo);
        if (jobTitleInput) jobTitleInput.addEventListener('input', updatePersonalInfo);
        if (emailInput) emailInput.addEventListener('input', updatePersonalInfo);
        if (phoneInput) phoneInput.addEventListener('input', updatePersonalInfo);
        if (locationInput) locationInput.addEventListener('input', updatePersonalInfo);
        if (websiteInput) websiteInput.addEventListener('input', updatePersonalInfo);
        if (summaryInput) summaryInput.addEventListener('input', updatePersonalInfo);
        
        // Add skill button
        if (addSkillBtn) addSkillBtn.addEventListener('click', addSkill);
        
        // Add experience button
        if (addExperienceBtn) addExperienceBtn.addEventListener('click', addExperienceEntry);
        
        // Add education button
        if (addEducationBtn) addEducationBtn.addEventListener('click', addEducationEntry);
        
        // Navigation and action buttons
        if (backToTemplatesBtn) backToTemplatesBtn.addEventListener('click', goToTemplates);
        if (saveResumeBtn) saveResumeBtn.addEventListener('click', saveResume);
        
        // Print/Export buttons
        exportPdfBtns.forEach(btn => {
            btn.addEventListener('click', printResume);
        });
        if (printResumeBtn) printResumeBtn.addEventListener('click', printResume);
        
        // AI Assist buttons
        document.querySelectorAll('.ai-assist-button').forEach(button => {
            button.addEventListener('click', handleAIAssist);
        });
        
        // Initialize existing remove buttons
        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', handleRemoveEntry);
        });
        
        // Initialize existing experience entries
        document.querySelectorAll('.experience-entry').forEach(entry => {
            initializeExperienceEntry(entry);
        });
        
        // Initialize existing education entries
        document.querySelectorAll('.education-entry').forEach(entry => {
            initializeEducationEntry(entry);
        });
    }
    
    /**
     * Initialize form with saved data if available
     */
    function initializeFormData() {
        // Check URL for resume ID
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id');
        
        if (resumeId) {
            // In a real app, this would load resume data from server/localStorage
            console.log('Would load resume with ID:', resumeId);
            // For now, we'll just update the preview with the initial values
            updateAllPreviews();
        } else {
            // For new resume, ensure preview is updated with default values
            updateAllPreviews();
        }
    }
    
    /**
     * Update personal information in the preview
     */
    function updatePersonalInfo() {
        if (previewName) previewName.textContent = fullNameInput.value || 'Your Name';
        if (previewJobTitle) previewJobTitle.textContent = jobTitleInput.value || 'Professional Title';
        if (previewEmail) previewEmail.textContent = emailInput.value || 'email@example.com';
        if (previewPhone) previewPhone.textContent = phoneInput.value || '(123) 456-7890';
        if (previewLocation) previewLocation.textContent = locationInput.value || 'City, State';
        if (previewWebsite) previewWebsite.textContent = websiteInput.value || 'linkedin.com/in/yourname';
        if (previewSummary) previewSummary.textContent = summaryInput.value || 'Professional summary will appear here...';
    }
    
    /**
     * Update all preview sections
     */
    function updateAllPreviews() {
        updatePersonalInfo();
        updateExperiencePreview();
        updateEducationPreview();
    }
    
    /**
     * Add a new skill
     */
    function addSkill() {
        const skillText = skillsInput.value.trim();
        if (!skillText) return;
        
        // Clear input
        skillsInput.value = '';
        
        // Create skill item for editor
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        
        // Generate a random proficiency level between 60-95%
        const proficiency = Math.floor(Math.random() * 36) + 60;
        
        skillItem.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">${escapeHtml(skillText)}</span>
                <input type="range" class="skill-level-input" min="1" max="100" value="${proficiency}">
                <span class="skill-percentage">${proficiency}%</span>
            </div>
            <div class="skill-actions">
                <button class="btn-remove-skill">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add to editor
        skillsContainer.appendChild(skillItem);
        
        // Add to preview
        addSkillToPreview(skillText, proficiency);
        
        // Add event listeners
        const removeBtn = skillItem.querySelector('.btn-remove-skill');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                // Remove from editor
                skillItem.remove();
                
                // Remove from preview
                removeSkillFromPreview(skillText);
            });
        }
        
        const levelInput = skillItem.querySelector('.skill-level-input');
        const percentageSpan = skillItem.querySelector('.skill-percentage');
        
        if (levelInput && percentageSpan) {
            levelInput.addEventListener('input', function() {
                const newLevel = levelInput.value;
                percentageSpan.textContent = `${newLevel}%`;
                updateSkillLevelInPreview(skillText, newLevel);
            });
        }
    }
    
    /**
     * Add skill to preview section
     */
    function addSkillToPreview(skillName, level) {
        // Create new skill item for preview
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.dataset.skill = skillName;
        
        skillItem.innerHTML = `
            <span class="skill-name">${escapeHtml(skillName)}</span>
            <div class="skill-bar">
                <div class="skill-level" style="width: ${level}%;"></div>
            </div>
        `;
        
        // Add to preview
        previewSkillsList.appendChild(skillItem);
    }
    
    /**
     * Remove skill from preview
     */
    function removeSkillFromPreview(skillName) {
        const skillItems = previewSkillsList.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            if (item.dataset.skill === skillName) {
                item.remove();
            }
        });
    }
    
    /**
     * Update skill level in preview
     */
    function updateSkillLevelInPreview(skillName, level) {
        const skillItems = previewSkillsList.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            if (item.dataset.skill === skillName) {
                const skillLevel = item.querySelector('.skill-level');
                if (skillLevel) {
                    skillLevel.style.width = `${level}%`;
                }
            }
        });
    }
    
    /**
     * Add a new experience entry
     */
    function addExperienceEntry() {
        const container = document.getElementById('experience-container');
        if (!container) return;
        
        const count = container.querySelectorAll('.experience-entry').length + 1;
        
        const entry = document.createElement('div');
        entry.className = 'experience-entry';
        entry.innerHTML = `
            <div class="entry-header">
                <h3>Experience ${count}</h3>
                <button class="btn-remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="form-control job-title-input" placeholder="e.g. Software Engineer">
            </div>
            
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="form-control company-input" placeholder="e.g. Tech Solutions Inc.">
            </div>
            
            <div class="form-row">
                <div class="form-group form-col">
                    <label>Start Date</label>
                    <input type="text" class="form-control start-date-input" placeholder="e.g. Jan 2020">
                </div>
                <div class="form-group form-col">
                    <label>End Date</label>
                    <input type="text" class="form-control end-date-input" placeholder="e.g. Present">
                </div>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <div class="textarea-container">
                    <textarea class="form-control description-input" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
                    <button class="ai-assist-button">
                        <i class="fas fa-magic"></i> AI Assist
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(entry);
        
        // Add event listeners
        initializeExperienceEntry(entry);
        
        // Add AI assist button listener
        const aiAssistBtn = entry.querySelector('.ai-assist-button');
        if (aiAssistBtn) {
            aiAssistBtn.addEventListener('click', handleAIAssist);
        }
        
        // Add empty entry to preview
        addExperienceToPreview({
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            description: ''
        });
        
        // Update preview
        updateExperiencePreview();
    }
    
    /**
     * Initialize an experience entry with event listeners
     */
    function initializeExperienceEntry(entry) {
        const removeBtn = entry.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', handleRemoveEntry);
        }
        
        const jobTitleInput = entry.querySelector('.job-title-input');
        const companyInput = entry.querySelector('.company-input');
        const startDateInput = entry.querySelector('.start-date-input');
        const endDateInput = entry.querySelector('.end-date-input');
        const descriptionInput = entry.querySelector('.description-input');
        
        if (jobTitleInput) jobTitleInput.addEventListener('input', updateExperiencePreview);
        if (companyInput) companyInput.addEventListener('input', updateExperiencePreview);
        if (startDateInput) startDateInput.addEventListener('input', updateExperiencePreview);
        if (endDateInput) endDateInput.addEventListener('input', updateExperiencePreview);
        if (descriptionInput) descriptionInput.addEventListener('input', updateExperiencePreview);
    }
    
    /**
     * Add experience to preview
     */
    function addExperienceToPreview(data) {
        if (!previewExperience) return;
        
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        
        experienceItem.innerHTML = `
            <div class="job-title">${escapeHtml(data.jobTitle || 'Job Title')}</div>
            <div class="company">${escapeHtml(data.company || 'Company')}</div>
            <span class="dates">${escapeHtml(data.startDate || 'Start Date')} - ${escapeHtml(data.endDate || 'End Date')}</span>
            <div class="job-description">
                <p>${escapeHtml(data.description || 'Job description goes here.')}</p>
            </div>
        `;
        
        previewExperience.appendChild(experienceItem);
    }
    
    /**
     * Update experience preview based on form inputs
     */
    function updateExperiencePreview() {
        if (!previewExperience) return;
        
        // Clear preview
        previewExperience.innerHTML = '';
        
        // Get all experience entries
        const experiences = document.querySelectorAll('.experience-entry');
        
        if (experiences.length === 0) {
            previewExperience.innerHTML = '<p class="empty-section">Your work experience will appear here...</p>';
            return;
        }
        
        // Add each experience to preview
        experiences.forEach(exp => {
            const data = {
                jobTitle: exp.querySelector('.job-title-input')?.value || '',
                company: exp.querySelector('.company-input')?.value || '',
                startDate: exp.querySelector('.start-date-input')?.value || '',
                endDate: exp.querySelector('.end-date-input')?.value || '',
                description: exp.querySelector('.description-input')?.value || ''
            };
            
            addExperienceToPreview(data);
        });
    }
    
    /**
     * Add a new education entry
     */
    function addEducationEntry() {
        const container = document.getElementById('education-container');
        if (!container) return;
        
        const count = container.querySelectorAll('.education-entry').length + 1;
        
        const entry = document.createElement('div');
        entry.className = 'education-entry';
        entry.innerHTML = `
            <div class="entry-header">
                <h3>Education ${count}</h3>
                <button class="btn-remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="form-control degree-input" placeholder="e.g. Bachelor of Science in Computer Science">
            </div>
            
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="form-control institution-input" placeholder="e.g. University of Technology">
            </div>
            
            <div class="form-row">
                <div class="form-group form-col">
                    <label>Start Year</label>
                    <input type="text" class="form-control start-year-input" placeholder="e.g. 2016">
                </div>
                <div class="form-group form-col">
                    <label>End Year</label>
                    <input type="text" class="form-control end-year-input" placeholder="e.g. 2020">
                </div>
            </div>
            
            <div class="form-group">
                <label>Description (Optional)</label>
                <div class="textarea-container">
                    <textarea class="form-control education-description-input" rows="2" placeholder="Additional information about your education..."></textarea>
                    <button class="ai-assist-button">
                        <i class="fas fa-magic"></i> AI Assist
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(entry);
        
        // Add event listeners
        initializeEducationEntry(entry);
        
        // Add AI assist button listener
        const aiAssistBtn = entry.querySelector('.ai-assist-button');
        if (aiAssistBtn) {
            aiAssistBtn.addEventListener('click', handleAIAssist);
        }
        
        // Add empty entry to preview
        addEducationToPreview({
            degree: '',
            institution: '',
            startYear: '',
            endYear: '',
            description: ''
        });
        
        // Update preview
        updateEducationPreview();
    }
    
    /**
     * Initialize an education entry with event listeners
     */
    function initializeEducationEntry(entry) {
        const removeBtn = entry.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', handleRemoveEntry);
        }
        
        const degreeInput = entry.querySelector('.degree-input');
        const institutionInput = entry.querySelector('.institution-input');
        const startYearInput = entry.querySelector('.start-year-input');
        const endYearInput = entry.querySelector('.end-year-input');
        const descriptionInput = entry.querySelector('.education-description-input');
        
        if (degreeInput) degreeInput.addEventListener('input', updateEducationPreview);
        if (institutionInput) institutionInput.addEventListener('input', updateEducationPreview);
        if (startYearInput) startYearInput.addEventListener('input', updateEducationPreview);
        if (endYearInput) endYearInput.addEventListener('input', updateEducationPreview);
        if (descriptionInput) descriptionInput.addEventListener('input', updateEducationPreview);
    }
    
    /**
     * Add education to preview
     */
    function addEducationToPreview(data) {
        if (!previewEducation) return;
        
        const educationItem = document.createElement('div');
        educationItem.className = 'education-item';
        
        educationItem.innerHTML = `
            <div class="degree">${escapeHtml(data.degree || 'Degree')}</div>
            <div class="institution">${escapeHtml(data.institution || 'Institution')}</div>
            <span class="dates">${escapeHtml(data.startYear || 'Start Year')} - ${escapeHtml(data.endYear || 'End Year')}</span>
            ${data.description ? `<p>${escapeHtml(data.description)}</p>` : ''}
        `;
        
        previewEducation.appendChild(educationItem);
    }
    
    /**
     * Update education preview based on form inputs
     */
    function updateEducationPreview() {
        if (!previewEducation) return;
        
        // Clear preview
        previewEducation.innerHTML = '';
        
        // Get all education entries
        const educations = document.querySelectorAll('.education-entry');
        
        if (educations.length === 0) {
            previewEducation.innerHTML = '<p class="empty-section">Your education will appear here...</p>';
            return;
        }
        
        // Add each education to preview
        educations.forEach(edu => {
            const data = {
                degree: edu.querySelector('.degree-input')?.value || '',
                institution: edu.querySelector('.institution-input')?.value || '',
                startYear: edu.querySelector('.start-year-input')?.value || '',
                endYear: edu.querySelector('.end-year-input')?.value || '',
                description: edu.querySelector('.education-description-input')?.value || ''
            };
            
            addEducationToPreview(data);
        });
    }
    
    /**
     * Handle removing an entry (experience or education)
     */
    function handleRemoveEntry(event) {
        const entryContainer = event.currentTarget.closest('.experience-entry, .education-entry');
        if (!entryContainer) return;
        
        const isExperience = entryContainer.classList.contains('experience-entry');
        const container = entryContainer.parentElement;
        
        // Remove the entry
        container.removeChild(entryContainer);
        
        // Update numbering for remaining entries
        const entries = isExperience ? 
                      container.querySelectorAll('.experience-entry') :
                      container.querySelectorAll('.education-entry');
        
        entries.forEach((entry, index) => {
            const header = entry.querySelector('.entry-header h3');
            if (header) {
                header.textContent = `${isExperience ? 'Experience' : 'Education'} ${index + 1}`;
            }
        });
        
        // Update preview
        if (isExperience) {
            updateExperiencePreview();
        } else {
            updateEducationPreview();
        }
    }
    
    /**
     * Handle AI assist button click
     */
    function handleAIAssist(event) {
        const button = event.currentTarget;
        const textarea = button.closest('.textarea-container')?.querySelector('textarea');
        
        if (!textarea) return;
        
        // Save original button text
        const originalText = button.innerHTML;
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        button.disabled = true;
        
        // Determine context type
        let type = 'summary';
        if (textarea.classList.contains('description-input')) {
            type = 'experience';
        } else if (textarea.classList.contains('education-description-input')) {
            type = 'education';
        }
        
        // In a real app, this would call an AI service
        // For now, we'll simulate it with a timeout and predefined text
        setTimeout(() => {
            let generatedText = '';
            
            switch (type) {
                case 'summary':
                    generatedText = 'Experienced professional with a track record of success in delivering high-quality results. Skilled in problem-solving, communication, and team collaboration. Passionate about continuous learning and applying innovative solutions to complex challenges.';
                    break;
                case 'experience':
                    generatedText = 'Led cross-functional team projects and delivered results ahead of schedule. Improved process efficiency by 30% through implementation of new methodologies. Collaborated with stakeholders to ensure project requirements were met and exceeded expectations.';
                    break;
                case 'education':
                    generatedText = 'Graduated with honors. Participated in relevant coursework and projects that enhanced practical skills in the field. Active member of student organizations related to the discipline.';
                    break;
                default:
                    generatedText = 'Generated content would appear here.';
            }
            
            // Update textarea
            textarea.value = generatedText;
            
            // Trigger input event to update preview
            const inputEvent = new Event('input', { bubbles: true });
            textarea.dispatchEvent(inputEvent);
            
            // Show success state
            button.innerHTML = '<i class="fas fa-check"></i> Done!';
            
            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
            
        }, 1500);
    }
    
    /**
     * Navigate to templates page
     */
    function goToTemplates() {
        window.location.href = 'template.html';
    }
    
    /**
     * Save the resume
     */
    function saveResume() {
        // Get save button
        if (!saveResumeBtn) return;
        
        // Save original button text
        const originalText = saveResumeBtn.innerHTML;
        
        // Show loading state
        saveResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveResumeBtn.disabled = true;
        
        // Collect all resume data
        const resumeData = {
            personalInfo: {
                fullName: fullNameInput?.value || '',
                jobTitle: jobTitleInput?.value || '',
                email: emailInput?.value || '',
                phone: phoneInput?.value || '',
                location: locationInput?.value || '',
                website: websiteInput?.value || ''
            },
            summary: summaryInput?.value || '',
            experience: collectExperienceData(),
            education: collectEducationData(),
            skills: collectSkillsData(),
            template: 'template2'
        };
        
        // In a real app, this would call an API to save the resume
        // For now, just simulate with a timeout
        setTimeout(() => {
            console.log('Resume data to save:', resumeData);
            
            // Show success state
            saveResumeBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            
            // Reset button after delay
            setTimeout(() => {
                saveResumeBtn.innerHTML = originalText;
                saveResumeBtn.disabled = false;
                
                // Optionally, show a success message
                showToast('Resume saved successfully!', 'success');
            }, 1500);
        }, 1500);
    }
    
    /**
     * Collect experience data from form
     */
    function collectExperienceData() {
        const experiences = [];
        const entries = document.querySelectorAll('.experience-entry');
        
        entries.forEach(entry => {
            experiences.push({
                jobTitle: entry.querySelector('.job-title-input')?.value || '',
                company: entry.querySelector('.company-input')?.value || '',
                startDate: entry.querySelector('.start-date-input')?.value || '',
                endDate: entry.querySelector('.end-date-input')?.value || '',
                description: entry.querySelector('.description-input')?.value || ''
            });
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
            educations.push({
                degree: entry.querySelector('.degree-input')?.value || '',
                institution: entry.querySelector('.institution-input')?.value || '',
                startYear: entry.querySelector('.start-year-input')?.value || '',
                endYear: entry.querySelector('.end-year-input')?.value || '',
                description: entry.querySelector('.education-description-input')?.value || ''
            });
        });
        
        return educations;
    }
    
    /**
     * Collect skills data from form
     */
    function collectSkillsData() {
        const skills = [];
        const skillItems = skillsContainer.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            const name = item.querySelector('.skill-name')?.textContent || '';
            const level = item.querySelector('.skill-level-input')?.value || 50;
            
            if (name) {
                skills.push({ name, level });
            }
        });
        
        return skills;
    }
    
    /**
     * Print the resume
     */
    function printResume() {
        window.print();
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.backgroundColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        toast.style.color = 'white';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        // Add to document
        document.body.appendChild(toast);
        
        // Fade in
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});