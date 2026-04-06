const axios = require("axios");
require("dotenv").config();

const BASE_URL = "http://localhost:8000";

async function testWebhookEndpoints() {
  console.log("🔍 Testing WhatsApp Webhook Endpoints Directly\n");
  
  // Test 1: Health Check
  console.log("1. Testing Server Health");
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Server is running:", health.data);
  } catch (error) {
    console.log("❌ Server health check failed:", error.message);
    return;
  }
  
  // Test 2: Webhook Verification
  console.log("\n2. Testing Webhook Verification");
  try {
    const response = await axios.get(`${BASE_URL}/webhook`, {
      params: {
        "hub.mode": "subscribe",
        "hub.verify_token": process.env.WHATSAPP_VERIFY_TOKEN,
        "hub.challenge": "test_challenge_12345"
      }
    });
    
    if (response.status === 200 && response.data === "test_challenge_12345") {
      console.log("✅ Webhook verification successful");
    } else {
      console.log("❌ Unexpected response:", response.data);
    }
  } catch (error) {
    console.log("❌ Webhook verification failed:", error.response?.status, error.response?.data);
  }
  
  // Test 3: Invalid Token
  console.log("\n3. Testing Invalid Token Rejection");
  try {
    await axios.get(`${BASE_URL}/webhook`, {
      params: {
        "hub.mode": "subscribe", 
        "hub.verify_token": "invalid_token",
        "hub.challenge": "test_challenge_12345"
      }
    });
    console.log("❌ Should have been rejected");
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("✅ Invalid token correctly rejected");
    } else {
      console.log("❌ Unexpected error:", error.response?.status);
    }
  }
  
  // Test 4: Message Processing
  console.log("\n4. Testing Message Processing");
  const testMessage = {
    object: "whatsapp_business_account",
    entry: [{
      id: "ENTRY_ID",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15550123456",
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "123456789"
          },
          messages: [{
            from: "15551234567",
            id: "wamid.test123",
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: "Hello, I want to book a haircut appointment"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/webhook`, testMessage);
    
    if (response.status === 200) {
      console.log("✅ Message processing successful");
    } else {
      console.log("❌ Unexpected status:", response.status);
    }
  } catch (error) {
    console.log("❌ Message processing failed:", error.response?.status, error.response?.data);
  }
  
  // Test 5: WhatsApp Integration Status
  console.log("\n5. Testing WhatsApp Integration Management");
  try {
    // This would require authentication, so we'll just test the endpoint exists
    const response = await axios.get(`${BASE_URL}/whatsapp-integration`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ WhatsApp integration endpoint exists (requires auth)");
    } else {
      console.log("❌ Unexpected error:", error.response?.status);
    }
  }
  
  console.log("\n🏁 Direct Webhook Tests Complete");
}

// Test environment variables
function testEnvironmentConfig() {
  console.log("\n🔧 Environment Configuration Check\n");
  
  const requiredVars = [
    'WHATSAPP_VERIFY_TOKEN',
    'WHATSAPP_ACCESS_TOKEN', 
    'WHATSAPP_PHONE_NUMBER_ID',
    'MONGO_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set (${value.length} chars)`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log("\n✅ All required environment variables are configured");
  } else {
    console.log("\n❌ Some environment variables are missing");
  }
}

async function runTests() {
  console.log("🚀 WhatsApp Integration Re-Test\n");
  
  testEnvironmentConfig();
  await testWebhookEndpoints();
  
  console.log("\n✨ Re-test completed!");
}

if (require.main === module) {
  runTests().catch(console.error);
}