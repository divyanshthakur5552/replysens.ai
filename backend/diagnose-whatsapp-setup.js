const axios = require('axios');
require('dotenv').config();

async function diagnoseWhatsAppSetup() {
  console.log('🔍 WhatsApp Business API Diagnostic');
  console.log('═══════════════════════════════════════');
  
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  console.log('📋 Configuration:');
  console.log(`📱 Phone Number ID: ${phoneNumberId}`);
  console.log(`🔑 Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log(`🔐 Verify Token: ${verifyToken}`);
  console.log('');
  
  try {
    // 1. Check phone number info
    console.log('1️⃣ Checking phone number information...');
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v22.0/${phoneNumberId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    console.log('✅ Phone number info:', phoneResponse.data);
    console.log('');
    
    // 2. Check webhook subscriptions
    console.log('2️⃣ Checking webhook subscriptions...');
    const subscriptionsResponse = await axios.get(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/subscribed_apps`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    console.log('✅ Webhook subscriptions:', subscriptionsResponse.data);
    console.log('');
    
    // 3. Test webhook URL directly
    console.log('3️⃣ Testing webhook URL...');
    const webhookUrl = 'https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook';
    
    const webhookTest = await axios.get(webhookUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': 'diagnostic_test'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp/1.0)',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (webhookTest.data === 'diagnostic_test') {
      console.log('✅ Webhook URL responds correctly');
    } else {
      console.log('❌ Webhook URL response incorrect:', webhookTest.data);
    }
    console.log('');
    
    // 4. Check if we can send a message (to verify API access)
    console.log('4️⃣ Testing message sending capability...');
    try {
      const testMessage = await axios.post(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: "918352986476", // Your number
          type: "text",
          text: { body: "🧪 Diagnostic test - API is working! This confirms your WhatsApp Business API is properly configured." }
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log('✅ Message sending works! Response:', testMessage.data);
      console.log('📱 You should receive a diagnostic message on WhatsApp');
    } catch (sendError) {
      console.log('❌ Message sending failed:', sendError.response?.data || sendError.message);
    }
    
    console.log('');
    console.log('📋 DIAGNOSTIC SUMMARY:');
    console.log('═══════════════════════');
    console.log('✅ Phone number ID is valid');
    console.log('✅ Access token works');
    console.log('✅ Webhook URL is accessible');
    
    if (subscriptionsResponse.data.data && subscriptionsResponse.data.data.length > 0) {
      console.log('✅ Webhook is subscribed to receive messages');
    } else {
      console.log('❌ Webhook is NOT subscribed - this is likely the issue!');
      console.log('');
      console.log('🔧 TO FIX: In Meta Business Manager:');
      console.log('1. Go to WhatsApp > Configuration');
      console.log('2. In Webhook section, make sure these fields are checked:');
      console.log('   ☑️ messages');
      console.log('   ☑️ message_deliveries');
      console.log('   ☑️ message_reads');
      console.log('3. Save the configuration');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.response?.data || error.message);
  }
}

diagnoseWhatsAppSetup();