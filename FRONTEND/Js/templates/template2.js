document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'test.html?error=auth_required&redirect=template2';
        return;
    }

    // Initialize variables
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    let resumeData = null;

    // Form elements
    const fullNameInput = document.getElementById('fullName');
    const jobTitleInput = document.getElementById('jobTitle');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const websiteInput = document.getElementById('website');
    const summaryInput = document.getElementById('summary');
    const addExperienceBtn = document.querySelector('.section-header .btn-add');
    const experienceContainer = document.getElementById('experience-container');
    const addEducationBtn = document.querySelector('.section-header:nth-of-type(2) .btn-add');
    const educationContainer = document.getElementById('education-container');
    const skillsInput = document.getElementById('skillsInput');
    const addSkillsBtn = document.getElementById('addSkills');
    const skillsContainer = document.getElementById('skillsContainer');

    // Preview elements
    const previewName = document.querySelector('.resume-header h1');
    const previewTitle = document.querySelector('.resume-header p');
    const previewEmail = document.querySelector('.contact-item:nth-child(1) span:last-child');
    const previewPhone = document.querySelector('.contact-item:nth-child(2) span:last-child');
    const previewLocation = document.querySelector('.contact-item:nth-child(3) span:last-child');
    const previewWebsite = document.querySelector('.contact-item:nth-child(4) span:last-child');
    const previewSummary = document.querySelector('.resume-section:nth-child(1) p');
    const previewExperience = document.querySelector('.resume-section:nth-child(2)');
    const previewEducation = document.querySelector('.resume-section:nth-child(3)');
    const previewSkills = document.querySelector('.skills-list');

    // Save and export buttons
    const saveResumeBtn = document.querySelector('.header-nav .btn-primary');
    const exportPdfBtn = document.querySelector('.export-pdf');

    // Initialize event listeners
    initializeEventListeners();

    // Load resume data if ID provided
    if (resumeId) {
        loadResumeData(resumeId);
    } else {
        // Initialize with empty sections
        addExperienceEntry();
        addEducationEntry();
    }

    // Initialize all event listeners
    function initializeEventListeners() {
        // Personal info inputs
        if (fullNameInput) fullNameInput.addEventListener('input', updatePersonalInfo);
        if (jobTitleInput) jobTitleInput.addEventListener('input', updatePersonalInfo);
        if (emailInput) emailInput.addEventListener('input', updatePersonalInfo);
        if (phoneInput) phoneInput.addEventListener('input', updatePersonalInfo);
        if (locationInput) locationInput.addEventListener('input', updatePersonalInfo);
        if (websiteInput) websiteInput.addEventListener('input', updatePersonalInfo);
        if (summaryInput) summaryInput.addEventListener('input', updatePersonalInfo);

        // Add experience button
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', addExperienceEntry);
        }

        // Add education button
        if (addEducationBtn) {
            addEducationBtn.addEventListener('click', addEducationEntry);
        }

        // Add skills functionality
        if (addSkillsBtn) {
            addSkillsBtn.addEventListener('click', addSkill);
        }

        // Save resume button
        if (saveResumeBtn) {
            saveResumeBtn.addEventListener('click', saveResume);
        }

        // Export PDF button
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', exportToPDF);
        }

        // AI Assist buttons
        document.querySelectorAll('.ai-assist-button').forEach(button => {
            button.addEventListener('click', handleAIAssist);
        });
    }

    // Update personal info in preview
    function updatePersonalInfo() {
        if (previewName) previewName.textContent = fullNameInput.value || 'Your Name';
        if (previewTitle) previewTitle.textContent = jobTitleInput.value || 'Professional Title';
        if (previewEmail) previewEmail.textContent = emailInput.value || 'email@example.com';
        if (previewPhone) previewPhone.textContent = phoneInput.value || '(123) 456-7890';
        if (previewLocation) previewLocation.textContent = locationInput.value || 'City, State';
        if (previewWebsite) previewWebsite.textContent = websiteInput.value || 'linkedin.com/in/username';
        if (previewSummary) previewSummary.textContent = summaryInput.value || 'Professional summary will appear here...';
    }

    // Add experience entry
    function addExperienceEntry(data = {}) {
        const experienceEntry = document.createElement('div');
        experienceEntry.className = 'experience-entry';
        experienceEntry.innerHTML = `
            <div class="entry-header">
                <h3>Experience ${experienceContainer.children.length + 1}</h3>
                <button type="button" class="btn-remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-group">
                <label class="form-group__label">Job Title</label>
                <input type="text" class="form-group__input job-title-input" value="${escapeHtml(data.jobTitle || '')}" placeholder="e.g. Software Engineer">
            </div>
            <div class="form-group">
                <label class="form-group__label">Company</label>
                <input type="text" class="form-group__input company-input" value="${escapeHtml(data.company || '')}" placeholder="e.g. Tech Solutions Inc.">
            </div>
            <div class="form-row">
                <div class="form-group form-col">
                    <label class="form-group__label">Start Date</label>
                    <input type="text" class="form-group__input start-date-input" value="${escapeHtml(data.startDate || '')}" placeholder="e.g. Jan 2020">
                </div>
                <div class="form-group form-col">
                    <label class="form-group__label">End Date</label>
                    <input type="text" class="form-group__input end-date-input" value="${escapeHtml(data.endDate || '')}" placeholder="e.g. Present">
                </div>
            </div>
            <div class="form-group">
                <label class="form-group__label">Description</label>
                <div class="textarea-container">
                    <textarea class="form-group__textarea description-input" rows="3" placeholder="Describe your responsibilities and achievements">${escapeHtml(data.description || '')}</textarea>
                    <button type="button" class="ai-assist-button">
                        <i class="fas fa-magic"></i> AI Assist
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const removeBtn = experienceEntry.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                experienceContainer.removeChild(experienceEntry);
                updateExperienceNumbers();
                updateExperiencePreview();
            });
        }

        // Input change listeners
        const inputs = experienceEntry.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', updateExperiencePreview);
        });

        // AI assist button
        const aiButton = experienceEntry.querySelector('.ai-assist-button');
        if (aiButton) {
            aiButton.addEventListener('click', handleAIAssist);
        }

        // Add to container
        experienceContainer.appendChild(experienceEntry);
        updateExperiencePreview();
    }

    // Update experience numbers after removal
    function updateExperienceNumbers() {
        const entries = experienceContainer.querySelectorAll('.experience-entry');
        entries.forEach((entry, index) => {
            const header = entry.querySelector('h3');
            if (header) {
                header.textContent = `Experience ${index + 1}`;
            }
        });
    }

    // Update experience preview
    function updateExperiencePreview() {
        // Clear current preview
        while (previewExperience.children.length > 1) {
            previewExperience.removeChild(previewExperience.lastChild);
        }

        // Get all experience entries
        const entries = experienceContainer.querySelectorAll('.experience-entry');
        
        entries.forEach(entry => {
            const jobTitle = entry.querySelector('.job-title-input').value;
            const company = entry.querySelector('.company-input').value;
            const startDate = entry.querySelector('.start-date-input').value;
            const endDate = entry.querySelector('.end-date-input').value;
            const description = entry.querySelector('.description-input').value;

            // Create preview experience item
            const expItem = document.createElement('div');
            expItem.className = 'experience-item';
            expItem.innerHTML = `
                <div class="job-title">${escapeHtml(jobTitle || 'Job Title')}</div>
                <div class="company">${escapeHtml(company || 'Company')}</div>
                <span class="dates">${escapeHtml(startDate || 'Start Date')} - ${escapeHtml(endDate || 'End Date')}</span>
                <div class="job-description">
                    <p>${escapeHtml(description || 'Job description will appear here.')}</p>
                </div>
            `;

            previewExperience.appendChild(expItem);
        });
    }

    // Add education entry with similar pattern as experience
    function addEducationEntry(data = {}) {
        const educationEntry = document.createElement('div');
        educationEntry.className = 'education-entry';
        educationEntry.innerHTML = `
            <div class="entry-header">
                <h3>Education ${educationContainer.children.length + 1}</h3>
                <button type="button" class="btn-remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-group">
                <label class="form-group__label">Degree</label>
                <input type="text" class="form-group__input degree-input" value="${escapeHtml(data.degree || '')}" placeholder="e.g. Bachelor of Science in Computer Science">
            </div>
            <div class="form-group">
                <label class="form-group__label">Institution</label>
                <input type="text" class="form-group__input institution-input" value="${escapeHtml(data.institution || '')}" placeholder="e.g. University of Technology">
            </div>
            <div class="form-row">
                <div class="form-group form-col">
                    <label class="form-group__label">Start Year</label>
                    <input type="text" class="form-group__input start-year-input" value="${escapeHtml(data.startYear || '')}" placeholder="e.g. 2016">
                </div>
                <div class="form-group form-col">
                    <label class="form-group__label">End Year</label>
                    <input type="text" class="form-group__input end-year-input" value="${escapeHtml(data.endYear || '')}" placeholder="e.g. 2020">
                </div>
            </div>
            <div class="form-group">
                <label class="form-group__label">Description (Optional)</label>
                <div class="textarea-container">
                    <textarea class="form-group__textarea education-description-input" rows="2" placeholder="Additional information, achievements, etc.">${escapeHtml(data.description || '')}</textarea>
                    <button type="button" class="ai-assist-button">
                        <i class="fas fa-magic"></i> AI Assist
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for removal, input change, and AI assist
        // ... (similar to experience entry implementation)

        // Add to container
        educationContainer.appendChild(educationEntry);
        updateEducationPreview();
    }

    // Add skill to the skills list
    function addSkill() {
        const skillText = skillsInput.value.trim();
        if (!skillText) return;
        
        // Reset input
        skillsInput.value = '';
        
        // Generate random skill level (60-95%)
        const skillLevel = Math.floor(Math.random() * 36) + 60;
        
        // Create skill item
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.dataset.skill = skillText;
        skillItem.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">${escapeHtml(skillText)}</span>
                <input type="range" class="skill-level-input" min="1" max="100" value="${skillLevel}">
                <span class="skill-percentage">${skillLevel}%</span>
            </div>
            <div class="skill-actions">
                <button class="btn-remove-skill">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add removal listener
        const removeBtn = skillItem.querySelector('.btn-remove-skill');
        removeBtn.addEventListener('click', function() {
            skillsContainer.removeChild(skillItem);
            updateSkillsPreview();
        });
        
        // Add level change listener
        const levelInput = skillItem.querySelector('.skill-level-input');
        const percentageSpan = skillItem.querySelector('.skill-percentage');
        levelInput.addEventListener('input', function() {
            const newLevel = levelInput.value;
            percentageSpan.textContent = `${newLevel}%`;
            updateSkillsPreview();
        });
        
        // Add to container
        skillsContainer.appendChild(skillItem);
        updateSkillsPreview();
    }

    // Update skills preview
    function updateSkillsPreview() {
        // Clear current skills
        previewSkills.innerHTML = '';
        
        // Get all skills
        const skills = skillsContainer.querySelectorAll('.skill-item');
        
        skills.forEach(skill => {
            const skillName = skill.querySelector('.skill-name').textContent;
            const skillLevel = skill.querySelector('.skill-level-input').value;
            
            const skillPreview = document.createElement('div');
            skillPreview.className = 'skill-item';
            skillPreview.innerHTML = `
                <span class="skill-name">${escapeHtml(skillName)}</span>
                <div class="skill-bar">
                    <div class="skill-level" style="width: ${skillLevel}%;"></div>
                </div>
            `;
            
            previewSkills.appendChild(skillPreview);
        });
    }

    // Handle AI assistance
    async function handleAIAssist(event) {
        const button = event.currentTarget;
        const textarea = button.closest('.textarea-container')?.querySelector('textarea');
        
        if (!textarea) return;
        
        // Save original button state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        button.disabled = true;
        
        try {
            // Determine context type
            let context = 'summary';
            if (textarea.classList.contains('description-input')) {
                context = 'experience';
                
                // Get job details for better AI context
                const entry = textarea.closest('.experience-entry');
                const jobTitle = entry?.querySelector('.job-title-input')?.value || '';
                const company = entry?.querySelector('.company-input')?.value || '';
                
                const prompt = `Write 3-4 bullet points for a ${jobTitle || 'professional'} role at ${company || 'a company'}. Include achievements with quantifiable results where possible. Start each bullet with a strong action verb.`;
                
                const result = await TemplateCore.getAIAssistance(prompt, context);
                textarea.value = result;
            } 
            else if (textarea.classList.contains('education-description-input')) {
                context = 'education';
                
                // Get education details for better AI context
                const entry = textarea.closest('.education-entry');
                const degree = entry?.querySelector('.degree-input')?.value || '';
                const institution = entry?.querySelector('.institution-input')?.value || '';
                
                const prompt = `Write a brief description for ${degree || 'a degree'} from ${institution || 'a university'}. Highlight achievements, relevant coursework, or special projects.`;
                
                const result = await TemplateCore.getAIAssistance(prompt, context);
                textarea.value = result;
            }
            else if (textarea.id === 'summary') {
                // Get personal details for better summary
                const name = fullNameInput?.value || '';
                const title = jobTitleInput?.value || '';
                
                const prompt = `Write a professional summary for ${name || 'a candidate'} seeking a ${title || 'position'}. Focus on key strengths and value proposition. Keep it to 3-4 sentences.`;
                
                const result = await TemplateCore.getAIAssistance(prompt, 'summary');
                textarea.value = result;
            }
            
            // Update preview
            textarea.dispatchEvent(new Event('input'));
            
            // Success state
            button.innerHTML = '<i class="fas fa-check"></i> Done!';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('AI assist error:', error);
            
            // Error state
            button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 2000);
            
            showToast(error.message || 'Failed to generate content', 'error');
        }
    }

    // Save resume
    async function saveResume() {
        // Save button reference
        const saveBtn = document.querySelector('.header-nav .btn-primary');
        if (!saveBtn) return;
        
        // Update button state
        const originalText = saveBtn.textContent;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        try {
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
                template: 'template2',
                lastUpdated: new Date()
            };
            
            // Validate minimum requirements
            if (!resumeData.personalInfo.fullName) {
                throw new Error('Full name is required');
            }
            
            // Save or update based on resumeId
            let response;
            if (resumeId) {
                response = await TemplateCore.saveResume(resumeData, resumeId);
            } else {
                response = await TemplateCore.saveResume(resumeData);
                // Update URL with new ID
                if (response.data && response.data._id) {
                    window.history.replaceState(null, '', `?id=${response.data._id}`);
                    resumeId = response.data._id;
                }
            }
            
            // Show success message
            showToast('Resume saved successfully!', 'success');
            
            // Reset button state after delay
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }, 1500);
            }, 500);
            
        } catch (error) {
            console.error('Save error:', error);
            
            // Show error message
            showToast(error.message || 'Failed to save resume', 'error');
            
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    // Load resume data from server
    async function loadResumeData(id) {
        try {
            // Show loading indicator
            document.body.classList.add('loading');
            
            // Load data
            const result = await TemplateCore.loadResume(id);
            resumeData = result.data;
            
            // Populate form fields
            populateFormFields(resumeData);
            
        } catch (error) {
            console.error('Load error:', error);
            showToast(error.message || 'Failed to load resume', 'error');
        } finally {
            // Hide loading indicator
            document.body.classList.remove('loading');
        }
    }

    // Populate form with resume data
    function populateFormFields(data) {
        // Clear existing entries first
        experienceContainer.innerHTML = '';
        educationContainer.innerHTML = '';
        skillsContainer.innerHTML = '';
        
        // Personal info
        if (data.personalInfo) {
            fullNameInput.value = data.personalInfo.fullName || '';
            jobTitleInput.value = data.personalInfo.jobTitle || '';
            emailInput.value = data.personalInfo.email || '';
            phoneInput.value = data.personalInfo.phone || '';
            locationInput.value = data.personalInfo.location || '';
            websiteInput.value = data.personalInfo.website || '';
        }
        
        // Summary
        summaryInput.value = data.summary || '';
        
        // Experience entries
        if (Array.isArray(data.experience) && data.experience.length > 0) {
            data.experience.forEach(exp => {
                addExperienceEntry(exp);
            });
        } else {
            // Add empty experience entry
            addExperienceEntry();
        }
        
        // Education entries
        if (Array.isArray(data.education) && data.education.length > 0) {
            data.education.forEach(edu => {
                addEducationEntry(edu);
            });
        } else {
            // Add empty education entry
            addEducationEntry();
        }
        
        // Skills
        if (Array.isArray(data.skills) && data.skills.length > 0) {
            data.skills.forEach(skill => {
                // Set skill input and trigger add
                skillsInput.value = skill.name || skill;
                addSkill();
                
                // Update level if available
                if (skill.level) {
                    const lastSkill = skillsContainer.lastChild;
                    if (lastSkill) {
                        const levelInput = lastSkill.querySelector('.skill-level-input');
                        const percentageSpan = lastSkill.querySelector('.skill-percentage');
                        if (levelInput && percentageSpan) {
                            levelInput.value = skill.level;
                            percentageSpan.textContent = `${skill.level}%`;
                        }
                    }
                }
            });
        }
        
        // Update previews
        updatePersonalInfo();
        updateExperiencePreview();
        updateEducationPreview();
        updateSkillsPreview();
    }

    // Collect experience data from form
    function collectExperienceData() {
        const experiences = [];
        const entries = experienceContainer.querySelectorAll('.experience-entry');
        
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

    // Collect education data from form
    function collectEducationData() {
        const educations = [];
        const entries = educationContainer.querySelectorAll('.education-entry');
        
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

    // Collect skills data from form
    function collectSkillsData() {
        const skills = [];
        const entries = skillsContainer.querySelectorAll('.skill-item');
        
        entries.forEach(entry => {
            const name = entry.querySelector('.skill-name')?.textContent || '';
            const level = entry.querySelector('.skill-level-input')?.value || 50;
            
            if (name) {
                skills.push({ name, level: parseInt(level) });
            }
        });
        
        return skills;
    }

    // Export resume to PDF
    function exportToPDF() {
        try {
            if (!resumeId) {
                // If not saved yet, save first
                showToast('Please save your resume before exporting', 'error');
                return;
            }
            
            // Use the core export function
            TemplateCore.exportToPDF('template2', { _id: resumeId });
            
        } catch (error) {
            console.error('Export error:', error);
            showToast(error.message || 'Failed to export resume', 'error');
        }
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Fade in
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

    // Escape HTML to prevent XSS
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