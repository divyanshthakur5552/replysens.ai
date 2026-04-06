require('dotenv').config();
const { makeGeminiRequest, getGeminiHealth } = require('./src/services/geminiService');
const { validateAPIKey, validateEnvironment } = require('./ai-config');

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini SDK Integration...\n');
  
  try {
    // Validate environment
    console.log('1. Validating environment variables...');
    validateEnvironment();
    
    // Validate API key
    console.log('2. Validating Gemini API key...');
    const apiKey = validateAPIKey();
    console.log(`✅ API key format looks correct: ${apiKey.substring(0, 10)}...`);
    
    // Check health status
    console.log('\n3. Checking AI service health...');
    const health = getGeminiHealth();
    console.log('Health status:', JSON.stringify(health, null, 2));
    
    // Test simple message
    console.log('\n4. Testing simple AI request...');
    const messages = [
      { role: 'system', content: 'You are a helpful assistant. Respond briefly.' },
      { role: 'user', content: 'Hello! Can you confirm you are working?' }
    ];
    
    const result = await makeGeminiRequest(messages, [], 0, 100);
    
    if (result.success) {
      console.log('✅ Simple request successful!');
      console.log('Response:', result.data.choices[0].message.content);
    } else {
      console.log('❌ Simple request failed:', result.error);
      return;
    }
    
    // Test function calling
    console.log('\n5. Testing function calling...');
    const tools = [{
      type: "function",
      function: {
        name: "get_weather",
        description: "Get weather information",
        parameters: {
          type: "object",
          properties: {
            location: { type: "string", description: "City name" }
          },
          required: ["location"]
        }
      }
    }];
    
    const functionMessages = [
      { role: 'system', content: 'You are a helpful assistant. Use functions when appropriate.' },
      { role: 'user', content: 'What is the weather like in New York?' }
    ];
    
    const functionResult = await makeGeminiRequest(functionMessages, tools, 0, 150);
    
    if (functionResult.success) {
      const message = functionResult.data.choices[0].message;
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('✅ Function calling works!');
        console.log('Function called:', message.tool_calls[0].function.name);
        console.log('Arguments:', message.tool_calls[0].function.arguments);
      } else {
        console.log('⚠️  Function calling test - no function called, but request succeeded');
        console.log('Response:', message.content);
      }
    } else {
      console.log('❌ Function calling test failed:', functionResult.error);
    }
    
    console.log('\n🎉 Gemini integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testGeminiIntegration();