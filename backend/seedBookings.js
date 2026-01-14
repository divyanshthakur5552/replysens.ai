const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Booking = require("./src/models/Booking");

const businessId = "6964230a7ff6b9857a0dbb5f"; // Test Salon

const services = ["haircut", "hair color", "beard trim", "facial"];
const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Neha"];
const slots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return "98" + Math.floor(10000000 + Math.random() * 90000000);
}

async function seedBookings() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing bookings for this business
  await Booking.deleteMany({ businessId });
  console.log("Cleared existing bookings");

  const bookings = [];
  const today = new Date();

  // Create bookings for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(10, 0, 0, 0);

    // Random number of bookings per day (1-5)
    const numBookings = Math.floor(Math.random() * 5) + 1;

    for (let j = 0; j < numBookings; j++) {
      bookings.push({
        businessId,
        service: randomItem(services),
        date: new Date(date),
        slot: randomItem(slots),
        customer: {
          name: randomItem(names),
          phone: randomPhone(),
          address: "Test Address"
        },
        status: Math.random() > 0.2 ? "confirmed" : "pending",
        source: Math.random() > 0.3 ? "web" : "whatsapp",
        createdAt: new Date(date)
      });
    }
  }

  // Add some upcoming bookings (next 3 days)
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(10, 0, 0, 0);

    const numBookings = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < numBookings; j++) {
      bookings.push({
        businessId,
        service: randomItem(services),
        date: new Date(date),
        slot: randomItem(slots),
        customer: {
          name: randomItem(names),
          phone: randomPhone(),
          address: "Test Address"
        },
        status: "confirmed",
        source: "web",
        createdAt: new Date()
      });
    }
  }

  await Booking.insertMany(bookings);
  console.log(`Created ${bookings.length} mock bookings`);

  // Show summary
  const summary = await Booking.aggregate([
    { $match: { businessId } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  console.log("\nBookings per day:");
  summary.forEach(s => console.log(`  ${s._id}: ${s.count} bookings`));

  await mongoose.disconnect();
  console.log("\nDone!");
  process.exit(0);
}

seedBookings().catch(console.error);
