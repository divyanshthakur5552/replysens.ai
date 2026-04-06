const express = require("express");
const WhatsAppIntegration = require("../models/WhatsAppIntegration");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Create WhatsApp integration for a business
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { phoneNumberId } = req.body;
    const businessId = req.businessId;
    
    if (!phoneNumberId) {
      return res.status(400).json({ error: "Phone number ID is required" });
    }
    
    // Check if integration already exists
    const existing = await WhatsAppIntegration.findOne({ 
      $or: [
        { businessId },
        { phoneNumberId }
      ]
    });
    
    if (existing) {
      if (existing.businessId.toString() === businessId) {
        return res.status(400).json({ error: "WhatsApp integration already exists for this business" });
      } else {
        return res.status(400).json({ error: "This phone number is already integrated with another business" });
      }
    }
    
    const integration = await WhatsAppIntegration.create({
      businessId,
      phoneNumberId,
      status: "active"
    });
    
    res.status(201).json({
      message: "WhatsApp integration created successfully",
      integration: {
        id: integration._id,
        phoneNumberId: integration.phoneNumberId,
        status: integration.status,
        createdAt: integration.createdAt
      }
    });
    
  } catch (error) {
    console.error("Error creating WhatsApp integration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get WhatsApp integration for current business
router.get("/", authenticateToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    
    const integration = await WhatsAppIntegration.findOne({ businessId });
    
    if (!integration) {
      return res.status(404).json({ error: "No WhatsApp integration found" });
    }
    
    res.json({
      integration: {
        id: integration._id,
        phoneNumberId: integration.phoneNumberId,
        status: integration.status,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error fetching WhatsApp integration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update WhatsApp integration status
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const businessId = req.businessId;
    
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'active' or 'inactive'" });
    }
    
    const integration = await WhatsAppIntegration.findOneAndUpdate(
      { _id: id, businessId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!integration) {
      return res.status(404).json({ error: "WhatsApp integration not found" });
    }
    
    res.json({
      message: "WhatsApp integration updated successfully",
      integration: {
        id: integration._id,
        phoneNumberId: integration.phoneNumberId,
        status: integration.status,
        updatedAt: integration.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Error updating WhatsApp integration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete WhatsApp integration
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId;
    
    const integration = await WhatsAppIntegration.findOneAndDelete({ _id: id, businessId });
    
    if (!integration) {
      return res.status(404).json({ error: "WhatsApp integration not found" });
    }
    
    res.json({ message: "WhatsApp integration deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting WhatsApp integration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;