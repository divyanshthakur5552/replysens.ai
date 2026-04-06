const axios = require('axios');

async function testNgrokSimple() {
  try {
    console.log('🧪 Testing ngrok simple webhook...');
    
    // Test verification
    const verifyResponse = await axios.get('https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'divyansh_saas_2026',
        'hub.challenge': 'test123'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp/1.0)',
        'ngrok-skip-browser-warning': 'true'
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
                body: "Hello, I want to book a haircut for tomorrow"
              },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    console.log('📤 Sending test message through ngrok...');
    const messageResponse = await axios.post('https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook', messagePayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp/1.0)',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    console.log('✅ Message response:', messageResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNgrokSimple();