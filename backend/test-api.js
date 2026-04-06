const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:8000';
const TEST_RESULTS_FILE = 'test-results.json';

// Test data
const testBusiness = {
  businessName: 'Test Business API',
  email: 'test@apitesting.com',
  password: 'testpassword123',
  phone: '1234567890',
  address: '123 Test Street'
};

const testOnboardingData = {
  businessType: 'Restaurant',
  tone: 'friendly',
  services: [
    { name: 'Dining', duration: 60, price: 25 },
    { name: 'Takeout', duration: 15, price: 20 }
  ],
  workingHours: {
    start: '09:00',
    end: '21:00'
  },
  sessionDuration: 30
};

const testSlots = {
  date: '2026-03-15',
  slots: [
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '14:00', available: false }
  ]
};

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: []
};

let authToken = null;

// Helper functions
function logTest(endpoint, method, status, message, data = null) {
  const result = {
    endpoint,
    method,
    status,
    message,
    timestamp: new Date().toISOString(),
    data
  };
  
  testResults.results.push(result);
  testResults.totalTests++;
  
  if (status === 'PASS') {
    testResults.passedTests++;
    console.log(`✅ ${method} ${endpoint}: ${message}`);
  } else {
    testResults.failedTests++;
    console.log(`❌ ${method} ${endpoint}: ${message}`);
  }
}

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

// Test functions
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success && result.data.status === 'Backend running') {
    logTest('/health', 'GET', 'PASS', 'Health check successful', result.data);
  } else {
    logTest('/health', 'GET', 'FAIL', `Health check failed: ${result.error}`, result.error);
  }
}

async function testAuthEndpoints() {
  console.log('\n🔍 Testing Authentication Endpoints...');
  
  // Test registration
  const registerResult = await makeRequest('POST', '/auth/register', testBusiness);
  
  if (registerResult.success) {
    logTest('/auth/register', 'POST', 'PASS', 'Business registration successful', registerResult.data);
  } else {
    logTest('/auth/register', 'POST', 'FAIL', `Registration failed: ${registerResult.error}`, registerResult.error);
  }
  
  // Test login
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testBusiness.email,
    password: testBusiness.password
  });
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    logTest('/auth/login', 'POST', 'PASS', 'Login successful', { hasToken: true });
  } else {
    logTest('/auth/login', 'POST', 'FAIL', `Login failed: ${loginResult.error}`, loginResult.error);
  }
  
  // Test get me (requires auth)
  if (authToken) {
    const meResult = await makeRequest('GET', '/auth/me', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (meResult.success) {
      logTest('/auth/me', 'GET', 'PASS', 'Get user info successful', meResult.data);
    } else {
      logTest('/auth/me', 'GET', 'FAIL', `Get user info failed: ${meResult.error}`, meResult.error);
    }
  }
}

async function testOnboardingEndpoints() {
  console.log('\n🔍 Testing Onboarding Endpoints...');
  
  if (!authToken) {
    logTest('/onboarding', 'POST', 'SKIP', 'Skipped - no auth token available');
    return;
  }
  
  const result = await makeRequest('POST', '/onboarding', testOnboardingData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    logTest('/onboarding', 'POST', 'PASS', 'Onboarding data saved successfully', result.data);
  } else {
    logTest('/onboarding', 'POST', 'FAIL', `Onboarding failed: ${result.error}`, result.error);
  }
}

