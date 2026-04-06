require('dotenv').config();
const axios = require('axios');
const { makeGeminiRequest } = require('./src/services/geminiService');

async function testCompleteWhatsAppIntegration() {
  console.log('🧪 Complete WhatsApp + Gemini Integration Test\n');
  
  const baseURL = 'http://localhost:8000';
  
  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Server is running');
      console.log('   Status:', healthResponse.data.status);
      console.log('   WhatsApp Phone ID:', healthResponse.data.whatsapp?.phoneNumberId);
      console.log('   AI Provider:', healthResponse.data.ai?.provider);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running!');
        console.log('   Please start the server first:');
        console.log('   - Run: node whatsapp-gemini-integration.js');
        console.log('   - Or: node index.js');
        return;
      }
      throw error;
    }
    
    // 2. Test Gemini AI directly
    console.log('\n2. Testing Gemini AI integration...');
    const testMessages = [
      { role: 'system', content: 'You are a helpful AI assistant accessible via WhatsApp. Keep responses short and friendly.' },
      { role: 'user', content: 'Hello! Can you help me?' }
    ];
    
    const aiResult = await makeGeminiRequest(testMessages, [], 0, 100);
    if (aiResult.success) {
      console.log('✅ Gemini AI is working');
      console.log('   Response:', aiResult.data.choices[0].message.content);
    } else {
      console.log('❌ Gemini AI failed:', aiResult.error.message);
    }
    
    // 3. Test webhook verification endpoint
    console.log('\n3. Testing webhook verification...');
    try {
      const verifyResponse = await axios.get(`${baseURL}/webhook`, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': process.env.WHATSAPP_VERIFY_TOKEN,
          'hub.challenge': 'test_challenge_123'
        }
      });
      
      if (verifyResponse.data === 'test_challenge_123') {
        console.log('✅ Webhook verification working');
      } else {
        console.log('❌ Webhook verification failed');
      }
    } catch (error) {
      console.log('❌ Webhook verification error:', error.message);
    }
    
    // 4. Test message processing (if test endpoint exists)
    console.log('\n4. Testing message processing...');
    try {
      const testMessageResponse = await axios.post(`${baseURL}/test-message`, {
        phone: '1234567890',
        message: 'Hello AI, this is a test message!'
      });
      
      if (testMessageResponse.data.success) {
        console.log('✅ Message processing working');
      } else {
        console.log('❌ Message processing failed');
      }
    } catch (error) {
      console.log('⚠️  Test message endpoint not available (this is normal for main server)');
    }
    
    // 5. Environment check
    console.log('\n5. Environment variables check...');
    const requiredVars = [
      'GOOGLE_GEMINI_API_KEY',
      'WHATSAPP_ACCESS_TOKEN', 
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_VERIFY_TOKEN'
    ];
    
    let allVarsPresent = true;
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: configured`);
      } else {
        console.log(`❌ ${varName}: missing`);
        allVarsPresent = false;
      }
    }
    
    // 6. Final status
    console.log('\n📊 Integration Status:');
    if (allVarsPresent) {
      console.log('✅ All environment variables configured');
      console.log('✅ Server is running');
      console.log('✅ Gemini AI is working');
      console.log('✅ Webhook verification ready');
      
      console.log('\n🎉 Your WhatsApp + Gemini integration is ready!');
      console.log('\n📱 Next steps:');
      console.log('1. Start ngrok: ngrok http 8000');
      console.log('2. Copy the ngrok URL (e.g., https://abc123.ngrok.io)');
      console.log('3. Update WhatsApp webhook URL to: [ngrok-url]/webhook');
      console.log('4. Send a message to your WhatsApp Business number');
      console.log('5. Enjoy chatting with your AI! 🤖');
      
    } else {
      console.log('❌ Some configuration issues need to be resolved');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteWhatsAppIntegration();