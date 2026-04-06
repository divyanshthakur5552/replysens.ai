const express = require('express');
const router = express.Router();
const { getGeminiHealth } = require('../services/geminiService');
const { validateAPIKey } = require('../../ai-config');

// Health check endpoint for AI service
router.get('/ai', async (req, res) => {
  try {
    // Validate API key
    const apiKey = validateAPIKey();
    
    // Get health status
    const health = getGeminiHealth();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Google Gemini AI',
      apiKeyStatus: 'valid',
      ...health
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'Google Gemini AI',
      error: error.message,
      apiKeyStatus: error.message.includes('API') ? 'invalid' : 'unknown'
    });
  }
});

// General health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ReplySense AI Backend',
    version: '1.0.0'
  });
});

module.exports = router;