const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function debugWhatsAppSetup() {
  console.log("🔍 WhatsApp Integration Debug\n");
  
  // Check environment variables
  console.log("1. Environment Variables:");
  console.log(`   ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? 'Set ✅' : 'Missing ❌'}`);
  console.log(`   PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || 'Missing ❌'}`);
  console.log(`   VERIFY_TOKEN: ${process.env.WHATSAPP_VERIFY_TOKEN || 'Missing ❌'}`);
  
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log("\n❌ Missing required environment variables!");
    return;
  }
  
  console.log("\n2. Testing WhatsApp API Connection:");
  
  // Test with your phone number (you'll need to provide this)
  const testPhoneNumber = "919999999999"; // Replace with your actual phone number in international format
  
  console.log(`   Testing message to: ${testPhoneNumber}`);
  console.log("   Note: Replace with your actual phone number in international format (e.g., 919999999999 for India)");
  
  try {
    const result = await sendWhatsAppMessage(testPhoneNumber, "🤖 Test message from your AI Booking Bot! If you receive this, the integration is working!");
    
    if (result.success) {
      console.log("✅ Message sent successfully!");
      console.log("   Check your WhatsApp for the test message");
      console.log("   Response:", JSON.stringify(result.data, null, 2));
    } else {
      console.log("❌ Message sending failed:");
      console.log("   Error:", result.error);
      
      // Provide specific troubleshooting based on error
      if (result.error.message?.includes("not in allowed list")) {
        console.log("\n🔧 SOLUTION:");
        console.log("   1. Your phone number needs to be added to the allowed list in Meta Developer Console");
        console.log("   2. Go to: Meta for Developers > Your App > WhatsApp > API Setup");
        console.log("   3. Add your phone number to the 'To' field and verify it");
        console.log("   4. Or use the test number provided by Meta");
      } else if (result.error.message?.includes("access token")) {
        console.log("\n🔧 SOLUTION:");
        console.log("   1. Your access token might be expired or invalid");
        console.log("   2. Generate a new permanent access token in Meta Developer Console");
        console.log("   3. Update WHATSAPP_ACCESS_TOKEN in your .env file");
      } else if (result.error.message?.includes("phone number")) {
        console.log("\n🔧 SOLUTION:");
        console.log("   1. Check your WHATSAPP_PHONE_NUMBER_ID in .env");
        console.log("   2. Make sure it matches the Phone Number ID in Meta Console");
      }
    }
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
  
  console.log("\n3. Next Steps:");
  console.log("   📱 If you received the message: Integration is working!");
  console.log("   🔧 If not, follow the solution steps above");
  console.log("   📖 See WHATSAPP_SETUP.md for detailed setup instructions");
  console.log("   🌐 Meta Developer Console: https://developers.facebook.com/");
}

// Also test webhook verification
function testWebhookVerification() {
  console.log("\n4. Testing Webhook Verification:");
  
  const { verifyWebhook } = require("./src/utils/whatsapp");
  
  const testChallenge = "test_challenge_12345";
  const result = verifyWebhook("subscribe", process.env.WHATSAPP_VERIFY_TOKEN, testChallenge);
  
  if (result === testChallenge) {
    console.log("✅ Webhook verification working correctly");
  } else {
    console.log("❌ Webhook verification failed");
  }
}

async function main() {
  await debugWhatsAppSetup();
  testWebhookVerification();
  
  console.log("\n" + "=".repeat(50));
  console.log("🚀 QUICK SETUP CHECKLIST:");
  console.log("□ Meta Developer Account created");
  console.log("□ WhatsApp Business App created");
  console.log("□ Phone number added and verified");
  console.log("□ Permanent access token generated");
  console.log("□ Environment variables configured");
  console.log("□ Webhook URL set up (for production)");
  console.log("=".repeat(50));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugWhatsAppSetup };