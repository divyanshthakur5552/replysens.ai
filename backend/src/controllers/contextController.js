const Business = require("../models/Business");
const redis = require("../config/redis");

exports.loadContext = async (req, res) => {
  try {
    // If context data is provided in the request body, update the business first
    if (req.body && Object.keys(req.body).length > 0) {
      await Business.findByIdAndUpdate(req.businessId, req.body);
    }
    
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
  } catch (error) {
    console.error('Context loading error:', error);
    res.status(500).json({ error: "Failed to load context", detail: error.message });
  }
};
exports.getContext = async (req, res) => {
  const redis = require("../config/redis");
  const data = await redis.get(`context:${req.businessId}`);
  res.json(JSON.parse(data || "{}"));
};
