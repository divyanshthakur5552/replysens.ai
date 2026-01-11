const router = require("express").Router();
const auth = require("../middleware/auth");
const { setSlots, getSlots, debugKeys } = require("../controllers/bookingController");

router.post("/slots", auth, setSlots);
router.get("/slots", auth, getSlots);
router.get("/debug", auth, debugKeys);

module.exports = router;
