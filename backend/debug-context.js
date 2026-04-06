const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8000';

async function debugContext() {
  console.log('🔍 Debugging context loading...');
  
  // Test business data
  const testBusiness = {
    businessName: 'Debug Test Business',
    email: 'debug@example.com',
    password: 'testpassword123',
    phone: '1234567890',
    address: '123 Test Street'
  };
  
  try {
    // Register
    console.log('1. Registering business...');
    const registerResult = await axios.post(`${BASE_URL}/auth/register`, testBusiness);
    console.log('Register response:', registerResult.data);
  } catch (error) {
    if (error.response?.data?.message?.includes('Email exists')) {
      console.log('Business already exists, continuing...');
    } else {
      console.log('Register error:', error.response?.data);
      return;
    }
  }
  
  try {
    // Login
    console.log('2. Logging in...');
    const loginResult = await axios.post(`${BASE_URL}/auth/login`, {
      email: testBusiness.email,
      password: testBusiness.password
    });
    
    const token = loginResult.data.token;
    console.log('Login successful, token received');
    
    // Load context
    console.log('3. Loading context...');
    const contextData = {
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
    
    const contextResult = await axios.post(`${BASE_URL}/context/load`, contextData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Context load response:', contextResult.data);
    
    // Get context
    console.log('4. Getting context...');
    const getContextResult = await axios.get(`${BASE_URL}/context`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get context response:', getContextResult.data);
    
    // Test chat
    console.log('5. Testing chat...');
    const chatResult = await axios.post(`${BASE_URL}/chat`, {
      message: 'Hello, this is a test'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Chat response:', chatResult.data);
    
  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
  }
}

debugContext();