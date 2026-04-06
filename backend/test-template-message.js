const axios = require("axios");
require("dotenv").config();

async function sendTemplateMessage() {
  const phoneNumber = "918352986476";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  console.log(`📱 Sending template message to: ${phoneNumber}`);
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("✅ Template message sent!");
    console.log("📨 Response:", JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log("❌ Failed:", error.response?.data || error.message);
  }
}

sendTemplateMessage();