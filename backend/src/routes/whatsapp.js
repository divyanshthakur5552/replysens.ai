const express = require("express");
const { verifyWebhook, handleWebhook } = require("../controllers/whatsappController");
const { logToFile } = require("../../webhook-debug");

const router = express.Router();

console.log("🔍 WhatsApp routes loaded");
logToFile("WhatsApp routes loaded");

// GET /webhook - Webhook verification
router.get("/webhook", (req, res) => {
  console.log("🔍 GET /webhook called");
  logToFile("GET /webhook called");
  verifyWebhook(req, res);
});

// POST /webhook - Handle incoming messages
router.post("/webhook", (req, res) => {
  console.log("🔍 POST /webhook called");
  logToFile("POST /webhook called with body: " + JSON.stringify(req.body));
  handleWebhook(req, res);
});

module.exports = router;