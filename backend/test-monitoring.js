const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8000';

async function testMonitoring() {
  console.log('🔍 Testing Monitoring Endpoints...\n');
  
  try {
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@apitesting.com',
      password: 'testpassword123'
    });
    
    const token = loginResponse.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Test AI health endpoint
    console.log('Testing AI Health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/monitoring/ai-health`, { headers });
    console.log('✅ AI Health Response:');
    console.log(JSON.stringify(healthResponse.data, null, 2));
    
    // Test AI connectivity
    console.log('\nTesting AI connectivity...');
    const testResponse = await axios.post(`${BASE_URL}/monitoring/test-ai`, {}, { headers });
    console.log('✅ AI Test Response:');
    console.log(JSON.stringify(testResponse.data, null, 2));
    
    console.log('\n🎉 All monitoring endpoints working!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMonitoring();