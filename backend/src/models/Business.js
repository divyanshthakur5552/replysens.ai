const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  duration: Number,
  price: Number
}, { _id: false });

const businessSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  businessType: String,
  tone: String,
  services: [serviceSchema],
  pricing: Object,
  workingHours: Object,
  sessionDuration: Number,
  onboardingCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Business", businessSchema);
