const redis = require("../config/redis");
const Booking = require("../models/Booking");

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

// STEP 4 — Dashboard Endpoints

// GET /bookings/all - All bookings for this business
exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find({ businessId: req.businessId }).sort({ date: -1 });
  res.json(bookings);
};

// GET /bookings/today - Today's bookings
exports.getTodayBookings = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookings = await Booking.find({
    businessId: req.businessId,
    date: { $gte: today, $lt: tomorrow }
  }).sort({ slot: 1 });

  res.json(bookings);
};

// GET /bookings/upcoming - Future bookings (from tomorrow onwards)
exports.getUpcomingBookings = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookings = await Booking.find({
    businessId: req.businessId,
    date: { $gte: tomorrow }
  }).sort({ date: 1, slot: 1 });

  res.json(bookings);
};

// GET /bookings/stats - Dashboard statistics
exports.getBookingStats = async (req, res) => {
  const businessId = req.businessId;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Get counts
  const [total, confirmed, pending, canceled, todayCount] = await Promise.all([
    Booking.countDocuments({ businessId }),
    Booking.countDocuments({ businessId, status: "confirmed" }),
    Booking.countDocuments({ businessId, status: "pending" }),
    Booking.countDocuments({ businessId, status: "canceled" }),
    Booking.countDocuments({ businessId, date: { $gte: today, $lt: tomorrow } })
  ]);

  res.json({
    total,
    confirmed,
    pending,
    canceled,
    todayCount
  });
};

// GET /bookings/chart-data - Last 7 days booking data for chart
exports.getChartData = async (req, res) => {
  const businessId = req.businessId;
  
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    const count = await Booking.countDocuments({
      businessId,
      date: { $gte: date, $lt: nextDay }
    });
    
    last7Days.push({
      date: date.toISOString().split('T')[0],
      bookings: count
    });
  }
  
  res.json(last7Days);
};

// GET /bookings/services-breakdown - Service breakdown for bar chart
exports.getServicesBreakdown = async (req, res) => {
  const businessId = req.businessId;
  
  const breakdown = await Booking.aggregate([
    { $match: { businessId } },
    { $group: { _id: "$service", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
    { $project: { name: "$_id", count: 1, _id: 0 } }
  ]);
  
  res.json(breakdown);
};

// GET /bookings/status-breakdown - Status breakdown for pie chart
exports.getStatusBreakdown = async (req, res) => {
  const businessId = req.businessId;
  
  const breakdown = await Booking.aggregate([
    { $match: { businessId } },
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $project: { name: "$_id", value: 1, _id: 0 } }
  ]);
  
  // Add colors
  const colorMap = {
    confirmed: "#4ADE80",
    pending: "#FACC15",
    canceled: "#EF4444"
  };
  
  const result = breakdown.map(item => ({
    ...item,
    color: colorMap[item.name] || "#9CA3AF"
  }));
  
  res.json(result);
};

// PATCH /bookings/:id/status - Update booking status
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!["pending", "confirmed", "canceled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  
  const booking = await Booking.findOneAndUpdate(
    { _id: id, businessId: req.businessId },
    { status },
    { new: true }
  );
  
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  
  res.json(booking);
};

// DELETE /bookings/:id - Delete a booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  
  const booking = await Booking.findOneAndDelete({
    _id: id,
    businessId: req.businessId
  });
  
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  
  res.json({ message: "Booking deleted" });
};

// GET /bookings/calendar - Bookings grouped by date for calendar view
exports.getCalendarBookings = async (req, res) => {
  const businessId = req.businessId;
  
  // Get all future bookings (from today onwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookings = await Booking.find({
    businessId,
    date: { $gte: today },
    status: { $in: ["confirmed", "pending"] }
  }).sort({ date: 1, slot: 1 });
  
  // Group bookings by date
  const grouped = {};
  
  for (const booking of bookings) {
    const dateKey = new Date(booking.date).toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push({
      _id: booking._id,
      service: booking.service,
      slot: booking.slot,
      status: booking.status,
      customer: booking.customer
    });
  }
  
  res.json(grouped);
};
