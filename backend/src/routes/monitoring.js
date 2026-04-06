const router = require("express").Router();
const auth = require("../middleware/auth");
const { apiHealth, requestTracker, validateAPIKey } = require("../../ai-config");
const axios = require("axios");

// Get AI API health status
router.get("/ai-health", auth, (req, res) => {
  const healthStats = apiHealth.getHealthStats();
  const isHealthy = apiHealth.isHealthy();
  
  res.json({
    status: isHealthy ? "healthy" : "degraded",
    ...healthStats,
    rateLimitInfo: {
      requestsInWindow: requestTracker.requests.length,
      canMakeRequest: requestTracker.canMakeRequest(),
      waitTime: requestTracker.getWaitTime()
    }
  });
});

// Test AI API connectivity
router.post("/test-ai", auth, async (req, res) => {
  try {
    validateAPIKey();
    
    const testResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: "Hello, this is a connectivity test. Please respond with 'OK'." }
        ],
        max_tokens: 10
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "HTTP-Referer": "http://localhost",
          "X-Title": "ReplySense AI"
        },
        timeout: 10000
      }
    );
    
    apiHealth.recordSuccess();
    
    res.json({
      status: "success",
      message: "AI API is responding correctly",
      response: testResponse.data.choices[0].message.content,
      timestamp: new Date()
    });
    
  } catch (error) {
    apiHealth.recordFailure(error);
    
    res.status(500).json({
      status: "error",
      message: "AI API test failed",
      error: {
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message
      },
      timestamp: new Date()
    });
  }
});

// Reset health statistics
router.post("/reset-health", auth, (req, res) => {
  apiHealth.totalRequests = 0;
  apiHealth.successfulRequests = 0;
  apiHealth.failedRequests = 0;
  apiHealth.lastError = null;
  apiHealth.lastSuccess = null;
  
  requestTracker.requests = [];
  
  res.json({
    message: "Health statistics reset",
    timestamp: new Date()
  });
});

module.exports = router;