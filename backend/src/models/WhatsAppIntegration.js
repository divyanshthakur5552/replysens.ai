const mongoose = require("mongoose");

const whatsAppIntegrationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true
  },
  phoneNumberId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient lookups
whatsAppIntegrationSchema.index({ phoneNumberId: 1 });
whatsAppIntegrationSchema.index({ businessId: 1 });

module.exports = mongoose.model("WhatsAppIntegration", whatsAppIntegrationSchema);