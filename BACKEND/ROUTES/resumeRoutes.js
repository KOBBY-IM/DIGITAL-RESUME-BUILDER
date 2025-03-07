const express = require('express');
const resumeController = require('../CONTROLLERS/resumeControl');
const authMiddleware = require('../MIDDLEWARE/auth_Middleware');

const router = express.Router();

router.post('/', authMiddleware.authenticate, resumeController.createResume);
router.put('/:id', authMiddleware.authenticate, resumeController.updateResume);
router.get('/:id', resumeController.getResumeById);
router.get('/:id/download', resumeController.downloadResume);


module.exports = router;