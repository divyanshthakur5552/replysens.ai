const router = require("express").Router();
const { registerBusiness, loginBusiness, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", registerBusiness);
router.post("/login", loginBusiness);
router.get("/me", authMiddleware, getMe);

module.exports = router;
