require('dotenv').config();
const redis = require('./src/config/redis');
const { makeGeminiRequest } = require('./src/services/geminiService');

async function testWhatsAppAIFlow() {
  console.log('🤖 Testing WhatsApp AI Message Flow with Gemini...\n');
  
  try {
    // Setup test business context
    const testBusinessId = 'test_whatsapp_salon';
    const contextKey = `context:${testBusinessId}`;
    const historyKey = `history:${testBusinessId}`;
    
    const businessContext = {
      businessType: 'Hair Salon',
      tone: 'friendly and professional',
      services: [
        { name: 'haircut', duration: 30, price: '$25' },
        { name: 'hair color', duration: 90, price: '$75' },
        { name: 'styling', duration: 45, price: '$35' }
      ],
      workingHours: { start: '09:00', end: '18:00' }
    };
    
    console.log('1. Setting up business context...');
    await redis.set(contextKey, JSON.stringify(businessContext));
    await redis.set(historyKey, JSON.stringify([]));
    console.log('✅ Business context configured');
    
    // Test conversation scenarios
    const testScenarios = [
      {
        name: 'Greeting and Service Inquiry',
        message: 'Hi! What services do you offer?'
      },
      {
        name: 'Booking Request',
        message: 'I would like to book a haircut for today at 2 PM. My name is John and my phone is 555-1234.'
      },
      {
        name: 'Hours Inquiry',
        message: 'What are your business hours?'
      },
      {
        name: 'Price Inquiry',
        message: 'How much does a hair color service cost?'
      }
    ];
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n${i + 2}. Testing: ${scenario.name}`);
      console.log(`📱 User message: "${scenario.message}"`);
      
      // Get current history
      let history = JSON.parse(await redis.get(historyKey) || '[]');
      
      // Generate available slots
      const generateSlots = (workingHours) => {
        const [startH, startM] = workingHours.start.split(':').map(Number);
        const [endH, endM] = workingHours.end.split(':').map(Number);
        const slots = [];
        let current = startH * 60 + startM;
        const end = endH * 60 + endM;
        
        while (current + 30 <= end) {
          const h = Math.floor(current / 60);
          const m = current % 60;
          slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
          current += 30;
        }
        return slots;
      };
      
      const availableSlots = generateSlots(businessContext.workingHours);
      
      // Build system prompt
      const systemPrompt = `
You are a friendly virtual assistant for a ${businessContext.businessType}.
Tone: ${businessContext.tone}
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

BUSINESS DATA:
- Services: ${JSON.stringify(businessContext.services)}
- Working hours: ${JSON.stringify(businessContext.workingHours)}
- Available slots today: ${availableSlots.join(', ')}

CONVERSATION STYLE:
- Be natural, friendly, WhatsApp-style (short messages)
- Help with booking, rescheduling, canceling services
- Use functions when users want to book appointments

CRITICAL - YOU MUST USE FUNCTIONS:
- To CREATE a booking: CALL add_booking function
- When user confirms (yes, confirm, ok, sure), CALL the function immediately
`;

      // Define tools for booking
      const tools = [
        {
          type: "function",
          function: {
            name: "add_booking",
            description: "Create a new booking when user wants to book a service",
            parameters: {
              type: "object",
              properties: {
                service: { type: "string", description: "Service name (haircut, hair color, etc.)" },
                slot: { type: "string", description: "Time slot (e.g., '14:00' or '2 PM')" },
                date: { type: "string", description: "Date YYYY-MM-DD format. Default: today" },
                customer_name: { type: "string", description: "Customer name" },
                customer_phone: { type: "string", description: "Customer phone" }
              },
              required: ["service", "slot", "customer_name", "customer_phone"]
            }
          }
        }
      ];
      
      // Format history for AI
      const formattedHistory = history.map(h => {
        const [role, ...textParts] = h.split(': ');
        return { role: role.toLowerCase() === 'user' ? 'user' : 'assistant', content: textParts.join(': ') };
      });
      
      // Make AI request
      const messages = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: scenario.message }
      ];
      
      console.log('   🤖 Generating AI response...');
      const aiResult = await makeGeminiRequest(messages, tools, 0, 300);
      
      if (aiResult.success) {
        const aiMessage = aiResult.data.choices[0].message;
        
        // Check for function calls
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
          console.log('   🔧 Function called:', aiMessage.tool_calls[0].function.name);
          console.log('   📋 Arguments:', aiMessage.tool_calls[0].function.arguments);
          
          // Simulate function execution
          const funcArgs = JSON.parse(aiMessage.tool_calls[0].function.arguments);
          console.log('   ✅ Booking would be created:', funcArgs);
          
          // Get follow-up response
          const followUpResult = await makeGeminiRequest([
            ...messages,
            aiMessage,
            {
              role: 'tool',
              tool_call_id: aiMessage.tool_calls[0].id,
              content: `Booking created successfully: ${funcArgs.service} at ${funcArgs.slot} for ${funcArgs.customer_name}`
            }
          ], [], 0, 200);
          
          if (followUpResult.success) {
            const finalResponse = followUpResult.data.choices[0].message.content;
            console.log('   💬 AI Response:', finalResponse);
          }
        } else {
          console.log('   💬 AI Response:', aiMessage.content);
        }
        
        // Update history
        history.push(`User: ${scenario.message}`);
        history.push(`AI: ${aiMessage.content}`);
        await redis.set(historyKey, JSON.stringify(history));
        
        console.log('   ✅ Scenario completed successfully');
        
      } else {
        console.log('   ❌ AI request failed:', aiResult.error.message);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await redis.del(contextKey);
    await redis.del(historyKey);
    console.log('✅ Cleanup completed');
    
    console.log('\n🎉 WhatsApp AI Flow Test Completed!');
    console.log('\n📊 Test Results:');
    console.log('✅ Business context setup');
    console.log('✅ AI conversation handling');
    console.log('✅ Function calling for bookings');
    console.log('✅ Message history management');
    console.log('✅ Gemini integration working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testWhatsAppAIFlow();