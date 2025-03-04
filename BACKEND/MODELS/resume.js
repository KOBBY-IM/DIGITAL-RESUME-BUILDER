// BACKEND/models/resume.js
const mongoose = require('mongoose');

// Define the Resume schema
const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user who created the resume
        required: true,
        ref: 'User', // Assuming you have a User model
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the template used for the resume
        required: true,
        ref: 'Template', // Assuming you have a Template model
    },
    personalInfo: {
        type: {
            fullName: String,
            email: String,
            phone: String,
            address: String,
            linkedIn: String,
            github: String,
        },
        default: {}, // Default to an empty object
    },
    education: {
        type: [
            {
                institution: String,
                degree: String,
                fieldOfStudy: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],
        default: [], // Default to an empty array
    },
    experience: {
        type: [
            {
                company: String,
                position: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],
        default: [], // Default to an empty array
    },
    skills: {
        type: [String], // Array of strings for skills
        default: [], // Default to an empty array
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to the current date and time
    },
});



// Export the model
module.exports = mongoose.model('Resume', resumeSchema);