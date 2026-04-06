const express = require('express');
const axios = require('axios');
const redis = require('./src/config/redis');
const Booking = require('./src/models/Booking');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to database
connectDB();

console.log('🤖 Lightweight AI Bot Started (Credit-Optimized)');
console.log('📱 Monitoring for messages from: +91 8352986476');
console.log('💰 Low-credit mode: Smart fallbacks + minimal AI usage');
console.log('⏰ Started at:', new Date().toLocaleString());
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages with smart fallback
app.post('/webhook', async (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 📨 WhatsApp message received`);
  
  res.status(200).send('OK');
  
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    
    if (message && message.type === 'text') {
      const from = message.from;
      const text = message.text.body.toLowerCase();
      
      console.log(`[${timestamp}] 📱 From: ${from}, Message: "${text}"`);
      
      if (from === '918352986476' || from === '8352986476') {
        console.log(`[${timestamp}] 🧠 Processing message...`);
        
        let reply = await processMessage(text, from, timestamp);
        
        if (reply) {
          await sendWhatsAppMessage(from, reply, timestamp);
        }
      }
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error:`, error);
  }
});

async function processMessage(text, from, timestamp) {
  try {
    // Smart pattern matching for common booking requests
    if (isBookingRequest(text)) {
      return await handleBookingRequest(text, from, timestamp);
    }
    
    // Handle greetings
    if (isGreeting(text)) {
      return "Hello Divyansh! 👋 I'm your AI booking assistant for AI Hair Studio. I can help you book:\n\n• Haircut ($25, 30min)\n• Hair Color ($50, 60min) \n• Styling ($35, 45min)\n\nWhat would you like to book?";
    }
    
    // Handle service inquiries
    if (isServiceInquiry(text)) {
      return "We offer these services:\n\n💇‍♂️ Haircut - $25 (30 minutes)\n🎨 Hair Color - $50 (60 minutes)\n✨ Styling - $35 (45 minutes)\n\nWe're open 9 AM - 6 PM. Which service interests you?";
    }
    
    // Handle hours inquiry
    if (isHoursInquiry(text)) {
      return "We're open Monday-Sunday, 9:00 AM to 6:00 PM. Available slots for tomorrow (March 10th): 9 AM, 10 AM, 11 AM, 2 PM, 3 PM, 4 PM, 5 PM. What time works for you?";
    }
    
    // Use AI for complex requests (only when necessary)
    if (needsAI(text)) {
      return await processWithAI(text, from, timestamp);
    }
    
    // Default helpful response
    return "I can help you book appointments at AI Hair Studio! Try saying:\n• 'Book haircut tomorrow 2 PM'\n• 'What services do you offer?'\n• 'What are your hours?'\n\nWhat would you like to do?";
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Processing error:`, error);
    return "I'm here to help with bookings! What service would you like to book?";
  }
}

function isBookingRequest(text) {
  const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'haircut', 'hair color', 'styling'];
  return bookingKeywords.some(keyword => text.includes(keyword));
}

function isGreeting(text) {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
  return greetings.some(greeting => text.includes(greeting));
}

function isServiceInquiry(text) {
  const serviceKeywords = ['service', 'what do you', 'price', 'cost', 'offer'];
  return serviceKeywords.some(keyword => text.includes(keyword));
}

function isHoursInquiry(text) {
  const hoursKeywords = ['hours', 'open', 'close', 'time', 'when'];
  return hoursKeywords.some(keyword => text.includes(keyword));
}

function needsAI(text) {
  // Only use AI for complex booking requests or unclear messages
  return text.length > 50 || text.includes('reschedule') || text.includes('cancel');
}

async function handleBookingRequest(text, from, timestamp) {
  try {
    // Extract booking details using pattern matching
    const service = extractService(text);
    const timeInfo = extractTime(text);
    
    if (service && timeInfo.slot) {
      // Create booking directly
      console.log(`[${timestamp}] 🛠️ Creating booking: ${service} at ${timeInfo.slot}`);
      
      const bookingDate = timeInfo.date || new Date('2026-03-10'); // Default to tomorrow
      
      const newBooking = await Booking.create({
        businessId: "default_business_123",
        service: service,
        date: bookingDate,
        slot: timeInfo.slot,
        customer: { name: "Divyansh Thakur", phone: "918352986476" },
        status: "confirmed",
        source: "whatsapp"
      });
      
      console.log(`[${timestamp}] ✅ Booking created:`, newBooking._id);
      
      return `✅ Perfect! I've booked your ${service} for ${formatDate(bookingDate)} at ${formatTime(timeInfo.slot)}.\n\n📋 Booking Details:\n• Service: ${service}\n• Date: ${formatDate(bookingDate)}\n• Time: ${formatTime(timeInfo.slot)}\n• Booking ID: ${newBooking._id}\n\nSee you then! 😊`;
    }
    
    // If missing details, ask for them
    if (!service) {
      return "I'd love to help you book! Which service would you like?\n\n💇‍♂️ Haircut ($25)\n🎨 Hair Color ($50)\n✨ Styling ($35)";
    }
    
    if (!timeInfo.slot) {
      return `Great choice on the ${service}! What time works for you tomorrow (March 10th)?\n\nAvailable slots:\n• 9:00 AM\n• 10:00 AM\n• 11:00 AM\n• 2:00 PM\n• 3:00 PM\n• 4:00 PM\n• 5:00 PM`;
    }
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Booking error:`, error);
    return "I'd be happy to help you book! Please tell me:\n1. Which service? (haircut, hair color, or styling)\n2. What time tomorrow works for you?";
  }
}

function extractService(text) {
  if (text.includes('haircut') || text.includes('hair cut')) return 'haircut';
  if (text.includes('color') || text.includes('colour')) return 'hair color';
  if (text.includes('styling') || text.includes('style')) return 'styling';
  return null;
}

function extractTime(text) {
  // Extract time patterns
  const timePatterns = [
    /(\d{1,2})\s*(pm|am)/i,
    /(\d{1,2}):(\d{2})\s*(pm|am)?/i,
    /(morning|afternoon|evening)/i
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1] && (match[2] === 'pm' || match[2] === 'am')) {
        let hour = parseInt(match[1]);
        if (match[2] === 'pm' && hour !== 12) hour += 12;
        if (match[2] === 'am' && hour === 12) hour = 0;
        return { slot: `${hour.toString().padStart(2, '0')}:00` };
      }
    }
  }
  
  // Common time mappings
  if (text.includes('2 pm') || text.includes('2pm')) return { slot: '14:00' };
  if (text.includes('3 pm') || text.includes('3pm')) return { slot: '15:00' };
  if (text.includes('morning')) return { slot: '10:00' };
  if (text.includes('afternoon')) return { slot: '14:00' };
  
  return { slot: null };
}

async function processWithAI(text, from, timestamp) {
  try {
    console.log(`[${timestamp}] 🤖 Using AI for complex request...`);
    
    // Ultra-minimal prompt to save tokens
    const messages = [
      {
        role: "system", 
        content: "You're a booking assistant for AI Hair Studio. Services: haircut ($25), hair color ($50), styling ($35). Hours: 9AM-6PM. Customer: Divyansh. Be helpful and brief."
      },
      {
        role: "user",
        content: text
      }
    ];
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 100 // Very low to save credits
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "HTTP-Referer": "http://localhost",
          "X-Title": "ReplySense AI"
        },
        timeout: 15000
      }
    );
    
    console.log(`[${timestamp}] ✅ AI response received`);
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.log(`[${timestamp}] ❌ AI failed, using fallback`);
    return "I can help you book appointments! Please tell me which service you'd like and what time works for you tomorrow.";
  }
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatTime(slot) {
  const [hour, minute] = slot.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayHour}:${minute} ${ampm}`;
}

async function sendWhatsAppMessage(to, text, timestamp) {
  try {
    console.log(`[${timestamp}] 📤 Sending reply: "${text.substring(0, 50)}..."`);
    
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
  console.log(`🚀 Lightweight AI webhook running on port ${PORT}`);
  console.log(`💰 Credit-optimized: Pattern matching + minimal AI usage`);
});