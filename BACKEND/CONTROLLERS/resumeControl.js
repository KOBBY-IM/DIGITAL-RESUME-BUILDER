const Resume = require('../MODELS/resume');
const PDFGenerator = require('../UTILS/pdfGenerator');
const mongoose = require('mongoose');

// Create a new resume
exports.createResume = async (req, res) => {
  try {
    const { personalInfo, summary, experience, education, skills, customSections } = req.body;
    
    if (!personalInfo || !personalInfo.fullName) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name is required' 
      });
    }

    // Process experience data to ensure dates are strings
    const processedExperience = Array.isArray(experience) 
      ? experience.map(exp => ({
          company: exp.company || '',
          jobTitle: exp.jobTitle || '',
          startDate: exp.startDate ? String(exp.startDate) : '',
          endDate: exp.endDate ? String(exp.endDate) : '',
          description: exp.description || ''
        }))
      : [];

    // Process education data to ensure years are strings
    const processedEducation = Array.isArray(education)
      ? education.map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          startYear: edu.startYear ? String(edu.startYear) : '',
          endYear: edu.endYear ? String(edu.endYear) : '',
          gpa: edu.gpa || '',
          description: edu.description || ''
        }))
      : [];

    const newResume = new Resume({
      userId: req.userId,
      personalInfo,
      summary,
      experience: processedExperience,
      education: processedEducation,
      skills: Array.isArray(skills) ? skills : [],
      customSections: Array.isArray(customSections) ? customSections : [],
      lastUpdated: new Date()
    });

    await newResume.save();
    
    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: newResume
    });
  } catch (error) {
    console.error('Create resume error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating resume', 
    });
  }
};

// Get all resumes for a user
exports.getUserResumes = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const resumes = await Resume.find({ userId: req.userId })
      .sort({ lastUpdated: -1 })
      .select('personalInfo.jobTitle personalInfo.fullName lastUpdated')
      .lean()
      .limit(20);
      
    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching resumes'
    });
  }
};



// Download resume as PDF
exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume ID' 
      });
    }
    
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }
    
    if (resume.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    // Generate PDF
    const pdf = await PDFGenerator.generatePDF(resume);
    
    // Sanitize filename
    const filename = (resume.personalInfo.fullName || 'resume')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase() + '_resume.pdf';

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    
    // Send PDF buffer directly
    res.send(pdf);
  } catch (error) {
    console.error('Download resume error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error generating PDF: ' + error.message,
      errorDetails: process.env.NODE_ENV === 'development' 
        ? { 
            name: error.name, 
            message: error.message, 
            stack: error.stack 
          } 
        : undefined
    });
  }
};

// Update a resume
exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume ID' 
      });
    }
    
    // Get update data and process dates
    const updateData = { ...req.body };
    
    // Process experience data to ensure dates are strings
    if (Array.isArray(updateData.experience)) {
      updateData.experience = updateData.experience.map(exp => ({
        ...exp,
        startDate: exp.startDate ? String(exp.startDate) : '',
        endDate: exp.endDate ? String(exp.endDate) : ''
      }));
    }
    
    // Process education data to ensure years are strings
    if (Array.isArray(updateData.education)) {
      updateData.education = updateData.education.map(edu => ({
        ...edu,
        startYear: edu.startYear ? String(edu.startYear) : '',
        endYear: edu.endYear ? String(edu.endYear) : ''
      }));
    }
    
    // Add lastUpdated date
    updateData.lastUpdated = new Date();

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }

    if (resume.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    });
  } catch (error) {
    console.error('Update resume error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating resume'
    });
  }
};

// Get resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume ID' 
      });
    }
    
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }
    
    if (resume.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching resume'
    });
  }
};

// Delete a resume
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume ID' 
      });
    }
    
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }
    
    if (resume.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    await Resume.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting resume'
    });
  }
};