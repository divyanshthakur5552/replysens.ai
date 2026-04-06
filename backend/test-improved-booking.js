require('dotenv').config();
const { makeGeminiRequest } = require('./src/services/geminiService');

async function testImprovedBooking() {
  console.log('🧪 Testing Improved Booking Function Calls...\n');
  
  try {
    // Improved system prompt
    const systemPrompt = `
You are a booking assistant for AI Hair Studio.
Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Tomorrow's date: ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

Services: haircut ($25, 30min), hair color ($50, 60min), styling ($35, 45min)
Customer: Divyansh Thakur, Phone: +91 8352986476

CRITICAL RULES:
1. ALWAYS call add_booking function when customer wants to book ANY service
2. "tomorrow" = date: "2024-03-10"
3. Convert times: "2 PM" = "14:00", "10 AM" = "10:00"
4. NEVER just respond with text - ALWAYS use the function

EXAMPLES:
- "book haircut tomorrow 2 PM" → CALL add_booking(service="haircut", date="2024-03-10", slot="14:00")
- "I want styling tomorrow 10 AM" → CALL add_booking(service="styling", date="2024-03-10", slot="10:00")
`;

    // Improved function definition
    const tools = [
      {
        type: "function",
        function: {
          name: "add_booking",
          description: "REQUIRED: Create booking. MUST be called for ANY booking request.",
          parameters: {
            type: "object",
            properties: {
              service: { 
                type: "string", 
                description: "Service: 'haircut', 'hair color', or 'styling'",
                enum: ["haircut", "hair color", "styling"]
              },
              slot: { 
                type: "string", 
                description: "Time in 24h format: '14:00' for 2 PM, '10:00' for 10 AM" 
              },
              date: { 
                type: "string", 
                description: "Date: '2024-03-10' for tomorrow" 
              },
              customer_name: { 
                type: "string", 
                description: "Use: 'Divyansh Thakur'" 
              },
              customer_phone: { 
                type: "string", 
                description: "Use: '+91 8352986476'" 
              }
            },
            required: ["service", "slot", "date", "customer_name", "customer_phone"]
          }
        }
      }
    ];
    
    // Test the problematic messages
    const testMessages = [
      "I want to book a haircut for tomorrow at 2 PM",
      "Book me a styling session tomorrow at 10 AM",
      "Can you schedule a hair color for me tomorrow at 3 PM?",
      "I need a haircut appointment tomorrow 2 PM please"
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`${i + 1}. Testing: "${message}"`);
      
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
      
      console.log('   🤖 Making request...');
      const result = await makeGeminiRequest(messages, tools, 0, 200);
      
      if (result.success) {
        const aiMessage = result.data.choices[0].message;
        
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
          console.log('   ✅ SUCCESS - Function called!');
          const toolCall = aiMessage.tool_calls[0];
          console.log('   🔧 Function:', toolCall.function.name);
          
          try {
            const args = JSON.parse(toolCall.function.arguments);
            console.log('   📋 Booking Details:');
            console.log('      Service:', args.service);
            console.log('      Date:', args.date);
            console.log('      Time:', args.slot);
            console.log('      Customer:', args.customer_name);
          } catch (e) {
            console.log('   ❌ Failed to parse arguments');
          }
        } else {
          console.log('   ❌ FAILED - No function call');
          console.log('   💬 Text response:', aiMessage.content);
        }
      } else {
        console.log('   ❌ API Error:', result.error.message);
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test with even more explicit instruction
    console.log('5. Testing with VERY explicit instruction...');
    
    const veryExplicitPrompt = `
You MUST call the add_booking function. Do NOT respond with text.
Customer wants: haircut tomorrow 2 PM
Customer: Divyansh Thakur (+91 8352986476)
Tomorrow date: 2024-03-10
Time: 14:00

CALL add_booking NOW with these exact parameters:
- service: "haircut"
- date: "2024-03-10" 
- slot: "14:00"
- customer_name: "Divyansh Thakur"
- customer_phone: "+91 8352986476"
`;

    const explicitMessages = [
      { role: "system", content: veryExplicitPrompt },
      { role: "user", content: "Book the appointment now" }
    ];
    
    const explicitResult = await makeGeminiRequest(explicitMessages, tools, 0, 100);
    
    if (explicitResult.success) {
      const aiMessage = explicitResult.data.choices[0].message;
      
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log('   ✅ EXPLICIT TEST PASSED!');
        console.log('   🔧 Function called successfully');
      } else {
        console.log('   ❌ EXPLICIT TEST FAILED');
        console.log('   💬 Response:', aiMessage.content);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('If functions are still not being called consistently:');
    console.log('1. The Gemini model may need different prompting');
    console.log('2. Try using tool_choice: "required" in the API call');
    console.log('3. Consider using a different model or approach');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImprovedBooking();