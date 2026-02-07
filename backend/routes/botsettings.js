const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");


router.patch("/", async (req, res) => {
    try {

        const user = req.user;
        const { businessName, branding, ai } = req.body;

        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        // Find the organization belonging to this user

        if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

        // Update fields if provided
        if (businessName) org.businessName = businessName;
        if (branding?.primaryColor) org.branding.primaryColor = branding.primaryColor;

        // Optional AI config
        if (ai?.provider === "external") {
            org.ai = { provider: "external" };
        } 
         if (ai?.provider === "internal") {
            org.ai = { provider: "internal" };
        } 


        await org.save();

        // Exclude sensitive data in response
        const response = {
            businessName: org.businessName,
            branding: org.branding,
            ai: { provider: org.ai.provider },
        };

        res.json({ success: true, organization: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/my-info", async (req, res) => {
    try {
        const user = req.user;

        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        if (!org) {
            return res
                .status(404)
                .json({ success: false, message: "Organization not found" });
        }

        // Send only safe fields
        const response = {
            businessName: org.businessName,
            branding: org.branding,
            ai: {
                provider: org.ai?.provider || "internal",
                // do NOT send the key
            },
        };

        res.json({ success: true, organization: response });
    } catch (err) {
        console.error("Error fetching organization:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


module.exports = router;
