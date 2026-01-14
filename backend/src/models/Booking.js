const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  slot: { type: String },
  customer: {
    name: String,
    phone: String,
    address: String,
    issue: String
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "canceled"],
    default: "pending"
  },
  source: { type: String, default: "web" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);
