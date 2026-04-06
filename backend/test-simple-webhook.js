const axios = require('axios');

async function testSimpleWebhook() {
  try {
    console.log('🧪 Testing simple webhook...');
    
    // Test verification
    const verifyResponse = await axios.get('http://localhost:8002/webhook', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'divyansh_saas_2026',
        'hub.challenge': 'test123'
      }
    });
    
    console.log('✅ Verification:', verifyResponse.data);
    
    // Test message
    const messagePayload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "1027091170488458",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15551922233",
              phone_number_id: "1027091170488458"
            },
            messages: [{
              from: "918352986476",
              id: "wamid.test123",
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: {
                body: "Hello, I want to book a haircut"
              },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    console.log('📤 Sending test message...');
    const messageResponse = await axios.post('http://localhost:8002/webhook', messagePayload);
    
    console.log('✅ Message response:', messageResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimpleWebhook();