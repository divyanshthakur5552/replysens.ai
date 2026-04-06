const express = require('express');
const axios = require('axios');
const Booking = require('./src/models/Booking');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to database
connectDB();

console.log('🤖 NO-AI WhatsApp Bot Started');
console.log('📱 Monitoring for messages from: +91 8352986476');
console.log('🚫 Zero AI usage - Pure pattern matching & rule-based responses');
console.log('⏰ Started at:', new Date().toLocaleString());
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Webhook verification
app.get('/webhook', (req, res) => {
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

// Handle incoming messages - NO AI, pure pattern matching
app.post('/webhook', async (req, res) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] 📨 Message received`);
  
  res.status(200).send('OK');
  
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    
    if (message && message.type === 'text') {
      const from = message.from;
      const text = message.text.body.toLowerCase().trim();
      
      console.log(`[${timestamp}] 📱 From: ${from}, Message: "${text}"`);
      
      if (from === '918352986476' || from === '8352986476') {
        console.log(`[${timestamp}] 🔍 Processing with pattern matching...`);
        
        const reply = processMessage(text, timestamp);
        
        if (reply) {
          await sendWhatsAppMessage(from, reply, timestamp);
        }
      }
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error:`, error);
  }
});

function processMessage(text, timestamp) {
  console.log(`[${timestamp}] 🧠 Analyzing: "${text}"`);
  
  // Greeting responses
  if (isGreeting(text)) {
    console.log(`[${timestamp}] 👋 Detected greeting`);
    return "Hello Divyansh! 👋 Welcome to AI Hair Studio!\n\nI can help you book:\n💇‍♂️ Haircut - $25 (30 min)\n🎨 Hair Color - $50 (60 min)\n✨ Styling - $35 (45 min)\n\nJust say 'book haircut 2pm' or ask about our services!";
  }
  
  // Service inquiry
  if (isServiceInquiry(text)) {
    console.log(`[${timestamp}] 💼 Detected service inquiry`);
    return "Our services at AI Hair Studio:\n\n💇‍♂️ **Haircut** - $25 (30 minutes)\n🎨 **Hair Color** - $50 (60 minutes)\n✨ **Styling** - $35 (45 minutes)\n\nWe're open 9 AM - 6 PM daily.\nWhich service interests you?";
  }
  
  // Hours inquiry
  if (isHoursInquiry(text)) {
    console.log(`[${timestamp}] 🕒 Detected hours inquiry`);
    return "📅 **Business Hours:**\nMonday - Sunday: 9:00 AM - 6:00 PM\n\n⏰ **Available tomorrow (March 10th):**\n• 9:00 AM\n• 10:00 AM\n• 11:00 AM\n• 2:00 PM\n• 3:00 PM\n• 4:00 PM\n• 5:00 PM\n\nWhat time works for you?";
  }
  
  // Booking request - this is the main functionality
  if (isBookingRequest(text)) {
    console.log(`[${timestamp}] 📅 Detected booking request`);
    return handleBookingRequest(text, timestamp);
  }
  
  // Price inquiry
  if (isPriceInquiry(text)) {
    console.log(`[${timestamp}] 💰 Detected price inquiry`);
    return "💰 **Our Prices:**\n\n💇‍♂️ Haircut: $25\n🎨 Hair Color: $50\n✨ Styling: $35\n\nAll services include consultation and styling tips!\nReady to book?";
  }
  
  // Help/menu
  if (isHelpRequest(text)) {
    console.log(`[${timestamp}] ❓ Detected help request`);
    return "🤖 **How I can help:**\n\n📅 Book appointments\n💰 Check prices\n🕒 Show business hours\n💼 List services\n\n**Try saying:**\n• 'Book haircut 2pm tomorrow'\n• 'What are your prices?'\n• 'What time are you open?'\n\nWhat would you like to do?";
  }
  
  // Default response
  console.log(`[${timestamp}] 🤷 Using default response`);
  return "I'm here to help with bookings at AI Hair Studio! 😊\n\n**Quick commands:**\n• 'book [service] [time]' - Make appointment\n• 'services' - See what we offer\n• 'hours' - Check when we're open\n• 'prices' - View our rates\n\nWhat can I help you with?";
}

function isGreeting(text) {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hii', 'helo'];
  return greetings.some(greeting => text.includes(greeting));
}

function isServiceInquiry(text) {
  const keywords = ['service', 'what do you', 'what can you', 'offer', 'available', 'menu'];
  return keywords.some(keyword => text.includes(keyword));
}

function isHoursInquiry(text) {
  const keywords = ['hours', 'open', 'close', 'time', 'when', 'schedule'];
  return keywords.some(keyword => text.includes(keyword)) && !text.includes('book');
}

function isBookingRequest(text) {
  const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve'];
  const serviceKeywords = ['haircut', 'hair cut', 'color', 'colour', 'styling', 'style'];
  
  return bookingKeywords.some(keyword => text.includes(keyword)) || 
         serviceKeywords.some(keyword => text.includes(keyword));
}

