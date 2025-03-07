// BACKEND/models/resume.js
const mongoose = require('mongoose');

// Define the Resume schema
const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    personalInfo: {
        fullName: String,
        email: String,
        phone: String,
    },
    education: [
        {
            institution: String,
            degree: String,
            graduation: Date,
            gpa: String,
        },
    ],
    experience: [
        {
            company: String,
            jobTitle: String,
            startDate: Date,
            endDate: Date,
            description: String,
        },
    ],
    certifications: [
        {
            certName: String,
            certOrg: String,
            certDate: Date,
        },
    ],
    references: [
        {
            refName: String,
            relationship: String,
            refContact: String,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});



// Export the model
module.exports = mongoose.model('Resume', resumeSchema);