// AI API Configuration and Monitoring
require('dotenv').config();

const AI_CONFIG = {
  // Google Gemini SDK Configuration
  provider: 'google-gemini',
  model: 'gemini-2.5-flash',
  timeout: 30000, // 30 seconds
  
  // Retry Configuration
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  
  // Rate Limiting
  requestsPerMinute: 60, // Gemini has higher rate limits
  requestWindow: 60000, // 1 minute
  
  // Fallback Configuration
  enableFallback: true,
  fallbackResponses: {
    greeting: "Hello! I'm here to help you with bookings and questions about our services.",
    booking: "I'd be happy to help you book an appointment. What service are you interested in?",
    hours: "I can help you with our business hours and availability. What would you like to know?",
    services: "We offer various services. Let me help you find the right one for you.",
    default: "I'm here to help! You can ask me about our services, book appointments, or get information about our business."
  }
};

// Request tracking for rate limiting
const requestTracker = {
  requests: [],
  
  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < AI_CONFIG.requestWindow);
    
    return this.requests.length < AI_CONFIG.requestsPerMinute;
  },
  
  recordRequest() {
    this.requests.push(Date.now());
  },
  
  getWaitTime() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const waitTime = AI_CONFIG.requestWindow - (Date.now() - oldestRequest);
    
    return Math.max(0, waitTime);
  }
};

// API Health Monitoring
const apiHealth = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastError: null,
  lastSuccess: null,
  
  recordSuccess() {
    this.totalRequests++;
    this.successfulRequests++;
    this.lastSuccess = new Date();
  },
  
  recordFailure(error) {
    this.totalRequests++;
    this.failedRequests++;
    this.lastError = {
      timestamp: new Date(),
      error: error.message || error,
      status: error.status
    };
  },
  
  getHealthStats() {
    const successRate = this.totalRequests > 0 
      ? ((this.successfulRequests / this.totalRequests) * 100).toFixed(2)
      : 0;
      
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: `${successRate}%`,
      lastSuccess: this.lastSuccess,
      lastError: this.lastError
    };
  },
  
  isHealthy() {
    if (this.totalRequests === 0) return true;
    
    const successRate = (this.successfulRequests / this.totalRequests) * 100;
    return successRate >= 80; // Consider healthy if 80%+ success rate
  }
};

// Validation functions
function validateAPIKey() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️  API key format may be incorrect. Expected format: AIza...');
  }
  
  return apiKey;
}

function validateEnvironment() {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_GEMINI_API_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
}

// Export configuration and utilities
module.exports = {
  AI_CONFIG,
  requestTracker,
  apiHealth,
  validateAPIKey,
  validateEnvironment
};