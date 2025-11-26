const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true, // e.g., "pdf", "image"
    },
    text: {
        type: String,
        required: true, // extracted text
    },
    suggestions: {
        type: [String], // list of engagement suggestions
        default: [],
    },
    // LLM Fields
    llmSentiment: {
        type: String,
        default: null,
    },
    llmClarityScore: {
        type: Number,
        default: null,
    },
    llmImprovedCaption: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Analysis', analysisSchema);
