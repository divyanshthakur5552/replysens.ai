const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function sendAIReadyMessage() {
  const phoneNumber = "918352986476";
  
  const message = `🤖 Your AI Booking Assistant is LIVE!

I can help you with:
📅 Book appointments
🔄 Reschedule bookings  
❌ Cancel appointments
💬 Natural conversations

Try me out! Send:
• "Hello" 
• "Book a haircut for tomorrow"
• "What are your hours?"

I'll respond intelligently using AI! 🚀`;

  console.log(`🤖 Sending AI ready message...`);
  
  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    if (result.success) {
      console.log("✅ AI ready message sent!");
      console.log("📱 Now reply to test the AI conversation!");
    } else {
      console.log("❌ Failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

sendAIReadyMessage();