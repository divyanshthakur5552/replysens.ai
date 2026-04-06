# Setup ngrok for WhatsApp Webhook Testing

## What is ngrok?
ngrok creates a secure tunnel from the internet to your localhost, giving you a public URL that WhatsApp can send webhooks to.

## Quick Setup:

### 1. Install ngrok
- Go to: https://ngrok.com/
- Sign up for free account
- Download ngrok for Windows
- Extract to a folder (e.g., C:\ngrok\)

### 2. Setup ngrok
```bash
# Open new terminal/command prompt
cd C:\ngrok\
ngrok.exe authtoken YOUR_AUTH_TOKEN_FROM_NGROK_DASHBOARD
```

### 3. Start ngrok tunnel
```bash
ngrok http 8000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### 4. Update WhatsApp Webhook URL
- Go to Meta Business Manager
- Find your WhatsApp app settings
- Update webhook URL to: `https://abc123.ngrok.io/webhook`
- Verify token: `divyansh_saas_2026`

### 5. Test the webhook
Your AI will now receive messages from WhatsApp!

## Alternative: Use a Cloud Server
- Deploy to Heroku, Railway, or DigitalOcean
- Get a permanent public URL
- More stable for production use