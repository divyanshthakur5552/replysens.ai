const axios = require("axios");
const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { makeGeminiRequest } = require("../services/geminiService");
const { AI_CONFIG } = require("../../ai-config");

// Slot Generation Logic
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

// AI API helper with retry logic and fallback using Gemini SDK
async function makeAIRequest(messages, tools, retryCount = 0, maxTokens = 500) {
  try {
    return await makeGeminiRequest(messages, tools, retryCount, maxTokens);
  } catch (error) {
    console.log(`AI API request failed:`, error.message);
    
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

// Fallback response generator
function generateFallbackResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Booking-related responses
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
    return `I'd be happy to help you book an appointment! We offer the following services: ${context.services?.map(s => s.name).join(', ') || 'various services'}. What service would you like to book?`;
  }
  
  // Hours-related responses
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    const hours = context.workingHours;
    if (hours) {
      return `We're open from ${hours.start} to ${hours.end}. How can I help you today?`;
    }
    return "I can help you with our business hours and booking appointments. What would you like to know?";
  }
  
  // Services-related responses
  if (lowerMessage.includes('service') || lowerMessage.includes('what do you')) {
    const services = context.services?.map(s => `${s.name} (${s.duration} min, $${s.price})`).join(', ');
    return services ? `We offer: ${services}. Would you like to book any of these services?` : "We offer various services. How can I assist you today?";
  }
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! Welcome to our ${context.businessType || 'business'}. I'm here to help you with bookings and questions. How can I assist you today?`;
  }
  
  // Default fallback
  return "I'm sorry, I'm having trouble connecting to our AI service right now. However, I can still help you with booking appointments, checking our services, and answering basic questions. What would you like to know?";
}

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  const businessId = req.businessId;
  const contextKey = `context:${businessId}`;
  const historyKey = `history:${businessId}`;

  try {
    const context = JSON.parse(await redis.get(contextKey) || "{}");
    
    if (!context.businessType) {
      return res.status(400).json({ 
        error: "Context not loaded", 
        message: "Please load your business context first via POST /context/load" 
      });
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

    // Make AI request with retry logic
    const aiResult = await makeAIRequest([
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ], tools);

    // Handle AI API failure with fallback
    if (!aiResult.success) {
      console.log('AI API failed, using fallback response:', aiResult.error);
      
      let fallbackReply;
      
      // Handle specific error types
      if (aiResult.error.status === 402) {
        fallbackReply = "I'm temporarily experiencing some technical difficulties with my AI service. However, I can still help you with basic questions about our services and bookings. What would you like to know?";
      } else {
        fallbackReply = generateFallbackResponse(message, context);
      }
      
      history.push(`User: ${message}`);
      history.push(`AI: ${fallbackReply}`);
      await redis.set(historyKey, JSON.stringify(history));
      
      return res.json({ 
        reply: fallbackReply, 
        history,
        fallback: true,
        error: "AI service temporarily unavailable"
      });
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
              source: "web"
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
      ], [], 0, 300); // Empty tools array instead of null
      
      let reply;
      if (followUpResult.success) {
        reply = followUpResult.data.choices[0].message.content;
      } else {
        // Fallback for follow-up response
        reply = "I've processed your request. Is there anything else I can help you with?";
      }
      
      history.push(`User: ${message}`);
      history.push(`AI: ${reply}`);
      await redis.set(historyKey, JSON.stringify(history));
      
      return res.json({ reply, history });
    }

    // No function call - just regular response
    const reply = aiMessage.content;

    history.push(`User: ${message}`);
    history.push(`AI: ${reply}`);
    await redis.set(historyKey, JSON.stringify(history));

    return res.json({ reply, history });

  } catch (err) {
    console.error('Chat controller error:', err);
    
    // Final fallback for any unexpected errors
    return res.status(500).json({ 
      error: "Service temporarily unavailable", 
      message: "I'm having trouble processing your request right now. Please try again in a moment.",
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};