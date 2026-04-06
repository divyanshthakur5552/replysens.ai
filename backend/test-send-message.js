const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function sendTestMessage() {
  console.log("📱 Sending WhatsApp Test Message\n");
  
  // Target number (Indian number)
  const targetNumber = "918352986476"; // +91 8352986476 in international format
  
  // Test message
  const message = `Hello! 👋

This is a test message from your booking bot.

🤖 Bot Details:
- From: +1 555 192 2233 (Test Number)
- System: ReplySense AI Booking Assistant
- Time: ${new Date().toLocaleString()}

✨ Features Available:
- Book appointments
- Reschedule bookings  
- Cancel appointments
- Check availability

Reply with "Hello" to start a conversation!`;

  console.log(`📞 From: +1 555 192 2233`);
  console.log(`📞 To: +91 8352986476`);
  console.log(`💬 Message: ${message.substring(0, 50)}...`);
  console.log();
  
  try {
    console.log("🚀 Sending message...");
    
    const result = await sendWhatsAppMessage(targetNumber, message);
    
    if (result.success) {
      console.log("✅ Message sent successfully!");
      console.log("📋 Response:", JSON.stringify(result.data, null, 2));
      
      // Log message ID for tracking
      if (result.data.messages && result.data.messages[0]) {
        console.log(`📨 Message ID: ${result.data.messages[0].id}`);
      }
      
    } else {
      console.log("❌ Message sending failed:");
      console.log("🔍 Error details:", result.error);
      
      // Provide specific guidance based on error
      if (result.error.status === 400) {
        console.log("\n💡 Possible solutions:");
        console.log("1. Add +91 8352986476 to your WhatsApp Business allowed list");
        console.log("2. Verify the phone number format is correct");
        console.log("3. Ensure the recipient has WhatsApp installed");
      } else if (result.error.status === 401) {
        console.log("\n💡 Token issue:");
        console.log("1. Check if WHATSAPP_ACCESS_TOKEN is valid");
        console.log("2. Regenerate token in Meta Business Manager");
      }
    }
    
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

// Also test with different number formats
async function testNumberFormats() {
  console.log("\n🔢 Testing Different Number Formats\n");
  
  const formats = [
    "918352986476",     // Standard international
    "+918352986476",    // With plus
    "91 8352986476",    // With space
    "8352986476"        // Without country code
  ];
  
  console.log("📋 Testing formats for +91 8352986476:");
  formats.forEach((format, index) => {
    console.log(`${index + 1}. "${format}"`);
  });
  
  console.log("\n✅ Recommended format: 918352986476 (no + or spaces)");
}

async function checkEnvironment() {
  console.log("🔧 Environment Check\n");
  
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!token) {
    console.log("❌ WHATSAPP_ACCESS_TOKEN not found");
    return false;
  }
  
  if (!phoneId) {
    console.log("❌ WHATSAPP_PHONE_NUMBER_ID not found");
    return false;
  }
  
  console.log(`✅ Access Token: ${token.substring(0, 20)}...`);
  console.log(`✅ Phone Number ID: ${phoneId}`);
  
  return true;
}

async function runTest() {
  console.log("🚀 WhatsApp Message Sending Test\n");
  
  const envOk = await checkEnvironment();
  if (!envOk) {
    console.log("\n❌ Environment configuration incomplete");
    return;
  }
  
  await testNumberFormats();
  await sendTestMessage();
  
  console.log("\n✨ Test completed!");
}

if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { sendTestMessage };