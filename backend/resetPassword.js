const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: __dirname + "/.env" });

const Business = require("./src/models/Business");

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: node resetPassword.js <email> <newPassword>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const business = await Business.findOne({ email });
  if (!business) {
    console.error(`No business found for email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  business.password = hashed;
  await business.save();

  console.log(`Password reset successful for: ${email}`);
  await mongoose.disconnect();
}

resetPassword().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
