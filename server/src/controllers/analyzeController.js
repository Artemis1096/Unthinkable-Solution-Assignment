const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const Analysis = require('../models/Analysis');
const { analyzeWithLLM } = require('../services/llmService');

// Helper to generate suggestions based on heuristics
const generateSuggestions = (text) => {
    const suggestions = [];

    // 1. Length Check
    if (text.length < 50) {
        suggestions.push("Make the post longer with more context.");
    }

    // 2. Hashtag Check
    if (!text.includes('#')) {
        suggestions.push("Add 1-3 relevant hashtags.");
    }

    // 3. Question Mark Check
    if (!text.includes('?')) {
        suggestions.push("Add a question to invite engagement.");
    }

    // 4. Call-to-Action (CTA) Check
    const ctaWords = ['follow', 'share', 'comment', 'like', 'save', 'link in bio'];
    const lowerText = text.toLowerCase();
    const hasCTA = ctaWords.some(word => lowerText.includes(word));
    if (!hasCTA) {
        suggestions.push("Add a call-to-action (e.g., 'Follow for more', 'Share this').");
    }

    return suggestions;
};

// @desc    Upload file, extract text, and analyze
// @route   POST /api/analyze/upload
// @access  Public
const uploadAndAnalyze = async (req, res, next) => {
    let filePath = null;

    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        filePath = req.file.path;
        const mimeType = req.file.mimetype;
        let extractedText = '';
        let fileType = 'unknown';

        // Text Extraction
        if (mimeType === 'application/pdf') {
            fileType = 'pdf';
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            extractedText = data.text;
        } else if (mimeType.startsWith('image/')) {
            fileType = 'image';
            // Use Tesseract.js for OCR on images
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
            extractedText = text;
        } else {
            res.status(400);
            throw new Error('Unsupported file type');
        }

        // Clean and Validate Text
        extractedText = extractedText.trim();
        if (!extractedText) {
            res.status(422); // Unprocessable Entity
            throw new Error('Could not extract any text from the file (result was empty).');
        }

        // Generate Basic Suggestions
        let suggestions = generateSuggestions(extractedText);
        let llmResult = null;

        // Check if LLM analysis is requested
        // Note: req.body fields are strings in multipart/form-data
        if (req.body.useLLM === 'true') {
            try {
                llmResult = await analyzeWithLLM({
                    text: extractedText,
                    filePath,
                    mimeType
                });

                if (llmResult) {
                    // Merge LLM suggestions
                    if (llmResult.suggestions && Array.isArray(llmResult.suggestions)) {
                        suggestions = [...suggestions, ...llmResult.suggestions];
                    }
                }
            } catch (llmError) {
                console.error("LLM Analysis failed, proceeding with basic analysis:", llmError.message);
                // We don't fail the whole request, just skip LLM part
                suggestions.push("AI Analysis failed. Showing basic suggestions only.");
            }
        }

        // Save to DB
        const analysisData = {
            fileName: req.file.originalname,
            fileType: fileType,
            text: extractedText,
            suggestions: suggestions,
        };

        if (llmResult) {
            analysisData.llmSentiment = llmResult.sentiment;
            analysisData.llmClarityScore = llmResult.clarityScore;
            analysisData.llmImprovedCaption = llmResult.improvedCaption;
        }

        const analysis = await Analysis.create(analysisData);

        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Construct Response
        const responseData = {
            id: analysis._id,
            fileName: analysis.fileName,
            fileType: analysis.fileType,
            text: analysis.text,
            suggestions: analysis.suggestions,
            createdAt: analysis.createdAt,
        };

        if (llmResult) {
            responseData.llm = {
                sentiment: analysis.llmSentiment,
                clarityScore: analysis.llmClarityScore,
                improvedCaption: analysis.llmImprovedCaption,
            };
        }

        res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        // Cleanup file on error
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                console.error('Failed to delete file after error:', unlinkError);
            }
        }
        next(error);
    }
};

// @desc    Get recent analyses
// @route   GET /api/analyze/recent
// @access  Public
const getRecentAnalyses = async (req, res, next) => {
    try {
        const analyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('-text'); // Exclude full text to keep payload small

        res.status(200).json({
            success: true,
            data: analyses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear all analyses
// @route   DELETE /api/analyze/clear
// @access  Public
const clearAllAnalyses = async (req, res, next) => {
    try {
        await Analysis.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'All analyses cleared successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadAndAnalyze, getRecentAnalyses, clearAllAnalyses };

