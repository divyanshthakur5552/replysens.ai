# WhatsApp + Gemini AI Integration Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- ✅ WhatsApp Business Account
- ✅ Meta Developer Account
- ✅ Gemini API Key (already configured)
- ✅ ngrok account (for local testing)

### Step 1: Run Setup Script
```bash
cd backend
node setup-whatsapp-gemini.js
```

### Step 2: Start the Integration Server
```bash
# Option A: Use the standalone integration server (recommended for testing)
node whatsapp-gemini-integration.js

# Option B: Use the main server
node index.js
```

### Step 3: Setup ngrok Tunnel
1. **Install ngrok** (if not already installed):
   - Go to https://ngrok.com/
   - Sign up and download ngrok
   - Extract to a folder (e.g., C:\ngrok\)

2. **Configure ngrok**:
   ```bash
   cd C:\ngrok\
   ngrok.exe authtoken 3AhuA2FEzT7SFNEPH5BwrPOC05o_4rk9Zh1YjKJX2HowoM8r2
   ```

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 8000
   ```
   
   You'll get a URL like: `https://abc123.ngrok.io`

### Step 4: Configure WhatsApp Webhook

1. **Go to Meta Business Manager**:
   - Visit: https://business.facebook.com/
   - Navigate to your WhatsApp Business app

2. **Update Webhook Settings**:
   - **Webhook URL**: `https://your-ngrok-url.ngrok.io/webhook`
   - **Verify Token**: `divyansh_saas_2026`
   - **Webhook Fields**: Select "messages"

3. **Test Webhook**:
   - Click "Verify and Save"
   - Should show "Webhook verified successfully"

### Step 5: Test the Integration

1. **Send a test message** to your WhatsApp Business number
2. **Check server logs** for processing details
3. **Verify AI response** is sent back to WhatsApp

## 🧪 Testing Commands

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Test Message Processing (Local)
```bash
curl -X POST http://localhost:8000/test-message \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "message": "Hello AI!"}'
```

### Monitor Real Messages
```bash
# In a separate terminal, monitor logs
tail -f webhook-debug.log
```

## 🔧 Configuration Details

### Current Settings:
- **WhatsApp Phone Number ID**: `1027091170488458`
- **Verify Token**: `divyansh_saas_2026`
- **AI Model**: `gemini-2.5-flash`
- **Business Type**: AI Assistant Service (24/7 availability)

### Environment Variables Required:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyDhgWPGpUxSfI2f77WKg3-9HJWZz-9RvtU
WHATSAPP_ACCESS_TOKEN=EAAYBa8j9ogkBQ8uA3LPjwOnEsLJRPxpo3EKZBp04ElOi7rtLWGAubyfxKFKM5lSu1RNZC2ONf57cYnZBjc1NfqKpjj7I9mDK7XeYrGWeZA8HeArr5XbEZCn2ocsG1kNiBnzcq96TpG4fB01ottaCNxBra2d9ZCKirf6NKI8fFUneWJ477Kli7TmoPfRqEhbgsT0jDomvRgjT2k6LiNTPIk8ZCxTxx9NVONhxMHb
WHATSAPP_PHONE_NUMBER_ID=1027091170488458
WHATSAPP_VERIFY_TOKEN=divyansh_saas_2026
```

## 🎯 What You Can Do

Once setup is complete, you can:

1. **Send any message** to your WhatsApp Business number
2. **Get AI responses** powered by Gemini 2.5 Flash
3. **Have conversations** - the AI remembers context
4. **Ask questions** on any topic
5. **Get help** with various tasks

## 🔍 Troubleshooting

### Common Issues:

1. **Webhook verification fails**:
   - Check ngrok is running
   - Verify the webhook URL is correct
   - Ensure verify token matches

2. **No AI responses**:
   - Check server logs for errors
   - Verify Gemini API key is working
   - Test with health check endpoint

3. **Messages not received**:
   - Check WhatsApp webhook configuration
   - Verify phone number ID is correct
   - Check access token is valid

### Debug Commands:
```bash
# Check webhook configuration
node check-webhook-config.js

# Test Gemini integration
node test-gemini-integration.js

# Monitor real-time messages
node monitor-real-messages.js
```

## 🚀 Production Deployment

For production use:
1. Deploy to a cloud service (Heroku, Railway, DigitalOcean)
2. Get a permanent public URL
3. Update WhatsApp webhook to production URL
4. Set up proper monitoring and logging

## 📱 Example Conversation

**You**: "Hello!"
**AI**: "Hi there! I'm your AI assistant. How can I help you today?"

**You**: "What can you do?"
**AI**: "I can help with questions, provide information, solve problems, and have friendly conversations. What would you like to know?"

**You**: "Tell me a joke"
**AI**: "Why don't scientists trust atoms? Because they make up everything! 😄"

## ✅ Success Indicators

- ✅ Server starts without errors
- ✅ ngrok tunnel is active
- ✅ Webhook verification succeeds
- ✅ Test messages receive AI responses
- ✅ Conversation history is maintained
- ✅ Health check returns OK status

Your WhatsApp + Gemini AI integration is now ready to use! 🎉