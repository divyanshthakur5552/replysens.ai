const Business = require("../models/Business");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerBusiness = async (req, res) => {
  const { name, email, password, businessType } = req.body;

  const exists = await Business.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);

  await Business.create({
    name,
    email,
    password: hashed,
    businessType
  });

  res.json({ message: "Registered" });
};

exports.loginBusiness = async (req, res) => {
  const { email, password } = req.body;

  const business = await Business.findOne({ email });
  if (!business) return res.status(400).json({ message: "Invalid email" });

  const match = await bcrypt.compare(password, business.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({ token, businessId: business._id });
};
exports.getMe = async (req, res) => {
  try {
    const business = await Business.findById(req.businessId).select("-password");
    return res.json(business);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

