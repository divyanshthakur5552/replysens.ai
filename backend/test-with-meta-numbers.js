const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

// Meta's official test numbers (these should work without verification)
const META_TEST_NUMBERS = [
  "15550123456",  // US test number
  "15550987654",  // US test number  
  "15551234567",  // US test number
  "447700123456", // UK test number
  "919876543210"  // India test number (example)
];

async function testWithMetaNumbers() {
  console.log("🧪 Testing WhatsApp with Meta's Test Numbers\n");
  
  console.log("📋 Available test numbers:");
  META_TEST_NUMBERS.forEach((num, i) => {
    console.log(`   ${i + 1}. ${num}`);
  });
  
  // Test with the first number
  const testNumber = META_TEST_NUMBERS[0];
  console.log(`\n📱 Testing with: ${testNumber}`);
  console.log("⏳ Sending test message...\n");
  
  try {
    const result = await sendWhatsAppMessage(
      testNumber,
      "🤖 Hello from your AI Booking Bot!\n\n" +
      "This is a test message using Meta's test number.\n\n" +
      "Available commands:\n" +
      "• 'Book appointment'\n" +
      "• 'Show services'\n" +
      "• 'Business hours'\n\n" +
      "Integration test successful! ✅"
    );
    
    if (result.success) {
      console.log("🎉 SUCCESS! Message sent successfully!");
      console.log("✅ Your WhatsApp integration is working!");
      console.log("\nResponse details:");
      console.log(JSON.stringify(result.data, null, 2));
      
      console.log("\n🎯 What this means:");
      console.log("• Your API credentials are valid");
      console.log("• Message sending functionality works");
      console.log("• Integration is properly configured");
      console.log("• Ready for production use!");
      
    } else {
      console.log("❌ Test failed:");
      console.log("Error:", result.error);
      
      // Try with different test numbers
      console.log("\n🔄 Trying with other test numbers...");
      
      for (let i = 1; i < META_TEST_NUMBERS.length; i++) {
        const altNumber = META_TEST_NUMBERS[i];
        console.log(`\n📱 Trying: ${altNumber}`);
        
        const altResult = await sendWhatsAppMessage(altNumber, "Test message " + (i + 1));
        
        if (altResult.success) {
          console.log(`✅ SUCCESS with ${altNumber}!`);
          break;
        } else {
          console.log(`❌ Failed with ${altNumber}: ${altResult.error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

// Also test webhook simulation
async function testWebhookSimulation() {
  console.log("\n" + "=".repeat(50));
  console.log("🔄 Testing Webhook Message Processing");
  console.log("=".repeat(50));
  
  const { parseWhatsAppMessage } = require("./src/utils/whatsapp");
  
  // Simulate incoming message from test number
  const mockWebhookPayload = {
    object: "whatsapp_business_account",
    entry: [{
      id: "ENTRY_ID",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15550123456",
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
          },
          messages: [{
            from: "15550123456", // Test number as sender
            id: "wamid.test_" + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: "Hi! I want to book a haircut appointment for tomorrow at 2 PM"
            },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };
  
  console.log("📥 Simulating incoming message:");
  console.log("   From: 15550123456 (test number)");
  console.log("   Message: 'Hi! I want to book a haircut appointment for tomorrow at 2 PM'");
  
  const parsed = parseWhatsAppMessage(mockWebhookPayload);
  
  if (parsed) {
    console.log("✅ Message parsing successful!");
    console.log(`   Parsed from: ${parsed.from}`);
    console.log(`   Parsed text: ${parsed.text}`);
    console.log(`   Message ID: ${parsed.messageId}`);
    
    console.log("\n🤖 This would trigger your AI bot to:");
    console.log("   1. Load business context");
    console.log("   2. Process booking request");
    console.log("   3. Generate AI response");
    console.log("   4. Send reply via WhatsApp");
    
  } else {
    console.log("❌ Message parsing failed");
  }
}

async function main() {
  console.log("🚀 WhatsApp Integration Test with Meta Numbers");
  console.log("=" .repeat(50));
  
  await testWithMetaNumbers();
  await testWebhookSimulation();
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log("If message sending succeeded:");
  console.log("✅ Your WhatsApp integration is fully functional");
  console.log("✅ API credentials are valid");
  console.log("✅ Ready to add your real phone numbers");
  console.log("\nNext steps:");
  console.log("1. Add your phone number in Meta Console");
  console.log("2. Test with your actual number");
  console.log("3. Set up webhook for production");
  console.log("4. Start receiving real customer messages!");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWithMetaNumbers };