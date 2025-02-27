const express = require('express');
const resumeController = require('../controllers/resumeControl');

const router = express.Router();

router.post('/', resumeController.createResume);
router.put('/:id', resumeController.updateResume);
router.get('/:id', resumeController.getResumeById);

module.exports = router;