const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

// 🔧 REPLACE THIS WITH YOUR ACTUAL PHONE NUMBER
// Format: Country code + number (no + sign, no spaces)
// Examples:
// India: 919876543210
// US: 15551234567  
// UK: 447700123456
const MY_PHONE_NUMBER = "919999999999"; // 👈 CHANGE THIS!

async function testMyPhone() {
  console.log("📱 Testing WhatsApp message to your phone...\n");
  
  if (MY_PHONE_NUMBER === "919999999999") {
    console.log("❌ Please update MY_PHONE_NUMBER in test-my-phone.js with your actual number!");
    console.log("   Format: Country code + number (no + sign)");
    console.log("   Example: 919876543210 for India");
    return;
  }
  
  console.log(`📞 Sending test message to: ${MY_PHONE_NUMBER}`);
  console.log("⏳ Please wait...\n");
  
  try {
    const result = await sendWhatsAppMessage(
      MY_PHONE_NUMBER, 
      "🎉 SUCCESS! Your WhatsApp AI Booking Bot is working!\n\n" +
      "Try these commands:\n" +
      "• 'I want to book an appointment'\n" +
      "• 'What are your services?'\n" +
      "• 'What are your hours?'\n\n" +
      "Your bot is ready! 🤖"
    );
    
    if (result.success) {
      console.log("✅ SUCCESS! Message sent to your phone!");
      console.log("📱 Check your WhatsApp now!");
      console.log("\n🎯 Next steps:");
      console.log("1. Reply to this message to test the bot");
      console.log("2. Try: 'I want to book an appointment'");
      console.log("3. Your AI bot should respond automatically!");
      
    } else {
      console.log("❌ Failed to send message:");
      console.log("Error:", result.error.message);
      
      if (result.error.message.includes("not in allowed list")) {
        console.log("\n🔧 SOLUTION:");
        console.log("1. Go to Meta Developer Console");
        console.log("2. WhatsApp > API Setup");
        console.log("3. Add your phone number: " + MY_PHONE_NUMBER);
        console.log("4. Verify with the code sent to WhatsApp");
        console.log("5. Run this script again");
        console.log("\n📖 See FIX_WHATSAPP_MESSAGES.md for detailed steps");
      }
    }
    
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

console.log("🤖 WhatsApp AI Booking Bot - Phone Test");
console.log("=" .repeat(40));
testMyPhone();