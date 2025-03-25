document.addEventListener('DOMContentLoaded', () => {
    setupAIButtons();
  });
  
  // Set up AI assistance buttons
  function setupAIButtons() {
    const aiButtons = document.querySelectorAll('.button-ai');
    
    aiButtons.forEach(button => {
      button.addEventListener('click', handleAIAssistClick);
    });
  }
  
  // Handle AI assistance button click
  async function handleAIAssistClick(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const textarea = button.previousElementSibling;
    
    if (!textarea || textarea.tagName !== 'TEXTAREA') {
      console.error('AI assist button must be next to a textarea element');
      return;
    }
    
    // Determine context type based on textarea class or id
    let context = 'summary';
    if (textarea.classList.contains('exp-description')) {
      context = 'experience';
    } else if (textarea.id === 'skills') {
      context = 'skills';
    }
    
    // Save original button text and show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;
    
    try {
      // Get prompt content - use existing text or create default prompt
      const prompt = textarea.value || getDefaultPrompt(context, textarea);
      
      // Call AI service
      const result = await getAIResponse(prompt, context);
      
      // Update textarea with result
      textarea.value = result;
      
      // Trigger input event to update preview
      textarea.dispatchEvent(new Event('input'));
      
      // Success feedback
      button.textContent = '✓ Done';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('AI error:', error);
      
      // Error feedback
      button.textContent = 'Error - Try Again';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }
  
  // Get default prompts based on context and form data
  function getDefaultPrompt(context, textarea) {
    // Get relevant information from the form
    const fullName = document.getElementById('full-name')?.value || '';
    const jobTitle = document.getElementById('job-title')?.value || '';
    
    // For experience sections, get more context from parent elements
    let company = '';
    let position = '';
    
    if (context === 'experience') {
      const experienceEntry = textarea.closest('.experience-entry');
      if (experienceEntry) {
        company = experienceEntry.querySelector('.exp-company')?.value || '';
        position = experienceEntry.querySelector('.exp-title')?.value || '';
      }
    }
    
    // Context-specific default prompts
    const prompts = {
      summary: `Write a professional summary for ${fullName || 'a professional'} seeking a ${jobTitle || 'position'}. Focus on key strengths, experience, and career achievements. Keep it to 3-4 sentences maximum.`,
      experience: `Write 3-4 bullet points for a ${position || 'professional'} role at ${company || 'a company'}. Include achievements with quantifiable results where possible. Start each bullet with a strong action verb.`,
      skills: `List relevant technical and soft skills for a ${jobTitle || 'professional'} position, separated by commas. Include 8-12 skills that are most in-demand for this role.`
    };
    
    return prompts[context] || prompts.summary;
  }
  
  // Call AI service API
  async function getAIResponse(prompt, context) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in to use AI features.');
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
      throw new Error('Unable to generate content. Please try again or modify your prompt.');
    }
  }