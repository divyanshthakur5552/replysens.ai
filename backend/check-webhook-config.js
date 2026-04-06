const axios = require("axios");
require("dotenv").config();

async function checkWebhookConfig() {
  console.log("🔍 Checking WhatsApp Webhook Configuration\n");
  
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  // This might not work with all access tokens, but let's try
  try {
    console.log("📋 Current webhook configuration:");
    console.log("Expected webhook URL should be a public URL ending with '/webhook'");
    console.log("Current server: http://localhost:8000/webhook (NOT accessible from internet)");
    
    console.log("\n🔧 To fix this:");
    console.log("1. Install ngrok: https://ngrok.com/");
    console.log("2. Run: ngrok http 8000");
    console.log("3. Copy the https URL (e.g., https://abc123.ngrok.io)");
    console.log("4. Update webhook URL in Meta Business Manager to: https://abc123.ngrok.io/webhook");
    
    console.log("\n🧪 Test webhook locally:");
    console.log("We can simulate an incoming message to test the AI response");
    
  } catch (error) {
    console.log("❌ Cannot check webhook config:", error.message);
  }
}

// Simulate incoming WhatsApp message to test AI locally
async function simulateIncomingMessage() {
  console.log("\n🤖 Simulating incoming WhatsApp message locally...");
  
  const webhookPayload = {
    object: "whatsapp_business_account",
    entry: [{
      id: "ENTRY_ID",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15551922233",
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
          },
          messages: [{
            from: "918352986476",
            id: "wamid.test_hello_" + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: "Hello"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  try {
    const response = await axios.post("http://localhost:8000/webhook", webhookPayload);
    
    if (response.status === 200) {
      console.log("✅ Local webhook test successful!");
      console.log("🤖 AI processed the 'Hello' message");
      console.log("📱 Check server logs for AI response");
    }
    
  } catch (error) {
    console.log("❌ Local webhook test failed:", error.message);
  }
}

async function runCheck() {
  await checkWebhookConfig();
  await simulateIncomingMessage();
  
  console.log("\n✨ Check complete!");
  console.log("\n🎯 Next step: Setup ngrok to make your webhook publicly accessible");
}

if (require.main === module) {
  runCheck().catch(console.error);
}