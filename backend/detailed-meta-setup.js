console.log("📋 DETAILED META CONSOLE SETUP GUIDE");
console.log("=" .repeat(50));

console.log("\n🎯 STEP-BY-STEP: Add Phone Numbers to Allowed List");
console.log("\n1. 🌐 Open Meta Developer Console:");
console.log("   https://developers.facebook.com/");

console.log("\n2. 📱 Navigate to Your App:");
console.log("   • Click 'My Apps' in top menu");
console.log("   • Select your WhatsApp app");

console.log("\n3. 🔧 Go to WhatsApp Settings:");
console.log("   • Left sidebar: Click 'WhatsApp'");
console.log("   • Click 'API Setup' (or 'Getting Started')");

console.log("\n4. 📞 Find the Phone Number Section:");
console.log("   Look for 'Send and receive messages' section");
console.log("   You should see:");
console.log("   • A 'From' field (your business number)");
console.log("   • A 'To' field (recipient numbers)");
console.log("   • A message text box");

console.log("\n5. ➕ Add Your Numbers:");
console.log("   In the 'To' field, try these formats:");
console.log("   ");
console.log("   For 8352986476:");
console.log("   • +1 835 298 6476");
console.log("   • 18352986476");
console.log("   • +18352986476");
console.log("   ");
console.log("   For Meta test number:");
console.log("   • +1 555 192 2233");
console.log("   • 15551922233");

console.log("\n6. 📤 Send Test Message:");
console.log("   • Type a test message");
console.log("   • Click 'Send message' button");
console.log("   • If successful, the number is added!");

console.log("\n7. ✅ Verify Addition:");
console.log("   • The number should appear in a dropdown");
console.log("   • You might see 'Verified' status");

console.log("\n" + "=" .repeat(50));
console.log("🔍 ALTERNATIVE LOCATIONS TO CHECK:");
console.log("=" .repeat(50));

console.log("\n📍 Location 1: API Setup Page");
console.log("   WhatsApp → API Setup → 'To' field");

console.log("\n📍 Location 2: Phone Numbers Tab");
console.log("   WhatsApp → Phone Numbers → Manage");

console.log("\n📍 Location 3: Webhooks Section");
console.log("   WhatsApp → Configuration → Webhooks");

console.log("\n" + "=" .repeat(50));
console.log("🚨 TROUBLESHOOTING:");
console.log("=" .repeat(50));

console.log("\n❌ If numbers still don't work:");
console.log("   1. Try different number formats");
console.log("   2. Wait 5-10 minutes for Meta's system to update");
console.log("   3. Check if your app is in 'Development' mode");
console.log("   4. Verify your access token hasn't expired");

console.log("\n🔄 Alternative Method - Message First:");
console.log("   1. Have 8352986476 send ANY message to your business WhatsApp");
console.log("   2. This automatically allows replies for 24 hours");
console.log("   3. No need to add to allowed list!");

console.log("\n📞 Your Business WhatsApp Number:");
console.log("   Check Meta Console for your business phone number");
console.log("   It should be displayed in the 'From' field");

console.log("\n" + "=" .repeat(50));
console.log("🧪 QUICK TEST AFTER SETUP:");
console.log("=" .repeat(50));
console.log("Run: node test-with-your-numbers.js");
console.log("Expected: ✅ SUCCESS! Message sent successfully!");

console.log("\n💡 TIP: Screenshot the Meta Console setup");
console.log("This helps verify the exact format used");

console.log("\n🎉 Once working, your WhatsApp AI Bot will be LIVE!");
console.log("Customers can message your business number and get AI responses!");

// Also provide current environment info
console.log("\n" + "=" .repeat(50));
console.log("📊 YOUR CURRENT CONFIGURATION:");
console.log("=" .repeat(50));

require("dotenv").config();

console.log("✅ Access Token: " + (process.env.WHATSAPP_ACCESS_TOKEN ? "Configured" : "Missing"));
console.log("✅ Phone Number ID: " + (process.env.WHATSAPP_PHONE_NUMBER_ID || "Missing"));
console.log("✅ Verify Token: " + (process.env.WHATSAPP_VERIFY_TOKEN || "Missing"));

console.log("\n📱 Numbers to Add:");
console.log("• Recipient: 8352986476");
console.log("• Test: 15551922233 (+1 555 192 2233)");

console.log("\n🔗 Useful Links:");
console.log("• Meta Developers: https://developers.facebook.com/");
console.log("• WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp/");
console.log("• Meta Business Help: https://www.facebook.com/business/help/");