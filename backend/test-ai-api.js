const axios = require('axios');
require('dotenv').config();

async function testAIAPI() {
  console.log('🔍 Testing AI API connection...');
  
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: "Hello, this is a test message" }
        ],
        max_tokens: 100
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "HTTP-Referer": "http://localhost",
          "X-Title": "ReplySense AI"
        }
      }
    );
    
    console.log('✅ AI API is working!');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ AI API failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 402) {
      console.log('💡 This is a payment/credits issue. Check your OpenRouter account.');
    }
  }
}

testAIAPI();