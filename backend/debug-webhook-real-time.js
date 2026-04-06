const express = require("express");
const app = express();

app.use(express.json());

// Create a simple webhook logger to see what WhatsApp is actually sending
app.get("/webhook", (req, res) => {
  console.log("🔍 GET Webhook Verification Request:");
  console.log("Query params:", req.query);
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  
  if (mode === "subscribe" && token === "divyansh_saas_2026") {
    console.log("✅ Verification successful, sending challenge:", challenge);
    res.status(200).send(challenge);
  } else {
    console.log("❌ Verification failed");
    res.status(403).send("Forbidden");
  }
});

app.post("/webhook", (req, res) => {
  console.log("\n📱 POST Webhook - Incoming Message:");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  
  // Check if it's a WhatsApp message
  if (req.body.object === "whatsapp_business_account") {
    console.log("✅ This is a WhatsApp message!");
    
    // Extract message details
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;
    
    if (messages && messages.length > 0) {
      const message = messages[0];
      console.log(`📞 From: ${message.from}`);
      console.log(`💬 Message: ${message.text?.body || 'Non-text message'}`);
      console.log(`🆔 Message ID: ${message.id}`);
      console.log(`⏰ Timestamp: ${message.timestamp}`);
    }
  } else {
    console.log("❓ Unknown webhook payload");
  }
  
  res.status(200).send("OK");
});

app.get("/health", (req, res) => {
  res.json({ status: "Webhook debugger running", time: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔍 Webhook Debugger running on port ${PORT}`);
  console.log(`📋 To test:`);
  console.log(`1. Run: ngrok http ${PORT}`);
  console.log(`2. Update WhatsApp webhook to the new ngrok URL`);
  console.log(`3. Send WhatsApp messages and watch this console`);
  console.log(`\n🎯 This will show you exactly what WhatsApp is sending`);
});