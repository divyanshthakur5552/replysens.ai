const axios = require("axios");
require("dotenv").config();

async function testAIResponse() {
  console.log("🤖 Testing AI Response with Business Context\n");
  
  // Simulate incoming WhatsApp message
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
              body: "Hello, I want to book a haircut for tomorrow at 3 PM"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  console.log("📱 Simulating message: 'Hello, I want to book a haircut for tomorrow at 3 PM'");
  console.log("📞 From: 918352986476");
  
  try {
    const response = await axios.post("http://localhost:8000/webhook", webhookPayload);
    
    if (response.status === 200) {
      console.log("✅ Webhook processed successfully!");
      console.log("🤖 AI should have processed the booking request");
      
      // Wait a moment for processing
      setTimeout(() => {
        console.log("\n📋 Check server logs above for AI response");
        console.log("📱 If you sent a real WhatsApp message, check your phone for AI response!");
      }, 2000);
      
    } else {
      console.log("❌ Unexpected status:", response.status);
    }
    
  } catch (error) {
    console.log("❌ Webhook test failed:", error.message);
  }
}

if (require.main === module) {
  testAIResponse().catch(console.error);
}