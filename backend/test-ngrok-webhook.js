const axios = require("axios");
require("dotenv").config();

async function testNgrokWebhook() {
  console.log("🔍 Testing ngrok Webhook Configuration\n");
  
  // You need to replace this with your actual ngrok URL
  const ngrokUrl = "https://YOUR-NGROK-URL.ngrok-free.app"; // Replace with your actual URL
  
  console.log("📋 Current Configuration:");
  console.log(`Verify Token: ${process.env.WHATSAPP_VERIFY_TOKEN}`);
  console.log(`Expected ngrok URL: ${ngrokUrl}/webhook`);
  
  console.log("\n🧪 Testing webhook verification...");
  
  try {
    // Test the webhook verification (same as WhatsApp does)
    const response = await axios.get(`${ngrokUrl}/webhook`, {
      params: {
        "hub.mode": "subscribe",
        "hub.verify_token": process.env.WHATSAPP_VERIFY_TOKEN,
        "hub.challenge": "test_challenge_12345"
      }
    });
    
    if (response.status === 200 && response.data === "test_challenge_12345") {
      console.log("✅ Webhook verification successful!");
      console.log("🎯 Your webhook is working correctly");
    } else {
      console.log("❌ Unexpected response:", response.data);
    }
    
  } catch (error) {
    console.log("❌ Webhook test failed:");
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data || error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("\n💡 Possible issues:");
      console.log("1. Your server (node index.js) is not running");
      console.log("2. ngrok is not running");
      console.log("3. Wrong ngrok URL");
    }
  }
}

async function checkServerStatus() {
  console.log("\n🖥️ Checking local server status...");
  
  try {
    const response = await axios.get("http://localhost:8000/health");
    console.log("✅ Local server is running:", response.data);
  } catch (error) {
    console.log("❌ Local server is not running!");
    console.log("💡 Make sure to run: node index.js");
  }
}

async function runTest() {
  console.log("🚀 ngrok Webhook Troubleshooting\n");
  
  await checkServerStatus();
  
  console.log("\n📝 Instructions:");
  console.log("1. Make sure your server is running: node index.js");
  console.log("2. Make sure ngrok is running: ngrok http 8000");
  console.log("3. Replace YOUR-NGROK-URL in this script with your actual ngrok URL");
  console.log("4. Run this test again");
  
  console.log("\n🔧 WhatsApp Webhook Settings:");
  console.log("- Callback URL: https://YOUR-NGROK-URL.ngrok-free.app/webhook");
  console.log("- Verify Token: divyansh_saas_2026");
  
  // Only test if URL is provided
  if (!process.argv[2]) {
    console.log("\n💡 To test with your ngrok URL, run:");
    console.log("node test-ngrok-webhook.js https://your-ngrok-url.ngrok-free.app");
  } else {
    const ngrokUrl = process.argv[2];
    console.log(`\n🧪 Testing with URL: ${ngrokUrl}`);
    
    try {
      const response = await axios.get(`${ngrokUrl}/webhook`, {
        params: {
          "hub.mode": "subscribe",
          "hub.verify_token": process.env.WHATSAPP_VERIFY_TOKEN,
          "hub.challenge": "test_challenge_12345"
        }
      });
      
      if (response.status === 200 && response.data === "test_challenge_12345") {
        console.log("✅ Webhook verification successful!");
        console.log("🎯 Use this URL in WhatsApp: " + ngrokUrl + "/webhook");
      }
      
    } catch (error) {
      console.log("❌ Test failed:", error.message);
    }
  }
}

if (require.main === module) {
  runTest().catch(console.error);
}