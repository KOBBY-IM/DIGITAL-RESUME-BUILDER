/**
 * AI Assistance Controller - Unified approach for all templates
 */
const AIAssistController = {
  // Context sensitive prompt generation
  generatePrompt(context, formData) {
      // Default fallback prompts
      const defaultPrompts = {
          summary: "Write a professional summary highlighting core competencies and career achievements in 3-4 sentences. Avoid first-person pronouns.",
          experience: "Create 3-4 bullet points for job responsibilities and achievements. Start with strong action verbs and focus on quantifiable results.",
          education: "Write a brief description of academic achievements, relevant coursework, and extracurricular activities.",
          skills: "List relevant technical and soft skills for this profession as comma-separated values."
      };

      // Personal info context if available
      const personalInfo = {
          name: formData.fullName || '',
          title: formData.jobTitle || '',
          industry: this.inferIndustry(formData) || ''
      };

      // Context-specific prompt generation
      switch (context) {
          case 'summary':
              return `Write a professional summary for ${personalInfo.name || 'a candidate'} 
                      seeking a ${personalInfo.title || 'professional'} position 
                      ${personalInfo.industry ? 'in the ' + personalInfo.industry + ' industry' : ''}. 
                      Focus on key skills, expertise, and career highlights. Keep it to 3-4 sentences. 
                      Avoid first-person pronouns.`;
          
          case 'experience':
              const jobTitle = formData.jobTitle || '';
              const company = formData.company || '';
              const industry = personalInfo.industry || '';
              
              return `Create 3-4 bullet points for a ${jobTitle || 'professional'} role 
                      at ${company || 'a company'} ${industry ? 'in the ' + industry + ' industry' : ''}. 
                      Start each bullet with a strong action verb. Include specific achievements 
                      with quantifiable results where possible (percentages, numbers, metrics). 
                      Focus on impact and outcomes rather than just responsibilities.`;
          
          case 'education':
              const degree = formData.degree || '';
              const institution = formData.institution || '';
              
              return `Write a brief description for ${degree || 'a degree'} from 
                      ${institution || 'a university'}. Highlight academic achievements, 
                      relevant coursework, and any extracurricular activities that demonstrate 
                      skills relevant to ${personalInfo.title || 'the professional field'}.`;
          
          case 'skills':
              return `List 8-12 relevant skills for a ${personalInfo.title || 'professional'} 
                      ${personalInfo.industry ? 'in the ' + industry + ' industry' : ''} 
                      as comma-separated values. Include a mix of technical skills, 
                      soft skills, and industry-specific competencies. Prioritize skills 
                      that are currently in-demand for this field.`;
              
          default:
              return defaultPrompts[context] || defaultPrompts.summary;
      }
  },

  // Infer industry from job title and other information
  inferIndustry(formData) {
      const jobTitle = (formData.jobTitle || '').toLowerCase();
      const experienceText = (formData.experienceText || '').toLowerCase();
      
      // Very basic industry inference
      const industryKeywords = {
          'technology': ['developer', 'engineer', 'software', 'it', 'tech', 'data', 'web', 'programmer'],
          'healthcare': ['doctor', 'nurse', 'medical', 'healthcare', 'health', 'patient', 'clinical'],
          'finance': ['accountant', 'financial', 'finance', 'banking', 'investment', 'accounting'],
          'education': ['teacher', 'professor', 'instructor', 'education', 'academic', 'school', 'university'],
          'marketing': ['marketing', 'seo', 'social media', 'content', 'brand', 'advertising'],
          'design': ['designer', 'ux', 'ui', 'graphic', 'creative', 'artist'],
          'legal': ['attorney', 'lawyer', 'legal', 'law', 'counsel', 'compliance']
      };
      
      for (const [industry, keywords] of Object.entries(industryKeywords)) {
          for (const keyword of keywords) {
              if (jobTitle.includes(keyword) || experienceText.includes(keyword)) {
                  return industry;
              }
          }
      }
      
      return ''; // No specific industry detected
  },

  // Process AI request with loading state handling
  async requestAIAssistance(button, textarea, context, formData = {}) {
      if (!button || !textarea) {
          console.error('Button or textarea not provided');
          return;
      }
      
      // Save original button state
      const originalHTML = button.innerHTML;
      
      try {
          // Update button to loading state
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
          button.disabled = true;
          
          // Generate appropriate prompt
          const prompt = this.generatePrompt(context, formData);
          
          // Request AI assistance
          const result = await TemplateCore.getAIAssistance(prompt, context);
          
          // Update textarea with result
          textarea.value = result;
          
          // Trigger input event to update preview
          textarea.dispatchEvent(new Event('input'));
          
          // Success state
          button.innerHTML = '<i class="fas fa-check"></i> Done!';
          setTimeout(() => {
              button.innerHTML = originalHTML;
              button.disabled = false;
          }, 2000);
          
          return result;
      } catch (error) {
          console.error('AI assistance error:', error);
          
          // Error state
          button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
          setTimeout(() => {
              button.innerHTML = originalHTML;
              button.disabled = false;
          }, 2000);
          
          throw error;
      }
  }
};