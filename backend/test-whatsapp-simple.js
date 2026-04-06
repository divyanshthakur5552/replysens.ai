const { sendWhatsAppMessage, parseWhatsAppMessage, verifyWebhook } = require("./src/utils/whatsapp");

console.log("🧪 Testing WhatsApp Integration Components...\n");

// Test 1: Message Parsing
console.log("1. Testing Message Parsing");
const testPayload = {
  entry: [{
    changes: [{
      field: "messages",
      value: {
        messages: [{
          from: "15551234567",
          id: "test123",
          timestamp: "1234567890",
          type: "text",
          text: { body: "Hello, I want to book an appointment" }
        }]
      }
    }]
  }]
};

const parsed = parseWhatsAppMessage(testPayload);
if (parsed && parsed.from === "15551234567" && parsed.text === "Hello, I want to book an appointment") {
  console.log("✅ Message parsing works correctly");
  console.log(`   From: ${parsed.from}`);
  console.log(`   Text: ${parsed.text}`);
} else {
  console.log("❌ Message parsing failed");
}

// Test 2: Webhook Verification
console.log("\n2. Testing Webhook Verification");
const validToken = process.env.WHATSAPP_VERIFY_TOKEN || "test_token";
const validChallenge = verifyWebhook("subscribe", validToken, "challenge123");
const invalidChallenge = verifyWebhook("subscribe", "wrong_token", "challenge123");

if (validChallenge === "challenge123" && invalidChallenge === null) {
  console.log("✅ Webhook verification works correctly");
  console.log(`   Valid token returns: ${validChallenge}`);
  console.log(`   Invalid token returns: ${invalidChallenge}`);
} else {
  console.log("❌ Webhook verification failed");
}

// Test 3: Environment Variables
console.log("\n3. Checking Environment Variables");
const requiredVars = [
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID', 
  'WHATSAPP_VERIFY_TOKEN'
];

let allVarsSet = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_whatsapp_access_token_here' && value !== 'your_phone_number_id_here' && value !== 'your_webhook_verify_token_here') {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`⚠️  ${varName}: Not configured or using placeholder`);
    allVarsSet = false;
  }
});

if (allVarsSet) {
  console.log("✅ All WhatsApp environment variables are configured");
} else {
  console.log("⚠️  Some WhatsApp environment variables need to be configured");
}

// Test 4: Model Import
console.log("\n4. Testing Model Import");
try {
  const WhatsAppIntegration = require("./src/models/WhatsAppIntegration");
  console.log("✅ WhatsAppIntegration model imported successfully");
} catch (error) {
  console.log("❌ WhatsAppIntegration model import failed:", error.message);
}

console.log("\n🎉 WhatsApp Integration Components Test Complete!");
console.log("\n📋 Next Steps:");
console.log("1. Configure your WhatsApp environment variables in .env");
console.log("2. Start your server: npm run devStart");
console.log("3. Set up webhook URL in Meta Developer Console");
console.log("4. Test with real WhatsApp messages");
console.log("\n📖 See WHATSAPP_SETUP.md for detailed setup instructions");