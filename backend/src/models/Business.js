const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  businessType: String,
  tone: String,
services: [String],
pricing: Object,
workingHours: Object,
sessionDuration: Number,
onboardingCompleted: { type: Boolean, default: false }

});

module.exports = mongoose.model("Business", businessSchema);
