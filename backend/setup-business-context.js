const redis = require("./src/config/redis");
require("dotenv").config();

async function setupBusinessContext() {
  console.log("🏢 Setting up Business Context for AI\n");
  
  // Default business context for testing
  const businessContext = {
    businessType: "Hair Salon",
    businessName: "AI Hair Studio",
    tone: "friendly and professional",
    workingHours: {
      start: "09:00",
      end: "18:00"
    },
    services: [
      {
        name: "haircut",
        duration: 30,
        price: "$25"
      },
      {
        name: "hair color",
        duration: 60,
        price: "$50"
      },
      {
        name: "styling",
        duration: 45,
        price: "$35"
      }
    ]
  };
  
  // Use a default business ID for testing
  const businessId = "default_business_123";
  const contextKey = `context:${businessId}`;
  
  try {
    await redis.set(contextKey, JSON.stringify(businessContext));
    console.log("✅ Business context saved successfully!");
    console.log("📋 Context details:");
    console.log(`   Business: ${businessContext.businessName}`);
    console.log(`   Type: ${businessContext.businessType}`);
    console.log(`   Hours: ${businessContext.workingHours.start} - ${businessContext.workingHours.end}`);
    console.log(`   Services: ${businessContext.services.map(s => s.name).join(", ")}`);
    
    console.log("\n🤖 Your AI now has business context!");
    console.log("📱 Try sending a message to test the AI response");
    
  } catch (error) {
    console.log("❌ Failed to save context:", error.message);
  }
}

// Also update the WhatsApp controller to use default business ID
async function updateBusinessMapping() {
  console.log("\n🔧 Setting up phone number mapping...");
  
  // This maps your phone number to the business context
  const phoneBusinessMapping = {
    "918352986476": "default_business_123"
  };
  
  try {
    await redis.set("phone_business_mapping", JSON.stringify(phoneBusinessMapping));
    console.log("✅ Phone number mapping saved!");
    console.log("📞 +91 8352986476 → default_business_123");
    
  } catch (error) {
    console.log("❌ Failed to save mapping:", error.message);
  }
}

async function runSetup() {
  console.log("🚀 Business Context Setup\n");
  
  await setupBusinessContext();
  await updateBusinessMapping();
  
  console.log("\n✨ Setup complete!");
  console.log("\n📱 Now test your AI:");
  console.log("1. Send 'Hello' to your WhatsApp");
  console.log("2. Try 'I want to book a haircut'");
  console.log("3. Ask 'What are your hours?'");
}

if (require.main === module) {
  runSetup().catch(console.error);
}