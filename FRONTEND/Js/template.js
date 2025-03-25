document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'test.html?error=auth_required&redirect=template';
    return;
  }

  // Get all template selection buttons
  const templateButtons = document.querySelectorAll(".add-to-cart");

  // Add click event listeners to template buttons
  templateButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      // Redirect to the corresponding template editor
      const templateNumber = index + 1;
      window.location.href = `template${templateNumber}.html`;
    });
  });

  // Home button
  const homeButton = document.querySelector('button[onclick="homepage()"]');
  if (homeButton) {
    // Remove inline event handler
    homeButton.removeAttribute('onclick');
    // Add proper event listener
    homeButton.addEventListener('click', () => {
      window.location.href = 'loginindex.html';
    });
  }

  // Fetch templates from server if available
  fetchTemplates();
});

// Function to redirect to home page
function homepage() {
  window.location.href = 'loginindex.html';
}

// Fetch templates from the server
async function fetchTemplates() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/templates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If templates can't be fetched, use the default ones
      console.warn('Could not fetch templates, using defaults');
      return;
    }
    
    const templates = await response.json();
    
    // Update template cards with server data
    if (Array.isArray(templates) && templates.length > 0) {
      updateTemplateCards(templates);
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Continue with default templates
  }
}

// Update template cards with data from server
function updateTemplateCards(templates) {
  const templateCards = document.querySelectorAll('.product-card');
  
  templates.forEach((template, index) => {
    if (index < templateCards.length) {
      const card = templateCards[index];
      
      // Update template name
      const nameElement = card.querySelector('.product-name');
      if (nameElement) {
        nameElement.textContent = template.name || `Template ${index + 1}`;
      }
      
      // Update template image if available
      if (template.imageUrl) {
        const imageElement = card.querySelector('.product-image img');
        if (imageElement) {
          imageElement.src = template.imageUrl;
          imageElement.alt = template.name || `Template ${index + 1}`;
        }
      }
      
      // Add description if available
      if (template.description) {
        const descElement = card.querySelector('.product-description');
        if (descElement) {
          descElement.textContent = template.description;
        } else {
          const newDescElement = document.createElement('p');
          newDescElement.className = 'product-description';
          newDescElement.textContent = template.description;
          
          // Insert before the button
          const button = card.querySelector('.add-to-cart');
          if (button) {
            card.insertBefore(newDescElement, button);
          } else {
            card.appendChild(newDescElement);
          }
        }
      }
    }
  });
}