const express = require('express');
const axios = require('axios');
const redis = require('./src/config/redis');
const Booking = require('./src/models/Booking');
const connectDB = require('./src/config/db');
const { makeGeminiRequest } = require('./src/services/geminiService');
const { AI_CONFIG } = require('./ai-config');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to database
connectDB();

console.log('🤖 Advanced WhatsApp AI Bot Started');
console.log('📱 Monitoring for messages from: +91 8352986476');
console.log('🧠 AI Features: Gemini 2.5 Flash, Tool calling, booking management, conversation memory');
console.log('⏰ Started at:', new Date().toLocaleString());
console.log('🔧 AI Model:', AI_CONFIG.model);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Webhook verification
app.get('/webhook', (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 🔍 GET /webhook - Verification request`);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log(`[${timestamp}] ✅ Webhook verified successfully`);
    res.status(200).send(challenge);
  } else {
    console.log(`[${timestamp}] ❌ Webhook verification failed`);
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages with full AI processing
app.post('/webhook', async (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 📨 WhatsApp message received`);
  
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
      
      console.log(`[${timestamp}] 📱 From: ${from}, Message: "${text}"`);
      
      // Check if it's from your number
      if (from === '918352986476' || from === '8352986476') {
        console.log(`[${timestamp}] 🧠 Processing with AI...`);
        
        // Process with full AI system
        const aiReply = await processWithAI(from, text, timestamp);
        
        if (aiReply) {
          await sendWhatsAppMessage(from, aiReply, timestamp);
        }
      } else {
        console.log(`[${timestamp}] ℹ️ Message from different number: ${from}`);
      }
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error processing message:`, error);
  }
});

async function processWithAI(senderId, messageText, timestamp) {
  try {
    const businessId = "default_business_123";
    const source = "whatsapp";
    const contextKey = `context:${businessId}`;
    const historyKey = `history:${businessId}:${source}:${senderId}`;
    
    // Get business context
    const context = JSON.parse(await redis.get(contextKey) || "{}");
    
    if (!context.businessType) {
      console.log(`[${timestamp}] ⚠️ No business context found, using default`);
      // Set default context
      const defaultContext = {
        businessType: "Hair Salon",
        services: [
          { name: "haircut", duration: 30, price: "$25" },
          { name: "hair color", duration: 60, price: "$50" },
          { name: "styling", duration: 45, price: "$35" }
        ],
        workingHours: { start: "09:00", end: "18:00" },
        tone: "friendly and professional"
      };
      await redis.set(contextKey, JSON.stringify(defaultContext));
      context = defaultContext;
    }
    
    let history = JSON.parse(await redis.get(historyKey) || "[]");
    
    // Fetch upcoming bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBookings = await Booking.find({
      businessId,
      date: { $gte: today },
      status: { $in: ["confirmed", "pending"] }
    }).sort({ date: 1 }).limit(10);

    const bookingsInfo = upcomingBookings.length > 0 
      ? upcomingBookings.map(b => {
          const dateStr = new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          return `ID:${b._id} | ${b.service} | ${dateStr} at ${b.slot} | ${b.status} | Customer: ${b.customer?.name || "N/A"} (${b.customer?.phone || "N/A"})`;
        }).join("\n")
      : "No upcoming bookings";

    // Available slots for tomorrow (March 10th)
    const availableSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

    // Build system prompt with better function calling instructions
    const systemPrompt = `
You are a friendly AI assistant for AI Hair Studio, a hair salon.
Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Tomorrow's date: ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

BUSINESS INFO:
- Services: haircut ($25, 30min), hair color ($50, 60min), styling ($35, 45min)
- Working hours: 9:00 AM - 6:00 PM
- Available slots for tomorrow (March 10th): ${availableSlots.join(", ")}

CURRENT BOOKINGS:
${bookingsInfo}

CUSTOMER INFO:
- Name: Divyansh Thakur
- Phone: +91 8352986476

CONVERSATION STYLE:
- Be natural, friendly, and helpful
- Use WhatsApp-style short messages
- Help with booking, rescheduling, canceling appointments
- Remember previous conversation context

CRITICAL FUNCTION CALLING RULES:
1. ALWAYS use add_booking function when customer wants to book ANY service
2. When customer says "tomorrow", use date: "2024-03-10"
3. Convert time formats: "2 PM" = "14:00", "10 AM" = "10:00"
4. If customer confirms booking details, IMMEDIATELY call add_booking
5. NEVER just say you'll book something - ALWAYS call the function
6. For any booking request, ask for confirmation then call the function

BOOKING PROCESS:
1. Customer requests booking → Ask for confirmation of details
2. Customer confirms → IMMEDIATELY call add_booking function
3. Function executes → Confirm booking created

EXAMPLES:
- "I want a haircut tomorrow at 2 PM" → Call add_booking with date: "2024-03-10", slot: "14:00"
- "Book styling for me tomorrow 10 AM" → Call add_booking with date: "2024-03-10", slot: "10:00"
`;

    // Define tools with better descriptions
    const tools = [
      {
        type: "function",
        function: {
          name: "add_booking",
          description: "REQUIRED: Create a new booking appointment. MUST be called when customer wants to book any service.",
          parameters: {
            type: "object",
            properties: {
              service: { 
                type: "string", 
                description: "Service name: 'haircut', 'hair color', or 'styling'",
                enum: ["haircut", "hair color", "styling"]
              },
              slot: { 
                type: "string", 
                description: "Time slot in 24-hour format HH:MM (e.g., '14:00' for 2 PM, '10:00' for 10 AM)" 
              },
              date: { 
                type: "string", 
                description: "Date in YYYY-MM-DD format. Use '2024-03-10' for tomorrow." 
              },
              customer_name: { 
                type: "string", 
                description: "Customer name - use 'Divyansh Thakur'" 
              },
              customer_phone: { 
                type: "string", 
                description: "Customer phone - use '+91 8352986476'" 
              }
            },
            required: ["service", "slot", "date", "customer_name", "customer_phone"]
          }
        }
      },
      {
        type: "function", 
        function: {
          name: "reschedule_booking",
          description: "Change time/date of existing booking",
          parameters: {
            type: "object",
            properties: {
              booking_id: { type: "string", description: "Booking ID to reschedule" },
              new_slot: { type: "string", description: "New time slot in HH:MM format" },
              new_date: { type: "string", description: "New date in YYYY-MM-DD format (optional)" }
            },
            required: ["booking_id", "new_slot"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "cancel_booking", 
          description: "Cancel an existing booking",
          parameters: {
            type: "object",
            properties: {
              booking_id: { type: "string", description: "Booking ID to cancel" }
            },
            required: ["booking_id"]
          }
        }
      }
    ];

    // Format history
    const formattedHistory = history.map(h => {
      const [role, ...textParts] = h.split(": ");
      return { role: role.toLowerCase() === "user" ? "user" : "assistant", content: textParts.join(": ") };
    });

    console.log(`[${timestamp}] 🤖 Making Gemini AI request...`);

    // Make AI request using Gemini SDK
    const aiResult = await makeGeminiRequest([
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: messageText }
    ], tools, 0, 200);

    if (!aiResult.success) {
      console.log(`[${timestamp}] ❌ AI API failed:`, aiResult.error);
      return "I'm having some technical difficulties right now. Please try again in a moment.";
    }

    const aiMessage = aiResult.data.choices[0].message;
    
    // Handle function calls
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      console.log(`[${timestamp}] 🔧 Processing ${aiMessage.tool_calls.length} tool calls...`);
      
      let allResults = [];
      
      for (const toolCall of aiMessage.tool_calls) {
        const funcName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result = "";

        console.log(`[${timestamp}] 🛠️ Calling ${funcName} with:`, args);

        if (funcName === "add_booking") {
          try {
            let bookingDate = new Date();
            if (args.date) bookingDate = new Date(args.date);
            
            const newBooking = await Booking.create({
              businessId,
              service: args.service.toLowerCase(),
              date: bookingDate,
              slot: args.slot,
              customer: { name: args.customer_name, phone: args.customer_phone },
              status: "confirmed",
              source: source
            });
            
            result = `✅ Booking created successfully! ID: ${newBooking._id}`;
            console.log(`[${timestamp}] ✅ Booking created:`, newBooking._id);
          } catch (err) {
            result = `❌ Failed to create booking: ${err.message}`;
            console.log(`[${timestamp}] ❌ Booking failed:`, err.message);
          }
        } 
        else if (funcName === "reschedule_booking") {
          try {
            const updateData = { slot: args.new_slot };
            if (args.new_date) updateData.date = new Date(args.new_date);
            
            await Booking.findByIdAndUpdate(args.booking_id, updateData);
            result = `✅ Booking rescheduled successfully`;
            console.log(`[${timestamp}] ✅ Booking rescheduled:`, args.booking_id);
          } catch (err) {
            result = `❌ Failed to reschedule: ${err.message}`;
          }
        }
        else if (funcName === "cancel_booking") {
          try {
            await Booking.findByIdAndUpdate(args.booking_id, { status: "canceled" });
            result = `✅ Booking canceled successfully`;
            console.log(`[${timestamp}] ✅ Booking canceled:`, args.booking_id);
          } catch (err) {
            result = `❌ Failed to cancel: ${err.message}`;
          }
        }
        
        allResults.push({ id: toolCall.id, result });
      }
      
      // Get AI's final response after function execution
      const toolMessages = allResults.map(r => ({
        role: "tool",
        tool_call_id: r.id,
        content: r.result
      }));

      const followUpResult = await makeGeminiRequest([
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: messageText },
        aiMessage,
        ...toolMessages
      ], [], 0, 150);
      
      let reply;
      if (followUpResult.success) {
        reply = followUpResult.data.choices[0].message.content;
      } else {
        reply = "I've processed your request. Is there anything else I can help you with?";
      }
      
      // Save to history
      history.push(`User: ${messageText}`);
      history.push(`AI: ${reply}`);
      await redis.set(historyKey, JSON.stringify(history));
      
      return reply;
    }

    // No function call - just regular response
    const reply = aiMessage.content;

    // Save to history
    history.push(`User: ${messageText}`);
    history.push(`AI: ${reply}`);
    await redis.set(historyKey, JSON.stringify(history));

    return reply;

  } catch (err) {
    console.error(`[${timestamp}] ❌ AI processing error:`, err);
    return "I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

async function sendWhatsAppMessage(to, text, timestamp) {
  try {
    console.log(`[${timestamp}] 📤 Sending AI reply: "${text.substring(0, 50)}..."`);
    
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
    
    console.log(`[${timestamp}] ✅ Message sent successfully`);
    return response.data;
  } catch (error) {
    console.error(`[${timestamp}] ❌ Failed to send message:`, error.response?.data || error.message);
  }
}

const PORT = 8002;
app.listen(PORT, () => {
  console.log(`🚀 Advanced AI webhook running on port ${PORT}`);
  console.log(`🌐 Webhook URL: https://nonrefined-newspaperish-garrett.ngrok-free.dev/webhook`);
});