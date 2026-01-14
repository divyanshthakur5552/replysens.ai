const redis = require("./src/config/redis");

async function clearHistory() {
  const businessId = "6964230a7ff6b9857a0dbb5f"; // Test Salon
  
  await redis.del(`history:${businessId}`);
  await redis.del(`bookingState:${businessId}`);
  await redis.del(`selectedService:${businessId}`);
  await redis.del(`selectedDate:${businessId}`);
  await redis.del(`selectedSlot:${businessId}`);
  
  console.log("Chat history cleared for Test Salon!");
  process.exit(0);
}

clearHistory();
