const router = require("express").Router();
const auth = require("../middleware/auth");
const { saveOnboarding } = require("../controllers/onboardingController");

router.post("/", auth, saveOnboarding);

module.exports = router;