function isPriceInquiry(text) {
  const keywords = ['price', 'cost', 'how much', 'rate', 'fee', 'charge'];
  return keywords.some(keyword => text.includes(keyword));
}

function isHelpRequest(text) {
  const keywords = ['help', 'what can', 'commands', 'options', 'menu'];
  return keywords.some(keyword => text.includes(keyword));
}

function handleBookingRequest(text, timestamp) {
  try {
    // Extract service
    const service = extractService(text);
    const timeInfo = extractTime(text);
    
    console.log(`[${timestamp}] 🔍 Extracted - Service: ${service}, Time: ${timeInfo.slot}`);
    
    // If we have both service and time, create booking
    if (service && timeInfo.slot) {
      return createBooking(service, timeInfo, timestamp);
    }
    
    // If missing service
    if (!service) {
      return "Which service would you like to book?\n\n💇‍♂️ **Haircut** ($25, 30min)\n🎨 **Hair Color** ($50, 60min)\n✨ **Styling** ($35, 45min)\n\nJust say 'haircut', 'hair color', or 'styling'!";
    }
    
    // If missing time
    if (!timeInfo.slot) {
      return `Great choice on the ${service}! 👍\n\nWhat time works for you tomorrow (March 10th)?\n\n⏰ **Available slots:**\n• 9:00 AM\n• 10:00 AM\n• 11:00 AM\n• 2:00 PM\n• 3:00 PM\n• 4:00 PM\n• 5:00 PM\n\nJust say the time like '2pm' or '10am'!`;
    }
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Booking error:`, error);
    return "I'd love to help you book! Please tell me:\n1. Which service? (haircut, hair color, or styling)\n2. What time tomorrow?\n\nExample: 'book haircut 2pm'";
  }
}

function extractService(text) {
  if (text.includes('haircut') || text.includes('hair cut')) return 'haircut';
  if (text.includes('color') || text.includes('colour')) return 'hair color';
  if (text.includes('styling') || text.includes('style')) return 'styling';
  return null;
}

function extractTime(text) {
  // Common time patterns
  const timeMap = {
    '9am': '09:00', '9 am': '09:00', '9:00am': '09:00',
    '10am': '10:00', '10 am': '10:00', '10:00am': '10:00',
    '11am': '11:00', '11 am': '11:00', '11:00am': '11:00',
    '2pm': '14:00', '2 pm': '14:00', '2:00pm': '14:00',
    '3pm': '15:00', '3 pm': '15:00', '3:00pm': '15:00',
    '4pm': '16:00', '4 pm': '16:00', '4:00pm': '16:00',
    '5pm': '17:00', '5 pm': '17:00', '5:00pm': '17:00'
  };
  
  for (const [pattern, slot] of Object.entries(timeMap)) {
    if (text.includes(pattern)) {
      return { slot, date: new Date('2026-03-10') };
    }
  }
  
  // Fallback patterns
  if (text.includes('morning')) return { slot: '10:00', date: new Date('2026-03-10') };
  if (text.includes('afternoon')) return { slot: '14:00', date: new Date('2026-03-10') };
  if (text.includes('evening')) return { slot: '17:00', date: new Date('2026-03-10') };
  
  return { slot: null };
}

async function createBooking(service, timeInfo, timestamp) {
  try {
    console.log(`[${timestamp}] 🛠️ Creating booking: ${service} at ${timeInfo.slot}`);
    
    const newBooking = await Booking.create({
      businessId: "default_business_123",
      service: service,
      date: timeInfo.date,
      slot: timeInfo.slot,
      customer: { name: "Divyansh Thakur", phone: "918352986476" },
      status: "confirmed",
      source: "whatsapp"
    });
    
    console.log(`[${timestamp}] ✅ Booking created: ${newBooking._id}`);
    
    const dateStr = timeInfo.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const timeStr = formatTime(timeInfo.slot);
    
    return `🎉 **Booking Confirmed!**\n\n📋 **Details:**\n• Service: ${service}\n• Date: ${dateStr}\n• Time: ${timeStr}\n• Customer: Divyansh Thakur\n• Booking ID: ${newBooking._id.toString().slice(-6)}\n\n✅ You're all set! See you then! 😊\n\n📞 Need to reschedule? Just let me know!`;
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Database error:`, error);
    return `I'd love to book that ${service} for you! However, I'm having a small technical issue right now. \n\nPlease try again in a moment, or call us directly. Sorry for the inconvenience! 😅`;
  }
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
    // Ensure text is a string
    const messageText = String(text);
    console.log(`[${timestamp}] 📤 Sending: "${messageText.substring(0, 50)}..."`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: messageText }
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
    console.error(`[${timestamp}] ❌ Send failed:`, error.response?.data || error.message);
  }
}

const PORT = 8002;
app.listen(PORT, () => {
  console.log(`🚀 NO-AI webhook running on port ${PORT}`);
  console.log(`🚫 Zero AI usage - Pure rule-based responses`);
  console.log(`💰 No credits needed!`);
});