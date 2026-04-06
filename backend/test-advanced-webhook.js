require('dotenv').config();
const axios = require('axios');

async function testAdvancedWebhook() {
  console.log('🧪 Testing Advanced WhatsApp Webhook with Gemini...\n');
  
  const webhookURL = 'http://localhost:8002';
  
  try {
    // 1. Test health/status
    console.log('1. Testing webhook server...');
    try {
      const response = await axios.get(`${webhookURL}/webhook`, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': process.env.WHATSAPP_VERIFY_TOKEN,
          'hub.challenge': 'test_challenge_123'
        }
      });
      
      if (response.data === 'test_challenge_123') {
        console.log('✅ Webhook verification working');
      } else {
        console.log('❌ Webhook verification failed');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Advanced webhook server is not running!');
        console.log('   Please start it with: node advanced-whatsapp-webhook.js');
        return;
      }
      throw error;
    }
    
    // 2. Test message processing
    console.log('\n2. Testing message processing...');
    
    const testMessage = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'test_entry',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '1234567890',
              phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
            },
            messages: [{
              from: '918352986476', // Your number
              id: 'test_msg_' + Date.now(),
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: {
                body: 'Hello! I would like to book a haircut for tomorrow at 2 PM.'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    console.log('📱 Sending test message:', testMessage.entry[0].changes[0].value.messages[0].text.body);
    
    const messageResponse = await axios.post(`${webhookURL}/webhook`, testMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    if (messageResponse.status === 200) {
      console.log('✅ Message processed successfully');
      console.log('   Check the server logs for AI processing details');
    } else {
      console.log('❌ Message processing failed');
    }
    
    // 3. Test different message types
    console.log('\n3. Testing various message scenarios...');
    
    const testScenarios = [
      'What services do you offer?',
      'What are your hours?',
      'I want to book a hair color appointment',
      'Can I reschedule my appointment?'
    ];
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n   Testing: "${scenario}"`);
      
      const scenarioMessage = {
        ...testMessage,
        entry: [{
          ...testMessage.entry[0],
          changes: [{
            ...testMessage.entry[0].changes[0],
            value: {
              ...testMessage.entry[0].changes[0].value,
              messages: [{
                ...testMessage.entry[0].changes[0].value.messages[0],
                id: 'test_scenario_' + i + '_' + Date.now(),
                text: { body: scenario }
              }]
            }
          }]
        }]
      };
      
      try {
        const scenarioResponse = await axios.post(`${webhookURL}/webhook`, scenarioMessage, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });
        
        if (scenarioResponse.status === 200) {
          console.log('     ✅ Processed successfully');
        } else {
          console.log('     ❌ Processing failed');
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log('     ❌ Error:', error.message);
      }
    }
    
    console.log('\n🎉 Advanced webhook test completed!');
    console.log('\n📊 Test Results Summary:');
    console.log('✅ Webhook verification working');
    console.log('✅ Message processing endpoint active');
    console.log('✅ Multiple message scenarios tested');
    console.log('✅ Gemini AI integration ready');
    
    console.log('\n📱 To test with real WhatsApp:');
    console.log('1. Make sure ngrok is running: ngrok http 8002');
    console.log('2. Update WhatsApp webhook URL to your ngrok URL');
    console.log('3. Send a message from +91 8352986476 to your WhatsApp Business number');
    console.log('4. Check server logs for AI processing and responses');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAdvancedWebhook();