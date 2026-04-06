const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Webhook verification
app.get('/webhook', (req, res) => {
  console.log('🔍 GET /webhook - Verification request');
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  console.log('📨 POST /webhook - Message received');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
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
      
      console.log(`📱 Message from ${from}: ${text}`);
      
      // Send a simple reply
      const reply = `Hello! I received your message: "${text}". I'm your AI assistant ready to help with bookings!`;
      
      await sendWhatsAppMessage(from, reply);
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
});

async function sendWhatsAppMessage(to, text) {
  try {
    console.log(`📤 Sending reply to ${to}: ${text.substring(0, 50)}...`);
    
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
    
    console.log('✅ Message sent successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send message:', error.response?.data || error.message);
  }
}

const PORT = 8002;
app.listen(PORT, () => {
  console.log(`🚀 Simple webhook server running on port ${PORT}`);
  console.log(`📱 WhatsApp Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
  console.log(`🔑 Verify Token: ${process.env.WHATSAPP_VERIFY_TOKEN}`);
});