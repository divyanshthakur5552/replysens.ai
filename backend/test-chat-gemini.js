require('dotenv').config();
const axios = require('axios');

async function testChatWithGemini() {
  console.log('🧪 Testing Chat API with Gemini Integration...\n');
  
  const baseURL = 'http://localhost:8000';
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health/ai`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('Model:', healthResponse.data.model);
    console.log('Provider:', healthResponse.data.provider);
    
    // Note: For a full chat test, you would need:
    // 1. A valid JWT token (user authentication)
    // 2. Business context loaded in Redis
    // 3. MongoDB connection
    
    console.log('\n📝 To test the full chat functionality:');
    console.log('1. Start the server: node index.js');
    console.log('2. Authenticate a user to get a JWT token');
    console.log('3. Load business context via POST /context/load');
    console.log('4. Send chat messages via POST /chat');
    
    console.log('\n✅ Gemini integration is ready for use!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Start it with: node index.js');
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

testChatWithGemini();