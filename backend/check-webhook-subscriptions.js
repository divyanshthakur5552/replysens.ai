const axios = require('axios');
require('dotenv').config();

async function checkWebhookSubscriptions() {
  console.log('🔍 Checking WhatsApp webhook subscriptions...');
  
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  try {
    // Get the app ID from the access token or use a known app ID
    // For WhatsApp Business API, we need to check the app-level webhook subscriptions
    
    console.log('📋 Attempting to check webhook configuration...');
    
    // Try to get webhook info from the phone number endpoint
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?fields=webhook_configuration`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    console.log('✅ Webhook configuration:', phoneResponse.data);
    
    // The key issue might be webhook field subscriptions
    console.log('');
    console.log('🔧 LIKELY SOLUTION:');
    console.log('The webhook URL is configured, but you need to subscribe to message events.');
    console.log('');
    console.log('📋 Steps to fix in Meta Business Manager:');
    console.log('1. Go to https://developers.facebook.com/apps');
    console.log('2. Select your WhatsApp Business app');
    console.log('3. Go to WhatsApp > Configuration');
    console.log('4. In the Webhook section, click "Manage"');
    console.log('5. Make sure these webhook fields are CHECKED:');
    console.log('   ☑️ messages');
    console.log('   ☑️ message_deliveries (optional)');
    console.log('   ☑️ message_reads (optional)');
    console.log('6. Click "Save"');
    console.log('');
    console.log('💡 The "messages" field is crucial - without it, your webhook won\'t receive messages!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkWebhookSubscriptions();