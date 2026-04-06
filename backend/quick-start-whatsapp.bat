@echo off
echo 🚀 Starting WhatsApp + Gemini AI Integration...
echo.

echo 📋 Step 1: Running setup script...
node setup-whatsapp-gemini.js
if %errorlevel% neq 0 (
    echo ❌ Setup failed! Check your configuration.
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Starting the integration server...
echo 💡 The server will start on port 8000
echo 💡 Open another terminal and run: ngrok http 8000
echo 💡 Then update your WhatsApp webhook URL with the ngrok URL
echo.
echo 🔗 Webhook URL format: https://your-ngrok-url.ngrok.io/webhook
echo 🔑 Verify Token: divyansh_saas_2026
echo.
echo Press any key to start the server...
pause > nul

node whatsapp-gemini-integration.js