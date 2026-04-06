const axios = require('axios');

async function testLocalWebhook() {
  try {
    console.log('🧪 Testing local webhook...');
    
    // Test incoming message to local server
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
                body: "Hello, I want to book a haircut for tomorrow"
              },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    console.log('📤 Sending test message to local server...');
    const messageResponse = await axios.post('http://localhost:8000/webhook', messagePayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Message sent, status:', messageResponse.status);
    console.log('📨 Response:', messageResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLocalWebhook();