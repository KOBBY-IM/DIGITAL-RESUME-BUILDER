// Custom Sections JavaScript
console.log('Custom sections script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing custom sections...');
  
  // Add custom section button
  const addCustomSectionBtn = document.getElementById('add-custom-section');
  if (addCustomSectionBtn) {
    console.log('Add custom section button found');
    addCustomSectionBtn.addEventListener('click', function() {
      addCustomSection();
    });
  } else {
    console.error('Add custom section button not found');
  }
  
  // Initial check for containers
  const customSectionsContainer = document.getElementById('custom-sections-container');
  if (customSectionsContainer) {
    console.log('Custom sections container found');
  } else {
    console.error('Custom sections container not found');
  }
  
  const previewContainer = document.getElementById('preview-custom-sections');
  if (previewContainer) {
    console.log('Preview custom sections container found');
  } else {
    console.error('Preview custom sections container not found');
  }
});

/**
 * Add a new custom section
 */
function addCustomSection(title = '', content = '') {
  console.log('Adding custom section');
  
  const container = document.getElementById('custom-sections-container');
  if (!container) {
    console.error('Custom sections container not found');
    return;
  }

  // Remove the "no sections" message if it exists
  const noSectionsMsg = container.querySelector('.no-custom-sections');
  if (noSectionsMsg) {
    container.removeChild(noSectionsMsg);
  }

  // Create custom section from template
  const template = document.getElementById('custom-section-template');
  if (!template) {
    console.error('Custom section template not found');
    return;
  }

  const newSection = document.importNode(template.content, true).querySelector('.custom-section');

  // Set title and content if provided
  if (title) {
    const titleInput = newSection.querySelector('.custom-section-title');
    if (titleInput) titleInput.value = title;
  }
  
  if (content) {
    const contentInput = newSection.querySelector('.custom-section-content');
    if (contentInput) contentInput.value = content;
  }

  // Add remove button functionality
  const removeBtn = newSection.querySelector('.custom-section-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      container.removeChild(newSection);
      
      // If this was the last custom section, add the "no sections" message back
      if (container.querySelectorAll('.custom-section').length === 0) {
        const noSectionsMsg = document.createElement('div');
        noSectionsMsg.className = 'no-custom-sections';
        noSectionsMsg.innerHTML = '<p>Add custom sections like Certifications, Projects, Languages, etc.</p>';
        container.appendChild(noSectionsMsg);
      }
      
      updateCustomSectionsPreview();
    });
  }

  // Add input event listeners
  const titleInput = newSection.querySelector('.custom-section-title');
  const contentInput = newSection.querySelector('.custom-section-content');
  
  if (titleInput) {
    titleInput.addEventListener('input', function() {
      console.log('Title updated: ' + this.value);
      updateCustomSectionsPreview();
    });
  }
  
  if (contentInput) {
    contentInput.addEventListener('input', function() {
      console.log('Content updated');
      updateCustomSectionsPreview();
    });
  }

  // Add AI assist button functionality if handler exists
  const aiAssistBtn = newSection.querySelector('.ai-assist');
  if (aiAssistBtn && typeof handleAIAssist === 'function') {
    aiAssistBtn.addEventListener('click', handleAIAssist);
  }

  // Add to container
  container.appendChild(newSection);
  
  // Update preview
  updateCustomSectionsPreview();
  
  console.log('Custom section added');
  return newSection;
}

/**
 * Collect custom sections data for saving
 */
function collectCustomSectionsData() {
  const customSections = [];
  const sections = document.querySelectorAll('#custom-sections-container .custom-section');
  
  console.log(`Collecting data from ${sections.length} custom sections`);
  
  sections.forEach((section, index) => {
    const titleInput = section.querySelector('.custom-section-title');
    const contentInput = section.querySelector('.custom-section-content');
    
    if (titleInput && contentInput) {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      
      // Only add if both title and content exist
      if (title && content) {
        customSections.push({ title, content });
        console.log(`Collected section ${index + 1}: ${title}`);
      }
    }
  });
  
  console.log(`Total valid custom sections: ${customSections.length}`);
  return customSections;
}

/**
 * Update custom sections preview
 */
function updateCustomSectionsPreview() {
  console.log('Updating custom sections preview');
  
  const sections = document.querySelectorAll('#custom-sections-container .custom-section');
  const previewContainer = document.getElementById('preview-custom-sections');
  
  if (!previewContainer) {
    console.error('Preview custom sections container not found');
    return;
  }
  
  // Clear current preview
  previewContainer.innerHTML = '';
  
  // Log debugging info
  console.log(`Found ${sections.length} custom section elements`);
  
  // Process each section
  let validSections = 0;
  
  sections.forEach((section, index) => {
    // Skip if it's the "no custom sections" placeholder
    if (section.classList.contains('no-custom-sections')) {
      return;
    }
    
    const titleInput = section.querySelector('.custom-section-title');
    const contentInput = section.querySelector('.custom-section-content');
    
    if (titleInput && contentInput) {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      
      console.log(`Processing section ${index+1}: title=${title}, content length=${content.length}`);
      
      if (title && content) {
        validSections++;
        
        // Create formatted section
        const sectionElement = document.createElement('div');
        sectionElement.className = 'resume-section';
        sectionElement.innerHTML = `
          <h2>${escapeHtml(title).toUpperCase()}</h2>
          <div class="custom-section-content">
            ${formatDescription(content)}
          </div>
        `;
        
        previewContainer.appendChild(sectionElement);
        console.log(`Added section to preview: ${title}`);
      }
    }
  });
  
  console.log(`Added ${validSections} sections to preview`);
}

/**
 * Format description text with paragraphs
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
 * Format description with bullet points for experience entries
 */
function formatDescriptionWithBullets(text) {
  if (!text) return "";

  const lines = text.split("\n").filter((line) => line.trim() !== "");
  
  // If multiple lines, format as bullet points
  if (lines.length > 1) {
    return '<ul>' + 
      lines.map(line => `<li>${escapeHtml(line)}</li>`).join('') + 
      '</ul>';
  } else if (lines.length === 1) {
    // Single line as paragraph
    return `<p>${escapeHtml(text)}</p>`;
  } else {
    return "";
  }
}

/**
 * Utility: Escape HTML special characters
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

// Export functions to global scope
window.addCustomSection = addCustomSection;
window.collectCustomSectionsData = collectCustomSectionsData;
window.updateCustomSectionsPreview = updateCustomSectionsPreview;