const redis = require("../config/redis");

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  const businessId = req.businessId;

  const contextKey = `context:${businessId}`;
  const historyKey = `history:${businessId}`;

  // 1. Load context from Redis
  const contextData = await redis.get(contextKey);
  const context = JSON.parse(contextData || "{}");

  // 2. Load previous chat history
  let history = JSON.parse(await redis.get(historyKey) || "[]");

  // default mock reply (AI model comes tomorrow)
  let reply = `(mock-${context.tone || "friendly"}) I received: "${message}"`;

  // 3. Basic booking intent detection
  if (message.toLowerCase().includes("book")) {
    const today = new Date().toISOString().slice(0,10);
    const slotKey = `slots:${businessId}:${today}`;
    const slots = JSON.parse(await redis.get(slotKey) || "[]");

    if (slots.length > 0) {
      reply = `Available slots today: ${slots.join(", ")}`;
    } else {
      reply = `No slots available today. Please try another day.`;
    }
  }

  // 4. Save message to history
  history.push(`User: ${message}`);
  history.push(`AI: ${reply}`);

  await redis.set(historyKey, JSON.stringify(history));

  return res.json({
    reply,
    history
  });
};
