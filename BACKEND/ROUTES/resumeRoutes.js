const express = require('express');
const router = express.Router();
const resumeController = require('../CONTROLLERS/resumeControl');
const { authenticate } = require('../MIDDLEWARE/auth_Middleware');

// Create a new resume
router.post('/', authenticate, resumeController.createResume);

// Get all resumes for current user
router.get('/', authenticate, resumeController.getUserResumes);

// Get a specific resume
router.get('/:id', authenticate, resumeController.getResumeById);

// Update a resume
router.put('/:id', authenticate, resumeController.updateResume);

// Download resume as PDF
router.get('/:id/download', authenticate, resumeController.downloadResume);

module.exports = router;