const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8000';

async function testChatFlow() {
  console.log('🧪 Simple Chat Test...\n');
  
  const testBusiness = {
    businessName: 'Simple Test Business',
    email: 'simple@test.com',
    password: 'password123',
    phone: '1234567890',
    address: '123 Test St'
  };
  
  try {
    // 1. Register
    console.log('1. Registering...');
    await axios.post(`${BASE_URL}/auth/register`, testBusiness);
    console.log('✅ Registered');
    
    // 2. Login
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testBusiness.email,
      password: testBusiness.password
    });
    const token = loginResponse.data.token;
    console.log('✅ Logged in');
    
    // 3. Load context via onboarding (this should work)
    console.log('3. Loading context via onboarding...');
    const onboardingData = {
      businessType: 'Salon',
      tone: 'friendly',
      services: [
        { name: 'Haircut', duration: 30, price: 25 }
      ],
      workingHours: {
        start: '09:00',
        end: '18:00'
      }
    };
    
    await axios.post(`${BASE_URL}/onboarding`, onboardingData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Onboarding completed');
    
    // 4. Load context to Redis
    console.log('4. Loading context to Redis...');
    await axios.post(`${BASE_URL}/context/load`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Context loaded to Redis');
    
    // 5. Test chat
    console.log('5. Testing chat...');
    const chatResponse = await axios.post(`${BASE_URL}/chat`, {
      message: 'Hello!'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Chat successful!');
    console.log('Response:', chatResponse.data.reply);
    
    if (chatResponse.data.fallback) {
      console.log('⚠️  Used fallback response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testChatFlow();