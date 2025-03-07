const puppeteer = require('puppeteer');

const Resume = require('../MODELS/resume');
const Template = require('../MODELS/template');



// Create a new resume
exports.createResume = async (req, res) => {
    try {
        const { userId, templateId, personalInfo, education, experience, certifications, references } = req.body;

        const newResume = new Resume({
            userId,
            templateId,
            personalInfo,
            education,
            experience,
            certifications,
            references,
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

// save a resume
exports.saveResume = async (req, res) => {
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

// Download resume as PDF
exports.downloadResume = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id).populate('templateId').populate('userId');

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Generate HTML content for the resume
        const htmlContent = `
            <h1>${resume.personalInfo.fullName}</h1>
            <p>Email: ${resume.personalInfo.email}</p>
            <p>Phone: ${resume.personalInfo.phone}</p>
            <h2>Education</h2>
            ${resume.education.map(edu => `
                <h3>${edu.institution}</h3>
                <p>Degree: ${edu.degree}</p>
                <p>Field of Study: ${edu.fieldOfStudy}</p>
                <p>Dates: ${edu.startDate} - ${edu.endDate}</p>
                <p>Description: ${edu.description}</p>
            `).join('')}
            <h2>Experience</h2>
            ${resume.experience.map(exp => `
                <h3>${exp.company}</h3>
                <p>Position: ${exp.position}</p>
                <p>Dates: ${exp.startDate} - ${exp.endDate}</p>
                <p>Description: ${exp.description}</p>
            `).join('')}
        `;

        // Use Puppeteer to generate PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Send the PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${resume.personalInfo.fullName}_Resume.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error });
    }
};