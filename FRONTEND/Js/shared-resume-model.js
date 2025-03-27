// Create a core resume data model to be used across all templates
const ResumeModel = {
  // Initial empty state
  createEmpty() {
    return {
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        website: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      customSections: [],
      template: 'template1', // Default template
      lastUpdated: new Date()
    };
  },
  
  // Validate required fields
  validate(resumeData) {
    const errors = {};
    
    // Validate personal info (minimal required fields)
    if (!resumeData.personalInfo.fullName) {
      errors.fullName = 'Full name is required';
    }
    
    // Add more validation rules as needed
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Core functionality for all templates
const TemplateCore = {
  // Save resume to server
  async saveResume(resumeData, resumeId = null) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
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
      
      return await response.json();
    } catch (error) {
      console.error('Resume save error:', error);
      throw error;
    }
  },
  
  // Load resume from server
  async loadResume(resumeId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load resume');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Resume load error:', error);
      throw error;
    }
  },
  
  // AI assistance shared across templates
  async getAIAssistance(prompt, context) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch('/api/auth/ai/assist', {
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
      return data.result || 'No content generated';
    } catch (error) {
      console.error('AI service error:', error);
      throw error;
    }
  },
  
  // Export to PDF
  async exportToPDF(templateId, resumeData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      // Check if resumeData has an ID
      if (!resumeData._id) {
        throw new Error('Resume must be saved before exporting');
      }
      
      const response = await fetch(`/api/resumes/${resumeData._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Handle PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.fullName || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }
};