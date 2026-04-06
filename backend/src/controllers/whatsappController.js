const { verifyWebhook, parseWhatsAppMessage, sendWhatsAppMessage } = require("../utils/whatsapp");
const WhatsAppIntegration = require("../models/WhatsAppIntegration");
const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { makeGeminiRequest } = require("../services/geminiService");
const { AI_CONFIG } = require("../../ai-config");

// Import chat processing functions from chatController
const axios = require("axios");

/**
 * Handle WhatsApp webhook verification (GET)
 */
exports.verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    
    console.log("[WhatsApp] Webhook verification request received");
    
    const result = verifyWebhook(mode, token, challenge);
    
    if (result) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
    
  } catch (error) {
    console.error("[WhatsApp] Webhook verification error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Handle incoming WhatsApp messages (POST)
 */
exports.handleWebhook = async (req, res) => {
  try {
    console.log("[WhatsApp] 🚀 Webhook handler called!");
    console.log("[WhatsApp] Headers:", req.headers);
    console.log("[WhatsApp] Body:", JSON.stringify(req.body, null, 2));
    
    // Always return 200 immediately to acknowledge receipt
    res.status(200).send("OK");
    
    const messageData = parseWhatsAppMessage(req.body);
    
    if (!messageData) {
      console.log("[WhatsApp] No valid message found in webhook");
      return;
    }
    
    const { from, text, messageId } = messageData;
    
    // Process the message asynchronously
    processWhatsAppMessage(from, text, messageId).catch(error => {
      console.error("[WhatsApp] Error processing message:", error);
    });
    
  } catch (error) {
    console.error("[WhatsApp] Webhook handler error:", error);
  }
};

/**
 * Process incoming WhatsApp message
 * @param {string} senderId - Sender phone number
 * @param {string} messageText - Message content
 * @param {string} messageId - WhatsApp message ID
 */
async function processWhatsAppMessage(senderId, messageText, messageId) {
  try {
    console.log(`[WhatsApp] Processing message from ${senderId}: ${messageText}`);
    
    // Find business associated with this phone number
    // For now, we'll use a default business or the first one
    // In production, you'd map phone numbers to specific businesses
    const businessId = await getBusinessIdForWhatsApp(senderId);
    
    if (!businessId) {
      console.log(`[WhatsApp] No business found for phone number ${senderId}`);
      await sendWhatsAppMessage(senderId, "Sorry, I couldn't find your business account. Please contact support.");
      return;
    }
    
    // Call existing chat processing logic
    const reply = await handleIncomingMessage(senderId, messageText, "whatsapp", businessId);
    
    if (reply) {
      await sendWhatsAppMessage(senderId, reply);
    }
    
  } catch (error) {
    console.error(`[WhatsApp] Error processing message from ${senderId}:`, error);
    
    // Send error message to user
    try {
      await sendWhatsAppMessage(senderId, "Sorry, I'm having trouble processing your message right now. Please try again later.");
    } catch (sendError) {
      console.error("[WhatsApp] Failed to send error message:", sendError);
    }
  }
}

/**
 * Handle incoming message (adapted from existing chat logic)
 * @param {string} senderId - Sender identifier
 * @param {string} messageText - Message content
 * @param {string} source - Message source ("whatsapp", "web", etc.)
 * @param {string} businessId - Business ID
 * @returns {string} Reply message
 */
async function handleIncomingMessage(senderId, messageText, source = "whatsapp", businessId) {
  try {
    const contextKey = `context:${businessId}`;
    const historyKey = `history:${businessId}:${source}:${senderId}`;
    
    // Get business context
    const context = JSON.parse(await redis.get(contextKey) || "{}");
    
    if (!context.businessType) {
      console.log(`[WhatsApp] No context found for business ${businessId}`);
      return "I'm sorry, but I need to be configured for your business first. Please contact support.";
    }
    
    // Use the same chat processing logic as the web interface
    const reply = await processChatMessage(messageText, businessId, senderId, source);
    
    return reply || "I'm sorry, I couldn't process your message right now.";
    
  } catch (error) {
    console.error("[WhatsApp] Error in handleIncomingMessage:", error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Process chat message (extracted from chatController logic)
 */
async function processChatMessage(message, businessId, senderId, source) {
  const contextKey = `context:${businessId}`;
  const historyKey = `history:${businessId}:${source}:${senderId}`;

  try {
    const context = JSON.parse(await redis.get(contextKey) || "{}");
    
    if (!context.businessType) {
      return "Please load your business context first.";
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

    // Available slots
    const availableSlots = generateSlots(context, null) || [];

    // Build system prompt
    const systemPrompt = `
You are a friendly virtual assistant for a ${context.businessType}.
Tone: ${context.tone || 'friendly and professional'}
Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

BUSINESS DATA:
- Services: ${JSON.stringify(context.services)}
- Working hours: ${JSON.stringify(context.workingHours)}
- Available slots today: ${availableSlots.join(", ")}

UPCOMING BOOKINGS:
${bookingsInfo}

CONVERSATION STYLE:
- Be natural, friendly, WhatsApp-style (short messages)
- Greet users warmly, remind them of existing bookings
- Help with booking, rescheduling, canceling services

CRITICAL - YOU MUST USE FUNCTIONS:
- To CREATE a booking: CALL add_booking function
- To RESCHEDULE: CALL reschedule_booking function  
- To CANCEL: CALL cancel_booking function
- NEVER just say you did something - ALWAYS call the actual function
- When user confirms (yes, confirm, ok, sure), CALL the function immediately
- For returning customers, get their name/phone from existing bookings
- You can book multiple services - call add_booking for each one
`;

    // Define tools
    const tools = [
      {
        type: "function",
        function: {
          name: "add_booking",
          description: "Create a new booking. Call this when user wants to book a service.",
          parameters: {
            type: "object",
            properties: {
              service: { type: "string", description: "Service name (haircut, hair color, etc.)" },
              slot: { type: "string", description: "Time slot (e.g., '15:00' or '3 PM')" },
              date: { type: "string", description: "Date YYYY-MM-DD format. Default: today" },
              customer_name: { type: "string", description: "Customer name" },
              customer_phone: { type: "string", description: "Customer phone" }
            },
            required: ["service", "slot", "customer_name", "customer_phone"]
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
              new_slot: { type: "string", description: "New time slot" },
              new_date: { type: "string", description: "New date YYYY-MM-DD (optional)" }
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

    // Make AI request
    const aiResult = await makeAIRequest([
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ], tools, 0, 250); // Reduced from 300 to 250 tokens

    // Handle AI API failure with fallback
    if (!aiResult.success) {
      console.log('AI API failed, using fallback response:', aiResult.error);
      
      let fallbackReply;
      
      if (aiResult.error.status === 402) {
        fallbackReply = "I'm temporarily experiencing some technical difficulties with my AI service. However, I can still help you with basic questions about our services and bookings. What would you like to know?";
      } else {
        fallbackReply = generateFallbackResponse(message, context);
      }
      
      history.push(`User: ${message}`);
      history.push(`AI: ${fallbackReply}`);
      await redis.set(historyKey, JSON.stringify(history));
      
      return fallbackReply;
    }

    const aiMessage = aiResult.data.choices[0].message;
    
    // Handle function calls
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      let allResults = [];
      
      for (const toolCall of aiMessage.tool_calls) {
        const funcName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result = "";

        if (funcName === "add_booking") {
          try {
            const slot = parseSlot(args.slot);
            let bookingDate = new Date();
            if (args.date) bookingDate = new Date(args.date);
            
            const newBooking = await Booking.create({
              businessId,
              service: args.service.toLowerCase(),
              date: bookingDate,
              slot,
              customer: { name: args.customer_name, phone: args.customer_phone },
              status: "confirmed",
              source: source
            });
            result = `Booking created: ${args.service} at ${slot} for ${args.customer_name}. ID: ${newBooking._id}`;
          } catch (err) {
            result = `Failed to create booking: ${err.message}`;
          }
        } 
        else if (funcName === "reschedule_booking") {
          try {
            const newSlot = parseSlot(args.new_slot);
            const updateData = { slot: newSlot };
            if (args.new_date) updateData.date = new Date(args.new_date);
            
            await Booking.findByIdAndUpdate(args.booking_id, updateData);
            result = `Rescheduled to ${newSlot}`;
          } catch (err) {
            result = `Failed to reschedule: ${err.message}`;
          }
        }
        else if (funcName === "cancel_booking") {
          try {
            await Booking.findByIdAndUpdate(args.booking_id, { status: "canceled" });
            result = "Booking canceled";
          } catch (err) {
            result = `Failed to cancel: ${err.message}`;
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

      const followUpResult = await makeAIRequest([
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message },
        aiMessage,
        ...toolMessages
      ], []);
      
      let reply;
      if (followUpResult.success) {
        reply = followUpResult.data.choices[0].message.content;
      } else {
        reply = "I've processed your request. Is there anything else I can help you with?";
      }
      
      history.push(`User: ${message}`);
      history.push(`AI: ${reply}`);
      await redis.set(historyKey, JSON.stringify(history));
      
      return reply;
    }

    // No function call - just regular response
    const reply = aiMessage.content;

    history.push(`User: ${message}`);
    history.push(`AI: ${reply}`);
    await redis.set(historyKey, JSON.stringify(history));

    return reply;

  } catch (err) {
    console.error('Chat processing error:', err);
    return "I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

// Helper functions from chatController
function generateSlots(context, serviceName) {
  const workingHours = context.workingHours || { start: "09:00", end: "18:00" };
  const [startH, startM] = workingHours.start.split(":").map(Number);
  const [endH, endM] = workingHours.end.split(":").map(Number);

  let duration = 30; // default

  if (serviceName) {
    const service = (context.services || []).find(s => s.name.toLowerCase() === serviceName.toLowerCase());
    if (service && service.duration) {
      duration = service.duration;
    }
  }

  const slots = [];
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + duration <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    current += duration;
  }

  return slots;
}

function parseSlot(slot) {
  const pmMatch = slot.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|PM)/i);
  const amMatch = slot.match(/(\d{1,2})(?::(\d{2}))?\s*(am|AM)/i);
  
  if (pmMatch) {
    let hour = parseInt(pmMatch[1]);
    if (hour !== 12) hour += 12;
    const min = pmMatch[2] || "00";
    return `${hour}:${min}`;
  } else if (amMatch) {
    let hour = parseInt(amMatch[1]);
    if (hour === 12) hour = 0;
    const min = amMatch[2] || "00";
    return `${hour.toString().padStart(2, "0")}:${min}`;
  }
  return slot; 
}

async function makeAIRequest(messages, tools, retryCount = 0, maxTokens = 500) {
  try {
    return await makeGeminiRequest(messages, tools, retryCount, maxTokens);
  } catch (error) {
    console.log(`WhatsApp AI API request failed:`, error.message);
    
    // Return error details for fallback handling
    return { 
      success: false, 
      error: {
        message: error.message,
        code: error.code
      }
    };
  }
}

function generateFallbackResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
    return `I'd be happy to help you book an appointment! We offer the following services: ${context.services?.map(s => s.name).join(', ') || 'various services'}. What service would you like to book?`;
  }
  
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    const hours = context.workingHours;
    if (hours) {
      return `We're open from ${hours.start} to ${hours.end}. How can I help you today?`;
    }
    return "I can help you with our business hours and booking appointments. What would you like to know?";
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('what do you')) {
    const services = context.services?.map(s => `${s.name} (${s.duration} min, ${s.price})`).join(', ');
    return services ? `We offer: ${services}. Would you like to book any of these services?` : "We offer various services. How can I assist you today?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! Welcome to our ${context.businessType || 'business'}. I'm here to help you with bookings and questions. How can I assist you today?`;
  }
  
  return "I'm sorry, I'm having trouble connecting to our AI service right now. However, I can still help you with booking appointments, checking our services, and answering basic questions. What would you like to know?";
}

/**
 * Get business ID for WhatsApp phone number
 * @param {string} phoneNumber - WhatsApp phone number
 * @returns {string|null} Business ID or null if not found
 */
async function getBusinessIdForWhatsApp(phoneNumber) {
  try {
    console.log(`[WhatsApp] Getting business ID for phone: ${phoneNumber}`);
    
    // First, try to get from our phone mapping
    const mappingData = await redis.get("phone_business_mapping");
    if (mappingData) {
      const mapping = JSON.parse(mappingData);
      if (mapping[phoneNumber]) {
        console.log(`[WhatsApp] Found business ID from mapping: ${mapping[phoneNumber]}`);
        return mapping[phoneNumber];
      }
    }
    
    // Try to find existing integration
    const integration = await WhatsAppIntegration.findOne({ 
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      status: "active"
    });
    
    if (integration) {
      console.log(`[WhatsApp] Found business ID from integration: ${integration.businessId}`);
      return integration.businessId.toString();
    }
    
    // Use default business ID for testing
    console.log("[WhatsApp] Using default business ID for testing");
    return "default_business_123";
    
  } catch (error) {
    console.error("[WhatsApp] Error getting business ID:", error);
    // Return default business ID even on error
    return "default_business_123";
  }
}

module.exports = {
  processWhatsAppMessage,
  handleIncomingMessage,
  verifyWebhook: exports.verifyWebhook,
  handleWebhook: exports.handleWebhook
};