const axios = require('axios');
require('dotenv').config();

async function updateWebhookURL() {
  try {
    console.log('🔧 Updating WhatsApp webhook URL...');
    
    const webhookURL = 'https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook';
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    
    console.log(`📡 New webhook URL: ${webhookURL}`);
    console.log(`🔑 Verify token: ${verifyToken}`);
    
    // Note: This is just for reference - you need to update this manually in Meta Business Manager
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to https://developers.facebook.com/apps');
    console.log('2. Select your WhatsApp Business app');
    console.log('3. Go to WhatsApp > Configuration');
    console.log('4. In the Webhook section, click "Edit"');
    console.log(`5. Update Callback URL to: ${webhookURL}`);
    console.log(`6. Update Verify Token to: ${verifyToken}`);
    console.log('7. Click "Verify and Save"');
    
    // Test if the current webhook URL is accessible
    console.log('\n🧪 Testing webhook accessibility...');
    
    const testResponse = await axios.get(webhookURL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': 'test123'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp/1.0)',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (testResponse.data === 'test123') {
      console.log('✅ Webhook URL is accessible and working!');
    } else {
      console.log('❌ Webhook verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.response?.data || error.message);
  }
}

updateWebhookURL();