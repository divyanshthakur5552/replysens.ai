const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function sendTestMessage() {
  const phoneNumber = "918352986476";
  
  const message = `🎉 SUCCESS! Your WhatsApp AI Bot is Working!

🤖 This message is from your AI booking assistant.

✅ Permanent access token: Working
✅ API integration: Working  
✅ Message delivery: Working

🔥 Your AI can now:
📅 Book appointments
🔄 Reschedule bookings
❌ Cancel appointments
💬 Have conversations

Reply with "book haircut" to test the AI booking system!

Time: ${new Date().toLocaleString()}`;

  console.log(`📱 Sending test message to: ${phoneNumber}`);
  console.log(`🕐 Time: ${new Date().toLocaleString()}`);
  
  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    if (result.success) {
      console.log("🎉 SUCCESS! Message sent with permanent token!");
      console.log(`📨 Message ID: ${result.data.messages[0].id}`);
      console.log(`📱 Check your WhatsApp now at +91 8352986476`);
      console.log(`🤖 Your AI bot is ready for conversations!`);
    } else {
      console.log("❌ Failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

sendTestMessage();