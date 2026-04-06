const axios = require("axios");
require("dotenv").config();

const BASE_URL = "http://localhost:8000";

async function testWhatsAppIntegration() {
  console.log("🧪 Testing WhatsApp Integration...\n");
  
  // Test 1: Webhook Verification
  console.log("1. Testing Webhook Verification (GET /webhook)");
  try {
    const verifyResponse = await axios.get(`${BASE_URL}/webhook`, {
      params: {
        "hub.mode": "subscribe",
        "hub.verify_token": process.env.WHATSAPP_VERIFY_TOKEN || "test_token",
        "hub.challenge": "test_challenge_123"
      }
    });
    
    if (verifyResponse.status === 200 && verifyResponse.data === "test_challenge_123") {
      console.log("✅ Webhook verification successful");
    } else {
      console.log("❌ Webhook verification failed");
    }
  } catch (error) {
    console.log("❌ Webhook verification error:", error.response?.status, error.response?.data);
  }
  
  // Test 2: Invalid Webhook Verification
  console.log("\n2. Testing Invalid Webhook Verification");
  try {
    const invalidResponse = await axios.get(`${BASE_URL}/webhook`, {
      params: {
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong_token",
        "hub.challenge": "test_challenge_123"
      }
    });
    console.log("❌ Should have failed but didn't");
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("✅ Invalid token correctly rejected");
    } else {
      console.log("❌ Unexpected error:", error.response?.status);
    }
  }
  
  // Test 3: Webhook Message Processing
  console.log("\n3. Testing Webhook Message Processing (POST /webhook)");
  const testMessage = {
    object: "whatsapp_business_account",
    entry: [{
      id: "ENTRY_ID",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15550123456",
            phone_number_id: "123456789"
          },
          messages: [{
            from: "15551234567",
            id: "wamid.test123",
            timestamp: "1234567890",
            text: {
              body: "Hello, I want to book an appointment"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  try {
    const webhookResponse = await axios.post(`${BASE_URL}/webhook`, testMessage);
    
    if (webhookResponse.status === 200) {
      console.log("✅ Webhook message processing successful");
    } else {
      console.log("❌ Webhook message processing failed");
    }
  } catch (error) {
    console.log("❌ Webhook message processing error:", error.response?.status, error.response?.data);
  }
  
  // Test 4: WhatsApp Message Sending (if tokens are configured)
  console.log("\n4. Testing WhatsApp Message Sending");
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
    
    // Note: This will only work with a real phone number that has opted in
    // For testing, you might want to use a test number
    const testPhoneNumber = "15551234567"; // Replace with your test number
    
    try {
      const result = await sendWhatsAppMessage(testPhoneNumber, "Test message from booking bot!");
      
      if (result.success) {
        console.log("✅ WhatsApp message sent successfully");
      } else {
        console.log("❌ WhatsApp message sending failed:", result.error);
      }
    } catch (error) {
      console.log("❌ WhatsApp message sending error:", error.message);
    }
  } else {
    console.log("⚠️  WhatsApp tokens not configured, skipping message sending test");
  }
  
  console.log("\n🏁 WhatsApp Integration Tests Complete");
}

// Test WhatsApp utility functions
function testWhatsAppUtils() {
  console.log("\n🔧 Testing WhatsApp Utility Functions...\n");
  
  const { parseWhatsAppMessage, verifyWebhook } = require("./src/utils/whatsapp");
  
  // Test message parsing
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
            text: { body: "Hello world" }
          }]
        }
      }]
    }]
  };
  
  const parsed = parseWhatsAppMessage(testPayload);
  if (parsed && parsed.from === "15551234567" && parsed.text === "Hello world") {
    console.log("✅ Message parsing successful");
  } else {
    console.log("❌ Message parsing failed");
  }
  
  // Test webhook verification
  console.log("\n2. Testing Webhook Verification Logic");
  const validChallenge = verifyWebhook("subscribe", process.env.WHATSAPP_VERIFY_TOKEN || "test", "challenge123");
  const invalidChallenge = verifyWebhook("subscribe", "wrong_token", "challenge123");
  
  if (validChallenge === "challenge123" && invalidChallenge === null) {
    console.log("✅ Webhook verification logic working correctly");
  } else {
    console.log("❌ Webhook verification logic failed");
  }
}

// Run tests
async function runAllTests() {
  console.log("🚀 Starting WhatsApp Integration Tests\n");
  
  testWhatsAppUtils();
  await testWhatsAppIntegration();
  
  console.log("\n✨ All tests completed!");
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testWhatsAppIntegration, testWhatsAppUtils };