async function testContextEndpoints() {
  console.log('\n🔍 Testing Context Endpoints...');
  
  if (!authToken) {
    logTest('/context/*', 'ALL', 'SKIP', 'Skipped - no auth token available');
    return;
  }
  
  // Test load context
  const loadResult = await makeRequest('POST', '/context/load', {
    contextData: 'Test context data for API testing'
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (loadResult.success) {
    logTest('/context/load', 'POST', 'PASS', 'Context loaded successfully', loadResult.data);
  } else {
    logTest('/context/load', 'POST', 'FAIL', `Context load failed: ${loadResult.error}`, loadResult.error);
  }
  
  // Test get context
  const getResult = await makeRequest('GET', '/context', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (getResult.success) {
    logTest('/context', 'GET', 'PASS', 'Context retrieved successfully', getResult.data);
  } else {
    logTest('/context', 'GET', 'FAIL', `Context retrieval failed: ${getResult.error}`, getResult.error);
  }
}

async function testBookingEndpoints() {
  console.log('\n🔍 Testing Booking Endpoints...');
  
  if (!authToken) {
    logTest('/booking/*', 'ALL', 'SKIP', 'Skipped - no auth token available');
    return;
  }
  
  const authHeaders = { 'Authorization': `Bearer ${authToken}` };
  
  // Test set slots
  const setSlotsResult = await makeRequest('POST', '/booking/slots', testSlots, authHeaders);
  if (setSlotsResult.success) {
    logTest('/booking/slots', 'POST', 'PASS', 'Slots set successfully', setSlotsResult.data);
  } else {
    logTest('/booking/slots', 'POST', 'FAIL', `Set slots failed: ${setSlotsResult.error}`, setSlotsResult.error);
  }
  
  // Test get slots
  const getSlotsResult = await makeRequest('GET', '/booking/slots', null, authHeaders);
  if (getSlotsResult.success) {
    logTest('/booking/slots', 'GET', 'PASS', 'Slots retrieved successfully', getSlotsResult.data);
  } else {
    logTest('/booking/slots', 'GET', 'FAIL', `Get slots failed: ${getSlotsResult.error}`, getSlotsResult.error);
  }
  
  // Test dashboard endpoints
  const dashboardEndpoints = [
    '/booking/all',
    '/booking/today', 
    '/booking/upcoming',
    '/booking/calendar',
    '/booking/stats',
    '/booking/chart-data',
    '/booking/services-breakdown',
    '/booking/status-breakdown'
  ];
  
  for (const endpoint of dashboardEndpoints) {
    const result = await makeRequest('GET', endpoint, null, authHeaders);
    if (result.success) {
      logTest(endpoint, 'GET', 'PASS', 'Data retrieved successfully', result.data);
    } else {
      logTest(endpoint, 'GET', 'FAIL', `Failed: ${result.error}`, result.error);
    }
  }
  
  // Test debug endpoints
  const debugResult = await makeRequest('GET', '/booking/debug', null, authHeaders);
  if (debugResult.success) {
    logTest('/booking/debug', 'GET', 'PASS', 'Debug info retrieved', debugResult.data);
  } else {
    logTest('/booking/debug', 'GET', 'FAIL', `Debug failed: ${debugResult.error}`, debugResult.error);
  }
  
  const debugStateResult = await makeRequest('GET', '/booking/debug/state', null, authHeaders);
  if (debugStateResult.success) {
    logTest('/booking/debug/state', 'GET', 'PASS', 'Debug state retrieved', debugStateResult.data);
  } else {
    logTest('/booking/debug/state', 'GET', 'FAIL', `Debug state failed: ${debugStateResult.error}`, debugStateResult.error);
  }
}

async function testChatEndpoints() {
  console.log('\n🔍 Testing Chat Endpoints...');
  
  if (!authToken) {
    logTest('/chat', 'POST', 'SKIP', 'Skipped - no auth token available');
    return;
  }
  
  // First load context with proper business data
  const contextData = {
    businessType: 'Restaurant',
    tone: 'friendly',
    services: [
      { name: 'Dining', duration: 60, price: 25 },
      { name: 'Takeout', duration: 15, price: 20 }
    ],
    workingHours: {
      start: '09:00',
      end: '21:00'
    }
  };
  
  const contextResult = await makeRequest('POST', '/context/load', contextData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (!contextResult.success) {
    logTest('/chat', 'POST', 'FAIL', `Failed to load context for chat test: ${contextResult.error}`);
    return;
  }
  
  const chatResult = await makeRequest('POST', '/chat', {
    message: 'Hello, this is a test message for API testing'
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (chatResult.success) {
    logTest('/chat', 'POST', 'PASS', 'Chat message processed successfully', chatResult.data);
  } else {
    logTest('/chat', 'POST', 'FAIL', `Chat failed: ${chatResult.error}`, chatResult.error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Testing...');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('=' * 50);
  
  try {
    await testHealthEndpoint();
    await testAuthEndpoints();
    await testOnboardingEndpoints();
    await testContextEndpoints();
    await testBookingEndpoints();
    await testChatEndpoints();
    
    // Generate summary
    console.log('\n' + '=' * 50);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 50);
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests} ✅`);
    console.log(`Failed: ${testResults.failedTests} ❌`);
    console.log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(2)}%`);
    
    // Save results to file
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Detailed results saved to: ${TEST_RESULTS_FILE}`);
    
    if (testResults.failedTests > 0) {
      console.log('\n❌ Some tests failed. Check the results above for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed successfully!');
    }
    
  } catch (error) {
    console.error('💥 Test runner error:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();