const express = require("express");
const router = express.Router();
const FAQ = require("../models/Faq");
const Organization = require("../models/Organization");


router.get("/", async (req, res) => {
    try {
        const user = req.user;
        // Get organization number for the user
        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

        // Fetch FAQs
        const faqs = await FAQ.find({ organizationNumber: org.organizationNumber }).sort({ createdAt: -1 });
        res.json({ success: true, faqs });
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) return res.status(400).json({ success: false, message: "Question and answer are required" });

        const user = req.user;
        // Get organization number for the user
        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

        const faq = await FAQ.create({
            organizationNumber: org.organizationNumber,
            question,
            answer,
        });

        res.json({ success: true, faq });
    } catch (err) {
        console.error("Error creating FAQ:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Get organization number for the user
        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        if (!org) return res.status(404).json({ success: false, message: "Organization not found" });

        // Ensure the FAQ belongs to the user's organization
        const faq = await FAQ.findOne({ _id: id, organizationNumber: org.organizationNumber });
        if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

        await FAQ.deleteOne({ _id: id });
        res.json({ success: true, message: "FAQ deleted" });
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
