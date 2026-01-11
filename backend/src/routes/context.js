const router = require("express").Router();
const auth = require("../middleware/auth");
const { loadContext, getContext } = require("../controllers/contextController");

router.post("/load", auth, loadContext);
router.get("/", auth, getContext);
module.exports = router;
