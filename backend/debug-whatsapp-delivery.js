const axios = require("axios");
require("dotenv").config();

async function debugWhatsAppDelivery() {
  console.log("🔍 WhatsApp Message Delivery Debug\n");
  
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  console.log("📋 Configuration Check:");
  console.log(`Phone Number ID: ${phoneNumberId}`);
  console.log(`Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'MISSING'}`);
  
  // Check phone number status
  console.log("\n1. Checking Phone Number Status");
  try {
    const phoneResponse = await axios.get(
      `https://graph.facebook.com/v22.0/${phoneNumberId}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }
    );
    
    console.log("✅ Phone Number Info:", JSON.stringify(phoneResponse.data, null, 2));
    
  } catch (error) {
    console.log("❌ Phone Number Check Failed:", error.response?.data);
  }
  
  // Check business verification status
  console.log("\n2. Checking Business Verification");
  try {
    const businessResponse = await axios.get(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?fields=account_mode,status,quality_rating`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }
    );
    
    console.log("✅ Business Status:", JSON.stringify(businessResponse.data, null, 2));
    
  } catch (error) {
    console.log("❌ Business Check Failed:", error.response?.data);
  }
  
  // Test with template message (more likely to be delivered)
  console.log("\n3. Testing Template Message");
  try {
    const templateResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: "918352986476",
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("✅ Template Message Sent:", JSON.stringify(templateResponse.data, null, 2));
    
  } catch (error) {
    console.log("❌ Template Message Failed:", error.response?.data);
  }
  
  // Check message delivery status
  console.log("\n4. Common Issues & Solutions:");
  console.log("📱 Recipient Issues:");
  console.log("   - Phone number must have WhatsApp installed");
  console.log("   - Number must be active and reachable");
  console.log("   - Check if +91 8352986476 is correct");
  
  console.log("\n🏢 Business Account Issues:");
  console.log("   - Business must be verified");
  console.log("   - Phone number must be approved");
  console.log("   - Account might be in restricted mode");
  
  console.log("\n🔐 API Issues:");
  console.log("   - Access token might be expired");
  console.log("   - Rate limits might be exceeded");
  console.log("   - Recipient not in allowed list (development mode)");
  
  console.log("\n💡 Recommended Actions:");
  console.log("1. Check Meta Business Manager for account status");
  console.log("2. Verify the phone number +91 8352986476 has WhatsApp");
  console.log("3. Try sending to a different number first");
  console.log("4. Check if account is in development vs production mode");
}

// Test different number formats
async function testNumberFormats() {
  console.log("\n🔢 Testing Different Number Formats for 8352986476\n");
  
  const formats = [
    "918352986476",      // Current format
    "+918352986476",     // With plus
    "91 8352986476",     // With space
    "8352986476",        // Without country code
    "0918352986476"      // With leading zero
  ];
  
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  for (const format of formats) {
    console.log(`Testing format: ${format}`);
    
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: format,
          type: "text",
          text: { body: `Test message to ${format} - ${new Date().toLocaleTimeString()}` }
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log(`✅ ${format}: Success - ${response.data.messages[0].id}`);
      
    } catch (error) {
      console.log(`❌ ${format}: Failed - ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function runDebug() {
  await debugWhatsAppDelivery();
  await testNumberFormats();
  
  console.log("\n✨ Debug completed!");
}

if (require.main === module) {
  runDebug().catch(console.error);
}