const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8000';

async function testFallbackResponses() {
  console.log('🧪 Testing Fallback Response System...\n');
  
  const testBusiness = {
    businessName: 'Fallback Test Business',
    email: 'fallback@test.com',
    password: 'password123',
    phone: '1234567890',
    address: '123 Test St'
  };
  
  try {
    // Setup
    console.log('Setting up test environment...');
    await axios.post(`${BASE_URL}/auth/register`, testBusiness);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testBusiness.email,
      password: testBusiness.password
    });
    const token = loginResponse.data.token;
    
    const onboardingData = {
      businessType: 'Hair Salon',
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
    
    await axios.post(`${BASE_URL}/onboarding`, onboardingData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    await axios.post(`${BASE_URL}/context/load`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Test environment ready\n');
    
    // Test different message types to see fallback responses
    const testMessages = [
      'Hello!',
      'What services do you offer?',
      'What are your hours?',
      'I want to book a haircut',
      'How much does hair color cost?',
      'Can you help me reschedule my appointment?'
    ];
    
    console.log('Testing fallback responses (expecting 402 errors due to credits):\n');
    
    for (const message of testMessages) {
      try {
        const response = await axios.post(`${BASE_URL}/chat`, {
          message
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`Message: "${message}"`);
        console.log(`Response: ${response.data.reply}`);
        
        if (response.data.fallback) {
          console.log('✅ Fallback response used successfully');
        } else {
          console.log('✅ AI response (credits available!)');
        }
        
      } catch (error) {
        console.log(`Message: "${message}"`);
        console.log(`❌ Error: ${error.response?.data?.error || error.message}`);
      }
      
      console.log('---');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }
    
    console.log('\n🎉 Fallback testing completed!');
    
  } catch (error) {
    console.error('❌ Setup error:', error.response?.data || error.message);
  }
}

testFallbackResponses();