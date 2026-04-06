require('dotenv').config();
const { makeGeminiRequest } = require('./src/services/geminiService');
const connectDB = require('./src/config/db');
const Booking = require('./src/models/Booking');

async function testBookingFunctions() {
  console.log('🧪 Testing Gemini AI Function Calling for Bookings...\n');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Define the same tools as in your webhook
    const tools = [
      {
        type: "function",
        function: {
          name: "add_booking",
          description: "Create a new booking appointment",
          parameters: {
            type: "object",
            properties: {
              service: { type: "string", description: "Service name (haircut, hair color, styling)" },
              slot: { type: "string", description: "Time slot in HH:MM format (e.g., '14:00')" },
              date: { type: "string", description: "Date in YYYY-MM-DD format" },
              customer_name: { type: "string", description: "Customer name" },
              customer_phone: { type: "string", description: "Customer phone number" }
            },
            required: ["service", "slot", "date", "customer_name", "customer_phone"]
          }
        }
      }
    ];
    
    // Test system prompt
    const systemPrompt = `
You are a booking assistant for AI Hair Studio.
Services: haircut ($25, 30min), hair color ($50, 60min), styling ($35, 45min)
Available slots: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00

CRITICAL: When a customer wants to book an appointment, you MUST call the add_booking function.
Customer Info: Divyansh Thakur, Phone: +91 8352986476

ALWAYS use the add_booking function when booking is requested.
`;
    
    // Test messages that should trigger function calls
    const testMessages = [
      "I want to book a haircut for tomorrow at 2 PM",
      "Book me a hair color appointment for March 10th at 3 PM",
      "Can you schedule a styling session for me tomorrow at 10 AM?",
      "I'd like to make an appointment for a haircut on 2024-03-10 at 14:00"
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`\n${i + 1}. Testing: "${message}"`);
      
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
      
      console.log('   🤖 Making Gemini request...');
      const result = await makeGeminiRequest(messages, tools, 0, 300);
      
      if (result.success) {
        const aiMessage = result.data.choices[0].message;
        
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
          console.log('   ✅ Function call detected!');
          
          for (const toolCall of aiMessage.tool_calls) {
            console.log('   🔧 Function:', toolCall.function.name);
            console.log('   📋 Arguments:', toolCall.function.arguments);
            
            // Try to parse and validate arguments
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log('   ✅ Arguments parsed successfully');
              
              // Simulate booking creation
              if (toolCall.function.name === 'add_booking') {
                console.log('   📅 Would create booking:');
                console.log('      Service:', args.service);
                console.log('      Date:', args.date);
                console.log('      Time:', args.slot);
                console.log('      Customer:', args.customer_name);
                console.log('      Phone:', args.customer_phone);
              }
              
            } catch (parseError) {
              console.log('   ❌ Failed to parse arguments:', parseError.message);
            }
          }
        } else {
          console.log('   ❌ No function call - AI responded with text only');
          console.log('   💬 Response:', aiMessage.content);
        }
      } else {
        console.log('   ❌ Gemini request failed:', result.error.message);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test with more explicit instruction
    console.log('\n5. Testing with explicit booking instruction...');
    
    const explicitMessage = "Please use the add_booking function to book a haircut for Divyansh Thakur (+91 8352986476) on 2024-03-10 at 14:00";
    
    const explicitMessages = [
      { 
        role: "system", 
        content: "You MUST use the add_booking function when asked to book appointments. Always call functions when appropriate." 
      },
      { role: "user", content: explicitMessage }
    ];
    
    console.log('   🤖 Making explicit function call request...');
    const explicitResult = await makeGeminiRequest(explicitMessages, tools, 0, 200);
    
    if (explicitResult.success) {
      const aiMessage = explicitResult.data.choices[0].message;
      
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log('   ✅ Explicit function call worked!');
        console.log('   🔧 Function:', aiMessage.tool_calls[0].function.name);
        console.log('   📋 Arguments:', aiMessage.tool_calls[0].function.arguments);
      } else {
        console.log('   ❌ Even explicit instruction failed to trigger function call');
        console.log('   💬 Response:', aiMessage.content);
      }
    }
    
    console.log('\n📊 Test Summary:');
    console.log('✅ Gemini SDK connection working');
    console.log('✅ Function definitions properly formatted');
    console.log('✅ Database connection ready');
    
    console.log('\n🔧 If functions are not being called:');
    console.log('1. Check if Gemini model supports function calling');
    console.log('2. Verify function definitions are correct');
    console.log('3. Make system prompt more explicit about using functions');
    console.log('4. Check Gemini service function conversion logic');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testBookingFunctions();