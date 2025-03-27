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
        jobTitle: String,
        email: String,
        phone: String,
        location: String,
        website: String
    },
    summary: String,
    experience: [
        {
            company: String,
            jobTitle: String,
            startDate: String,  // Changed from Date to String for flexibility
            endDate: String,    // Changed from Date to String to allow "Present"
            description: String,
        },
    ],
    education: [
        {
            institution: String,
            degree: String,
            startYear: String,  // Already String type
            endYear: String,    // Already String type
            gpa: String,
            description: String
        },
    ],
    skills: [String],
    customSections: [
        {
            title: String,
            content: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Export the model
module.exports = mongoose.model('Resume', resumeSchema);