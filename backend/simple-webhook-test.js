// Simple webhook to see what WhatsApp is actually sending
const express = require('express');
const app = express();

app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get('/webhook', (req, res) => {
  console.log('🔍 Webhook verification request');
  console.log('Query:', req.query);
  
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'divyansh_saas_2026') {
    console.log('✅ Verification successful');
    res.send(req.query['hub.challenge']);
  } else {
    console.log('❌ Verification failed');
    res.status(403).send('Forbidden');
  }
});

app.post('/webhook', (req, res) => {
  console.log('\n📱 INCOMING WHATSAPP MESSAGE:');
  console.log('Time:', new Date().toLocaleString());
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Extract message if it exists
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message) {
      console.log(`📞 From: ${message.from}`);
      console.log(`💬 Text: ${message.text?.body}`);
      console.log(`🆔 ID: ${message.id}`);
    }
  } catch (e) {
    console.log('Could not parse message');
  }
  
  res.send('OK');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Simple webhook test running', time: new Date() });
});

app.listen(3002, () => {
  console.log('🔍 Simple Webhook Test running on port 3002');
  console.log('📋 Next steps:');
  console.log('1. Run: ngrok http 3002');
  console.log('2. Update WhatsApp webhook to new ngrok URL');
  console.log('3. Send WhatsApp message');
  console.log('4. Watch this console for incoming messages');
});