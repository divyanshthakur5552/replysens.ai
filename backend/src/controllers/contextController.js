const Business = require("../models/Business");
const redis = require("../config/redis");

exports.loadContext = async (req, res) => {
  const business = await Business.findById(req.businessId).select("-password");

  const context = {
    tone: business.tone,
    services: business.services,
    pricing: business.pricing,
    workingHours: business.workingHours,
    sessionDuration: business.sessionDuration,
    businessType: business.businessType
  };

  await redis.set(`context:${req.businessId}`, JSON.stringify(context));

  res.json({ message: "Context loaded to Redis", context });
};
exports.getContext = async (req, res) => {
  const redis = require("../config/redis");
  const data = await redis.get(`context:${req.businessId}`);
  res.json(JSON.parse(data || "{}"));
};
