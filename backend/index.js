const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
const onboardingRoutes = require("./src/routes/onboarding");
app.use("/onboarding", onboardingRoutes);

app.use("/auth", authRoutes);

const contextRoutes = require("./src/routes/context");
app.use("/context", contextRoutes);
const bookingRoutes = require("./src/routes/booking");
app.use("/booking", bookingRoutes);

const chatRoutes = require("./src/routes/chat");
app.use("/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Backend running" });
});

app.listen(8000, () => console.log("Server running on port 8000"));
