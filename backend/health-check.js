const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function checkHealth() {
  console.log('🔍 Checking server health...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is healthy!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server health check failed!');
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server appears to be offline. Start it with:');
      console.log('   cd backend && npm run devStart');
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

checkHealth();