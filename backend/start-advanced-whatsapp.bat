@echo off
echo 🚀 Starting Advanced WhatsApp + Gemini AI Integration...
echo.

echo 📋 Checking environment...
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please make sure your .env file exists with all required variables.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

echo 📋 Starting the advanced webhook server...
echo 💡 This will start on port 8002 (different from main server)
echo 💡 Your phone number: +91 8352986476
echo 💡 AI Model: Gemini 2.5 Flash
echo.

echo 🔗 After server starts:
echo 1. Start ngrok: ngrok http 8002
echo 2. Update WhatsApp webhook URL to: https://your-ngrok-url.ngrok.io/webhook
echo 3. Send a message from your phone to test!
echo.

echo Press any key to start the server...
pause > nul

node advanced-whatsapp-webhook.js