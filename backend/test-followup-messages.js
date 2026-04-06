const axios = require("axios");
require("dotenv").config();

async function testFollowupMessages() {
  console.log("🤖 Testing Follow-up Messages\n");
  
  const messages = [
    "hii",
    "Divyansh Thakur", 
    "8352986476"
  ];
  
  for (let i = 0; i < messages.length; i++) {
    console.log(`\n--- Testing Message ${i + 1}: "${messages[i]}" ---`);
    
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
              id: `wamid.followup_${Date.now()}_${i}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: {
                body: messages[i]
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
        console.log("✅ Message processed successfully");
        
        // Wait between messages to see responses
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.log("❌ Failed:", error.message);
    }
  }
  
  console.log("\n🎯 Check server logs for AI responses!");
}

if (require.main === module) {
  testFollowupMessages().catch(console.error);
}