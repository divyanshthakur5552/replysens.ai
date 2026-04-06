const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AI_CONFIG, apiHealth, requestTracker } = require('../../ai-config');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Function calling schema converter
function convertToolsToGeminiFormat(tools) {
  if (!tools || tools.length === 0) return [];
  
  // Gemini expects a single tools array with functionDeclarations
  const functionDeclarations = tools.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters
  }));
  
  return [{
    functionDeclarations: functionDeclarations
  }];
}

// Convert messages to Gemini format
function convertMessagesToGeminiFormat(messages) {
  const geminiMessages = [];
  let systemInstruction = '';
  
  for (const message of messages) {
    if (message.role === 'system') {
      systemInstruction = message.content;
    } else if (message.role === 'user') {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: message.content }]
      });
    } else if (message.role === 'assistant') {
      geminiMessages.push({
        role: 'model',
        parts: [{ text: message.content }]
      });
    } else if (message.role === 'tool') {
      // Handle tool responses - add to previous model message
      if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === 'model') {
        geminiMessages[geminiMessages.length - 1].parts.push({
          functionResponse: {
            name: message.tool_call_id,
            response: { result: message.content }
          }
        });
      }
    }
  }
  
  return { systemInstruction, messages: geminiMessages };
}

// Main AI request function
async function makeGeminiRequest(messages, tools = [], retryCount = 0, maxTokens = 500) {
  // Check rate limiting
  if (!requestTracker.canMakeRequest()) {
    const waitTime = requestTracker.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }
  
  try {
    // Record the request
    requestTracker.recordRequest();
    
    // Convert messages and tools to Gemini format
    const { systemInstruction, messages: geminiMessages } = convertMessagesToGeminiFormat(messages);
    const geminiTools = convertToolsToGeminiFormat(tools);
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: AI_CONFIG.model,
      systemInstruction: systemInstruction || undefined,
      tools: geminiTools.length > 0 ? geminiTools : undefined,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      }
    });
    
    // Start chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1) // All messages except the last one
    });
    
    // Send the last message
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    
    const response = await result.response;
    const text = response.text();
    
    // Handle function calls
    const functionCalls = response.functionCalls();
    
    // Record success
    apiHealth.recordSuccess();
    
    // Format response similar to OpenAI format for compatibility
    const formattedResponse = {
      choices: [{
        message: {
          content: text,
          role: 'assistant',
          tool_calls: functionCalls ? functionCalls.map((call, index) => ({
            id: `call_${Date.now()}_${index}`,
            type: 'function',
            function: {
              name: call.name,
              arguments: JSON.stringify(call.args)
            }
          })) : undefined
        }
      }]
    };
    
    return { success: true, data: formattedResponse };
    
  } catch (error) {
    console.log(`Gemini API attempt ${retryCount + 1} failed:`, {
      message: error.message,
      code: error.code
    });
    
    // Record failure
    apiHealth.recordFailure(error);
    
    // Check if we should retry
    const shouldRetry = retryCount < AI_CONFIG.maxRetries && (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('rate limit') ||
      error.message.includes('quota') ||
      error.message.includes('timeout')
    );
    
    if (shouldRetry) {
      const delay = AI_CONFIG.baseDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying Gemini request in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeGeminiRequest(messages, tools, retryCount + 1, maxTokens);
    }
    
    // Return error details for fallback handling
    return { 
      success: false, 
      error: {
        message: error.message,
        code: error.code
      }
    };
  }
}

// Health check function
function getGeminiHealth() {
  return {
    provider: 'google-gemini',
    model: AI_CONFIG.model,
    ...apiHealth.getHealthStats(),
    isHealthy: apiHealth.isHealthy(),
    rateLimitStatus: {
      canMakeRequest: requestTracker.canMakeRequest(),
      requestsInWindow: requestTracker.requests.length,
      maxRequestsPerMinute: AI_CONFIG.requestsPerMinute
    }
  };
}

module.exports = {
  makeGeminiRequest,
  getGeminiHealth
};