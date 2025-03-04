const express = require('express');
const templateController = require('../CONTROLLERS/templateControl');

const router = express.Router();

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

module.exports = router;