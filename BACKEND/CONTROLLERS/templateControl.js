const mongoose = require('mongoose');
const Template = require('../MODELS/template');

// Get all templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find();
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid template ID' });
        }

        const template = await Template.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ message: 'Error fetching template', error: error.message });
    }
};

// Create a new template
exports.createTemplate = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newTemplate = new Template({ name, description });
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ message: 'Error creating template', error: error.message });
    }
};