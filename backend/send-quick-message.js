const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function sendQuickMessage() {
  const phoneNumber = "918352986476"; // 8352986476 with India country code
  
  const message = `Hi there! 👋

This is your AI booking assistant. I can help you with:

📅 Book appointments
🔄 Reschedule bookings  
❌ Cancel appointments
⏰ Check availability

Just tell me what you need and I'll assist you!

Example: "I want to book a haircut for tomorrow at 3 PM"`;

  console.log(`📱 Sending message to: ${phoneNumber}`);
  console.log(`💬 Message: ${message.substring(0, 50)}...`);
  
  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    if (result.success) {
      console.log("✅ Message sent successfully!");
      console.log(`📨 Message ID: ${result.data.messages[0].id}`);
    } else {
      console.log("❌ Failed to send message:");
      console.log(result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

sendQuickMessage();