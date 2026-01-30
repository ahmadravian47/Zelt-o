const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");

router.get("/", async (req, res) => {
  try {
    const user = req.user;

    const org = await Organization.findOne({
      organizationNumber: user.organizationNumber,
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      businessDescription: org.businessDescription || "",
    });
  } catch (err) {
    console.error("Error fetching description:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = req.user;
    const { businessDescription } = req.body;

    if (!businessDescription || !businessDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business description is required",
      });
    }

    const org = await Organization.findOne({
      organizationNumber: user.organizationNumber,
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    org.businessDescription = businessDescription.trim();
    await org.save();

    res.json({
      success: true,
      message: "Business description saved",
    });
  } catch (err) {
    console.error("Error saving description:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;
