const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

console.log('🔍 Real-time WhatsApp message monitor started');
console.log('📱 Monitoring for messages from: +91 8352986476');
console.log('🤖 Bot number: +1 555 192 2233');
console.log('⏰ Started at:', new Date().toLocaleString());
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Webhook verification
app.get('/webhook', (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 🔍 GET /webhook - Verification request`);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log(`[${timestamp}] 📋 Mode: ${mode}, Token: ${token}`);
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log(`[${timestamp}] ✅ Webhook verified successfully`);
    res.status(200).send(challenge);
  } else {
    console.log(`[${timestamp}] ❌ Webhook verification failed`);
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 📨 POST /webhook - REAL MESSAGE RECEIVED!`);
  console.log(`[${timestamp}] 🔍 Full payload:`, JSON.stringify(req.body, null, 2));
  
  // Always respond immediately
  res.status(200).send('OK');
  
  try {
    // Parse the message
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    
    if (message && message.type === 'text') {
      const from = message.from;
      const text = message.text.body;
      const messageId = message.id;
      
      console.log(`[${timestamp}] 🎉 REAL WHATSAPP MESSAGE DETECTED!`);
      console.log(`[${timestamp}] 📱 From: ${from}`);
      console.log(`[${timestamp}] 💬 Message: "${text}"`);
      console.log(`[${timestamp}] 🆔 Message ID: ${messageId}`);
      
      // Check if it's from your number
      if (from === '918352986476' || from === '8352986476') {
        console.log(`[${timestamp}] ✅ Message is from YOUR number! Processing...`);
        
        // Send AI response
        const aiReply = `Hello Divyansh! I received your message: "${text}". I'm your AI booking assistant. I can help you book appointments for haircuts, hair coloring, and styling. What would you like to book?`;
        
        await sendWhatsAppMessage(from, aiReply);
      } else {
        console.log(`[${timestamp}] ℹ️ Message from different number: ${from}`);
      }
    } else {
      console.log(`[${timestamp}] ℹ️ Non-text message or invalid format`);
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error processing message:`, error);
  }
});

async function sendWhatsAppMessage(to, text) {
  const timestamp = new Date().toLocaleString();
  try {
    console.log(`[${timestamp}] 📤 Sending AI reply to ${to}...`);
    console.log(`[${timestamp}] 💬 Reply: "${text.substring(0, 100)}..."`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log(`[${timestamp}] ✅ AI reply sent successfully!`);
    console.log(`[${timestamp}] 📊 WhatsApp API response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[${timestamp}] ❌ Failed to send AI reply:`, error.response?.data || error.message);
  }
}

const PORT = 8002;
app.listen(PORT, () => {
  console.log(`🚀 Real-time monitor running on port ${PORT}`);
  console.log(`🌐 Webhook URL: https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook`);
  console.log(`📞 Waiting for messages from +91 8352986476...`);
});