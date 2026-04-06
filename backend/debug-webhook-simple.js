const express = require('express');
const app = express();

app.use(express.json());

// Simple webhook handler for debugging
app.get('/webhook', (req, res) => {
  console.log('🔍 GET /webhook called');
  console.log('Query params:', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === 'divyansh_saas_2026') {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

app.post('/webhook', (req, res) => {
  console.log('📨 POST /webhook called');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).send('OK');
});

app.listen(8001, () => {
  console.log('🚀 Debug webhook server running on port 8001');
});