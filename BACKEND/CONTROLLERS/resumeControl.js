const Resume = require('../MODELS/resume');
const PDFGenerator = require('../UTILS/pdfGenerator');
const mongoose = require('mongoose');

// Create a new resume
exports.createResume = async (req, res) => {
  try {
    const { personalInfo, summary, experience, education, skills } = req.body;
    
    if (!personalInfo || !personalInfo.fullName) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name is required' 
      });
    }

    const newResume = new Resume({
      userId: req.userId,
      personalInfo,
      summary,
      experience: Array.isArray(experience) ? experience : [],
      education: Array.isArray(education) ? education : [],
      skills: Array.isArray(skills) ? skills : [],
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

    const pdf = await PDFGenerator.generatePDF(resume);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating PDF: ' + error.message
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
    
    const updateData = req.body;
    
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