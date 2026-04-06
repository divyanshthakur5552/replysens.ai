const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");

const app = express();

app.use(cors());
app.use(express.json());
console.log("🔍 Express middleware configured");

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

const monitoringRoutes = require("./src/routes/monitoring");
app.use("/monitoring", monitoringRoutes);

const healthRoutes = require("./src/routes/health");
app.use("/health", healthRoutes);

app.get("/test", (req, res) => {
  console.log("🧪 Test route called!");
  res.json({ message: "Test route working" });
});

const whatsappRoutes = require("./src/routes/whatsapp");
console.log("🔍 Mounting WhatsApp routes...");
app.use("/", whatsappRoutes);

const whatsappIntegrationRoutes = require("./src/routes/whatsappIntegration");
app.use("/whatsapp-integration", whatsappIntegrationRoutes);

app.listen(8000, () => console.log("Server running on port 8000"));
