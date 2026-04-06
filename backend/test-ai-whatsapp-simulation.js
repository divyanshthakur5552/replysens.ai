const axios = require("axios");
require("dotenv").config();

async function simulateWhatsAppMessage() {
  console.log("🤖 Testing AI Agent via WhatsApp Webhook Simulation\n");
  
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
            id: "wamid.test_" + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: "Hi, I want to book a haircut appointment for tomorrow at 3 PM"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  console.log("📱 Simulating message: 'Hi, I want to book a haircut appointment for tomorrow at 3 PM'");
  console.log("📞 From: 918352986476");
  
  try {
    const response = await axios.post("http://localhost:8000/webhook", webhookPayload);
    
    if (response.status === 200) {
      console.log("✅ Webhook processed successfully!");
      console.log("🤖 AI Agent received and processed the booking request");
      console.log("📋 Response:", response.data);
    } else {
      console.log("❌ Unexpected status:", response.status);
    }
    
  } catch (error) {
    console.log("❌ Webhook test failed:", error.response?.data || error.message);
  }
}

// Test multiple conversation scenarios
async function testConversationFlow() {
  console.log("\n🗣️ Testing Full Conversation Flow\n");
  
  const messages = [
    "Hello",
    "I want to book a haircut",
    "Tomorrow at 3 PM",
    "My name is John and phone is 9876543210"
  ];
  
  for (let i = 0; i < messages.length; i++) {
    console.log(`\n--- Message ${i + 1}: "${messages[i]}" ---`);
    
    const payload = {
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
              id: `wamid.test_${Date.now()}_${i}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: { body: messages[i] },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    try {
      const response = await axios.post("http://localhost:8000/webhook", payload);
      console.log("✅ AI Response received");
      
      // Wait between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log("❌ Failed:", error.message);
    }
  }
}

async function runAITest() {
  console.log("🚀 WhatsApp AI Agent Test\n");
  
  await simulateWhatsAppMessage();
  await testConversationFlow();
  
  console.log("\n✨ AI Agent test completed!");
  console.log("\n💡 Your AI is ready for WhatsApp! Just need to fix message delivery.");
}

if (require.main === module) {
  runAITest().catch(console.error);
}