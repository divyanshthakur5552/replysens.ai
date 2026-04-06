require('dotenv').config();
const redis = require('./src/config/redis');
const { validateAPIKey, validateEnvironment } = require('./ai-config');

async function setupWhatsAppGemini() {
  console.log('🚀 Setting up WhatsApp + Gemini AI Integration...\n');
  
  try {
    // 1. Validate environment
    console.log('1. Validating environment variables...');
    validateEnvironment();
    
    const requiredWhatsAppVars = ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_VERIFY_TOKEN'];
    const missingWhatsApp = requiredWhatsAppVars.filter(varName => !process.env[varName]);
    
    if (missingWhatsApp.length > 0) {
      throw new Error(`Missing WhatsApp variables: ${missingWhatsApp.join(', ')}`);
    }
    
    console.log('✅ All environment variables are set');
    
    // 2. Validate Gemini API
    console.log('\n2. Validating Gemini API...');
    const apiKey = validateAPIKey();
    console.log(`✅ Gemini API key validated: ${apiKey.substring(0, 10)}...`);
    
    // 3. Test Redis connection
    console.log('\n3. Testing Redis connection...');
    await redis.set('test_key', 'test_value');
    const testValue = await redis.get('test_key');
    if (testValue === 'test_value') {
      console.log('✅ Redis connection working');
      await redis.del('test_key');
    } else {
      throw new Error('Redis connection failed');
    }
    
    // 4. Setup default business context
    console.log('\n4. Setting up default business context...');
    const defaultBusinessId = 'whatsapp_business_default';
    const contextKey = `context:${defaultBusinessId}`;
    
    const defaultContext = {
      businessType: 'AI Assistant Service',
      tone: 'friendly and helpful',
      services: [
        { name: 'consultation', duration: 30, price: 'Free' },
        { name: 'ai assistance', duration: 15, price: 'Free' },
        { name: 'information', duration: 5, price: 'Free' }
      ],
      workingHours: { start: '00:00', end: '23:59' }, // 24/7 availability
      description: 'AI-powered assistant ready to help with questions and tasks'
    };
    
    await redis.set(contextKey, JSON.stringify(defaultContext));
    console.log('✅ Default business context configured');
    
    // 5. Display current configuration
    console.log('\n5. Current Configuration:');
    console.log('📱 WhatsApp Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID);
    console.log('🔑 Verify Token:', process.env.WHATSAPP_VERIFY_TOKEN);
    console.log('🤖 AI Model: gemini-2.5-flash');
    console.log('💾 Redis: Connected');
    console.log('🏢 Business Context: Configured');
    
    console.log('\n🎉 Setup completed successfully!');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: node index.js');
    console.log('2. Start ngrok: ngrok http 8000');
    console.log('3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)');
    console.log('4. Update your WhatsApp webhook URL to: [ngrok-url]/webhook');
    console.log('5. Send a message to your WhatsApp Business number to test!');
    
    console.log('\n🔧 Webhook Configuration:');
    console.log('- Webhook URL: [your-ngrok-url]/webhook');
    console.log('- Verify Token: divyansh_saas_2026');
    console.log('- Webhook Fields: messages');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupWhatsAppGemini();