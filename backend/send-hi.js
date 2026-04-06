const { sendWhatsAppMessage } = require("./src/utils/whatsapp");
require("dotenv").config();

async function sendHi() {
  const phoneNumber = "918352986476";
  const message = "Hi";

  console.log(`📱 Sending "Hi" to: ${phoneNumber}`);
  
  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    if (result.success) {
      console.log("✅ Message sent!");
      console.log(`📨 ID: ${result.data.messages[0].id}`);
    } else {
      console.log("❌ Failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

sendHi();