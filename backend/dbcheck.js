const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Business = require("./src/models/Business");

async function checkDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  const businesses = await Business.find({}).lean();
  console.log("\n=== All Businesses in DB ===\n");
  console.log(JSON.stringify(businesses, null, 2));
  console.log(`\nTotal: ${businesses.length} businesses`);
  
  await mongoose.disconnect();
}

checkDB().catch(console.error);
