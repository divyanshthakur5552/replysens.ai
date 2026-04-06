const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const MAX_WAIT_TIME = 30000; // 30 seconds

async function waitForServer() {
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is ready!');
      return true;
    } catch (error) {
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('❌ Server failed to start within timeout period');
  return false;
}

async function runTests() {
  console.log('🚀 Starting test runner...');
  
  // Check if server is already running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is already running, proceeding with tests...');
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first with:');
    console.log('   npm run devStart');
    console.log('   or');
    console.log('   node index.js');
    process.exit(1);
  }
  
  // Run the test script
  const testProcess = spawn('node', ['test-api.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 All tests completed successfully!');
    } else {
      console.log('\n💥 Tests completed with errors.');
    }
    process.exit(code);
  });
  
  testProcess.on('error', (error) => {
    console.error('💥 Failed to run tests:', error.message);
    process.exit(1);
  });
}

runTests();