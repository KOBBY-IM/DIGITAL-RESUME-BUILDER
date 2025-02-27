const Template = require('../models/template');

exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error });
    }
};