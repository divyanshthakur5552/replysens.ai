const router = require("express").Router();
const auth = require("../middleware/auth");
const redis = require("../config/redis");
const { 
  setSlots, 
  getSlots, 
  debugKeys,
  getAllBookings,
  getTodayBookings,
  getUpcomingBookings,
  getBookingStats,
  getChartData,
  getServicesBreakdown,
  getStatusBreakdown,
  updateBookingStatus,
  deleteBooking,
  getCalendarBookings
} = require("../controllers/bookingController");

router.post("/slots", auth, setSlots);
router.get("/slots", auth, getSlots);
router.get("/debug", auth, debugKeys);

// Dashboard endpoints
router.get("/all", auth, getAllBookings);
router.get("/today", auth, getTodayBookings);
router.get("/upcoming", auth, getUpcomingBookings);
router.get("/calendar", auth, getCalendarBookings);

// Analytics endpoints
router.get("/stats", auth, getBookingStats);
router.get("/chart-data", auth, getChartData);
router.get("/services-breakdown", auth, getServicesBreakdown);
router.get("/status-breakdown", auth, getStatusBreakdown);

// Booking management
router.patch("/:id/status", auth, updateBookingStatus);
router.delete("/:id", auth, deleteBooking);

router.get("/debug/state", auth, async (req, res) => {
  const businessId = req.businessId;

  const state = await redis.get(`bookingState:${businessId}`);
  const service = await redis.get(`selectedService:${businessId}`);
  const date = await redis.get(`selectedDate:${businessId}`);
  const slot = await redis.get(`selectedSlot:${businessId}`);

  return res.json({ state, service, date, slot });
});

module.exports = router;
