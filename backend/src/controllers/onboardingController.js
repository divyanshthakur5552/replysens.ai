const Business = require("../models/Business");

exports.saveOnboarding = async (req, res) => {
  await Business.findByIdAndUpdate(req.businessId, {
    ...req.body,
    onboardingCompleted: true
  });
  res.json({ message: "Onboarding saved" });
};
