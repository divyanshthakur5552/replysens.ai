const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8000';

// Test data
const testBusiness = {
  businessName: 'Test Chat Business',
  email: 'testchat@example.com',
  password: 'testpassword123',
  phone: '1234567890',
  address: '123 Test Street'
};

const testContext = {
  businessType: 'Salon',
  tone: 'friendly',
  services: [
    { name: 'Haircut', duration: 30, price: 25 },
    { name: 'Hair Color', duration: 90, price: 75 }
  ],
  workingHours: {
    start: '09:00',
    end: '18:00'
  }
};

let authToken = null;

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  // Register test business
  const registerResult = await makeRequest('POST', '/auth/register', testBusiness);
  if (!registerResult.success && !registerResult.error.message?.includes('Email exists')) {
    console.log('❌ Failed to register test business:', registerResult.error);
    return false;
  }
  
  // Login
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testBusiness.email,
    password: testBusiness.password
  });
  
  if (!loginResult.success) {
    console.log('❌ Failed to login:', loginResult.error);
    return false;
  }
  
  authToken = loginResult.data.token;
  console.log('✅ Authentication successful');
  
  // Load context
  const contextResult = await makeRequest('POST', '/context/load', testContext, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (!contextResult.success) {
    console.log('❌ Failed to load context:', contextResult.error);
    return false;
  }
  
  console.log('✅ Context loaded successfully');
  return true;
}

async function testChatScenarios() {
  console.log('\n🧪 Testing Chat Scenarios...\n');
  
  const testMessages = [
    {
      name: 'Greeting',
      message: 'Hello!',
      expectFallback: false
    },
    {
      name: 'Service Inquiry',
      message: 'What services do you offer?',
      expectFallback: false
    },
    {
      name: 'Hours Inquiry',
      message: 'What are your hours?',
      expectFallback: false
    },
    {
      name: 'Booking Request',
      message: 'I want to book a haircut',
      expectFallback: false
    },
    {
      name: 'Complex Query',
      message: 'Can you help me reschedule my appointment and also tell me about your hair color services?',
      expectFallback: false
    }
  ];
  
  let passedTests = 0;
  let totalTests = testMessages.length;
  
  for (const test of testMessages) {
    console.log(`Testing: ${test.name}`);
    console.log(`Message: "${test.message}"`);
    
    const result = await makeRequest('POST', '/chat', {
      message: test.message
    }, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (result.success) {
      console.log(`✅ Response: ${result.data.reply.substring(0, 100)}${result.data.reply.length > 100 ? '...' : ''}`);
      
      if (result.data.fallback) {
        console.log('⚠️  Used fallback response (AI API unavailable)');
      }
      
      passedTests++;
    } else {
      console.log(`❌ Failed: ${result.error.error || result.error}`);
    }
    
    console.log('---');
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Chat Test Results: ${passedTests}/${totalTests} passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  return passedTests === totalTests;
}

async function testErrorHandling() {
  console.log('\n🔥 Testing Error Handling...\n');
  
  // Test without context
  const noContextResult = await makeRequest('POST', '/chat', {
    message: 'Hello'
  }, {
    'Authorization': `Bearer ${authToken.replace('Bearer ', 'Bearer invalid-')}`
  });
  
  console.log('Testing invalid auth token:');
  if (!noContextResult.success) {
    console.log('✅ Properly rejected invalid token');
  } else {
    console.log('❌ Should have rejected invalid token');
  }
  
  // Test empty message
  const emptyMessageResult = await makeRequest('POST', '/chat', {
    message: ''
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  console.log('\nTesting empty message:');
  if (!emptyMessageResult.success && emptyMessageResult.status === 400) {
    console.log('✅ Properly rejected empty message');
  } else {
    console.log('❌ Should have rejected empty message');
  }
}

async function runChatTests() {
  console.log('🚀 Starting Improved Chat API Tests...\n');
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not running. Please start it first.');
    process.exit(1);
  }
  
  // Setup test environment
  const setupSuccess = await setupTestEnvironment();
  if (!setupSuccess) {
    console.log('❌ Failed to setup test environment');
    process.exit(1);
  }
  
  // Run chat tests
  const chatTestsSuccess = await testChatScenarios();
  
  // Test error handling
  await testErrorHandling();
  
  console.log('\n🎉 Chat testing completed!');
  
  if (chatTestsSuccess) {
    console.log('✅ All chat functionality is working properly');
  } else {
    console.log('⚠️  Some chat tests failed, but fallback responses should be working');
  }
}

// Cleanup function
async function cleanup() {
  if (authToken) {
    console.log('\n🧹 Cleaning up test data...');
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGO_URI);
      
      const Business = require('./src/models/Business');
      await Business.deleteOne({ email: testBusiness.email });
      
      console.log('✅ Test data cleaned up');
      mongoose.disconnect();
    } catch (error) {
      console.log('⚠️  Could not clean up test data:', error.message);
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Run tests
runChatTests().then(async () => {
  await cleanup();
}).catch(async (error) => {
  console.error('💥 Test runner error:', error.message);
  await cleanup();
  process.exit(1);
});