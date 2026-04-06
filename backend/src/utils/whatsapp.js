const axios = require("axios");

/**
 * Send WhatsApp message using Meta Cloud API
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 * @returns {Promise<Object>} API response
 */
async function sendWhatsAppMessage(to, text) {
  try {
    console.log(`[WhatsApp] Sending message to ${to}: ${text.substring(0, 50)}...`);
    
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
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`[WhatsApp] Message sent successfully to ${to}`);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error(`[WhatsApp] Failed to send message to ${to}:`, {
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
      code: error.code
    });
    
    return { 
      success: false, 
      error: {
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message,
        code: error.code
      }
    };
  }
}

/**
 * Parse incoming WhatsApp webhook payload
 * @param {Object} body - Webhook payload
 * @returns {Object|null} Parsed message data or null if not a text message
 */
function parseWhatsAppMessage(body) {
  try {
    // Log the full payload for debugging
    console.log("[WhatsApp] Webhook payload:", JSON.stringify(body, null, 2));
    
    // Check if it's a WhatsApp message
    if (!body.entry || !Array.isArray(body.entry)) {
      console.log("[WhatsApp] Invalid webhook format - no entry array");
      return null;
    }
    
    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;
      
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        
        const value = change.value;
        if (!value.messages || !Array.isArray(value.messages)) continue;
        
        for (const message of value.messages) {
          // Only process text messages for now
          if (message.type === "text" && message.text && message.text.body) {
            const from = message.from;
            const text = message.text.body;
            const messageId = message.id;
            
            console.log(`[WhatsApp] Parsed message from ${from}: ${text}`);
            
            return {
              from,
              text,
              messageId,
              timestamp: message.timestamp
            };
          }
        }
      }
    }
    
    console.log("[WhatsApp] No text messages found in payload");
    return null;
    
  } catch (error) {
    console.error("[WhatsApp] Error parsing message:", error);
    return null;
  }
}

/**
 * Verify WhatsApp webhook
 * @param {string} mode - Hub mode
 * @param {string} token - Verify token
 * @param {string} challenge - Hub challenge
 * @returns {string|null} Challenge if valid, null otherwise
 */
function verifyWebhook(mode, token, challenge) {
  console.log(`[WhatsApp] Webhook verification - mode: ${mode}, token: ${token}`);
  
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully");
    return challenge;
  }
  
  console.log("[WhatsApp] Webhook verification failed");
  return null;
}

module.exports = {
  sendWhatsAppMessage,
  parseWhatsAppMessage,
  verifyWebhook
};