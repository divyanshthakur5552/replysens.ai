const redis = require("../config/redis");

exports.setSlots = async (req, res) => {
  const date = req.body.date?.trim();
  const { slots } = req.body;
  const key = `slots:${req.businessId}:${date}`;
  await redis.set(key, JSON.stringify(slots));
  res.json({ message: "Slots set" });
};

exports.getSlots = async (req, res) => {
  const date = req.query.date?.trim();
  const key = `slots:${req.businessId}:${date}`;
  const data = await redis.get(key);
  res.json(JSON.parse(data || "[]"));
};
exports.debugKeys = async (req, res) => {
  const keys = await redis.keys("*");
  res.json(keys);
};
