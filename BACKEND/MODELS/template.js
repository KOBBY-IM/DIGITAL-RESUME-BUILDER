const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true }, // URL to the template preview image
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Template', templateSchema);