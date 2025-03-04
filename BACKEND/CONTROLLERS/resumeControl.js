const Resume = require('../MODELS/resume');
const Template = require('../MODELS/template');

// Create a new resume based on a selected template
exports.createResume = async (req, res) => {
    try {
        const { userId, templateId } = req.body;

        // Check if the template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Create a new resume
        const newResume = new Resume({
            userId,
            templateId,
            personalInfo: {},
            education: [],
            experience: [],
            skills: [],
        });

        await newResume.save();
        res.status(201).json(newResume);
    } catch (error) {
        res.status(500).json({ message: 'Error creating resume', error });
    }
};

// Update a resume
exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedResume = await Resume.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(updatedResume);
    } catch (error) {
        res.status(500).json({ message: 'Error updating resume', error });
    }
};

// Fetch a resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resume', error });
    }
};