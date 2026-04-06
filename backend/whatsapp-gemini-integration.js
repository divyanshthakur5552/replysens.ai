require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redis = require('./src/config/redis');
const { makeGeminiRequest } = require('./src/services/geminiService');
const { sendWhatsAppMessage } = require('./src/utils/whatsapp');

// Create a standalone WhatsApp + Gemini server
const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Starting WhatsApp + Gemini AI Integration Server...');

// Webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('📞 Webhook verification request received');
  console.log('Mode:', mode);
  console.log('Token:', token);
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Webhook message handler (POST)
app.post('/webhook', async (req, res) => {
  console.log('📨 Incoming webhook message');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      
      for (const entry of entries) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const value = change.value;
            const messages = value.messages || [];
            
            for (const message of messages) {
              if (message.type === 'text') {
                const from = message.from;
                const messageText = message.text.body;
                const messageId = message.id;
                
                console.log(`📱 Message from ${from}: "${messageText}"`);
                
                // Process the message with AI
                await processWhatsAppMessage(from, messageText, messageId);
              }
            }
          }
        }
      }
    }
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Process WhatsApp message with Gemini AI
async function processWhatsAppMessage(senderId, messageText, messageId) {
  try {
    console.log(`🤖 Processing message from ${senderId}: "${messageText}"`);
    
    // Get or create conversation history
    const historyKey = `whatsapp_history:${senderId}`;
    let history = JSON.parse(await redis.get(historyKey) || '[]');
    
    // Get business context (use default for now)
    const contextKey = 'context:whatsapp_business_default';
    const context = JSON.parse(await redis.get(contextKey) || '{}');
    
    if (!context.businessType) {
      // Setup default context if not exists
      const defaultContext = {
        businessType: 'AI Assistant',
        tone: 'friendly and helpful',
        services: [
          { name: 'general assistance', duration: 5, price: 'Free' },
          { name: 'information lookup', duration: 10, price: 'Free' }
        ],
        workingHours: { start: '00:00', end: '23:59' }
      };
      await redis.set(contextKey, JSON.stringify(defaultContext));
      Object.assign(context, defaultContext);
    }
    
    // Build system prompt
    const systemPrompt = `
You are a friendly AI assistant accessible via WhatsApp.
Business Type: ${context.businessType}
Tone: ${context.tone}
Current Time: ${new Date().toLocaleString()}

CONVERSATION STYLE:
- Keep responses short and conversational (WhatsApp style)
- Be helpful and friendly
- If asked about services, mention: ${context.services?.map(s => s.name).join(', ')}
- Available 24/7 to help with questions and tasks

CAPABILITIES:
- Answer questions on various topics
- Provide information and explanations
- Help with problem-solving
- Engage in friendly conversation
- Remember context from our conversation

Keep responses under 300 characters when possible for better WhatsApp experience.
`;

    // Format conversation history
    const formattedHistory = history.slice(-10).map(h => {
      const [role, ...textParts] = h.split(': ');
      return { 
        role: role.toLowerCase() === 'user' ? 'user' : 'assistant', 
        content: textParts.join(': ') 
      };
    });
    
    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: messageText }
    ];
    
    console.log('🧠 Generating AI response...');
    
    // Get AI response
    const aiResult = await makeGeminiRequest(messages, [], 0, 200);
    
    if (aiResult.success) {
      const aiResponse = aiResult.data.choices[0].message.content;
      console.log(`💬 AI Response: "${aiResponse}"`);
      
      // Send response via WhatsApp
      const sendResult = await sendWhatsAppMessage(senderId, aiResponse);
      
      if (sendResult.success) {
        console.log('✅ Message sent successfully');
        
        // Update conversation history
        history.push(`User: ${messageText}`);
        history.push(`AI: ${aiResponse}`);
        
        // Keep only last 20 messages to manage memory
        if (history.length > 20) {
          history = history.slice(-20);
        }
        
        await redis.set(historyKey, JSON.stringify(history));
        
      } else {
        console.error('❌ Failed to send WhatsApp message:', sendResult.error);
      }
      
    } else {
      console.error('❌ AI request failed:', aiResult.error);
      
      // Send fallback response
      const fallbackMessage = "I'm having trouble processing your message right now. Please try again in a moment.";
      await sendWhatsAppMessage(senderId, fallbackMessage);
    }
    
  } catch (error) {
    console.error('❌ Error processing WhatsApp message:', error);
    
    // Send error response
    try {
      await sendWhatsAppMessage(senderId, "Sorry, I encountered an error. Please try again.");
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp + Gemini AI Integration',
    timestamp: new Date().toISOString(),
    whatsapp: {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ? 'configured' : 'missing'
    },
    ai: {
      provider: 'google-gemini',
      model: 'gemini-2.5-flash',
      apiKey: process.env.GOOGLE_GEMINI_API_KEY ? 'configured' : 'missing'
    }
  });
});

// Test endpoint
app.post('/test-message', async (req, res) => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }
  
  try {
    console.log(`🧪 Test message to ${phone}: "${message}"`);
    await processWhatsAppMessage(phone, message, 'test_' + Date.now());
    res.json({ success: true, message: 'Test message processed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp + Gemini AI server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('\n📋 Next steps:');
  console.log('1. Start ngrok: ngrok http 8000');
  console.log('2. Update WhatsApp webhook URL with ngrok URL');
  console.log('3. Send a message to your WhatsApp Business number!');
});