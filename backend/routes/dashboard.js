const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const FAQ = require("../models/Faq");
const Chat = require("../models/Chat");
const Message = require("../models/Message");



router.get("/",async (req, res) => {
    try {
        const user = req.user;
       
        const org = await Organization.findOne({ organizationNumber: user.organizationNumber });
        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // FAQs count
        const faqCount = await FAQ.countDocuments({ organizationNumber: org.organizationNumber });

        // Recent chats
        const recentChats = await Chat.find({ organizationNumber: org.organizationNumber })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Stats
        const totalChats = await Chat.countDocuments({ organizationNumber: org.organizationNumber });
        const positive = await Chat.countDocuments({ organizationNumber: org.organizationNumber, sentiment: "positive" });
        const neutral = await Chat.countDocuments({ organizationNumber: org.organizationNumber, sentiment: "neutral" });
        const negative = await Chat.countDocuments({ organizationNumber: org.organizationNumber, sentiment: "negative" });
        const questionsAnswered = await Message.countDocuments({
            chatId: { $in: recentChats.map(c => c._id) },
            sender: "bot"
        });
        const activeChats = await Chat.countDocuments({ organizationNumber: org.organizationNumber, isActive: true });

        res.json({
            user: { name: user.name, email: user.email },
            organization: { businessName: org.businessName, bot: org.bot, branding: org.branding },
            faqCount,
            recentChats: recentChats.map(c => ({
                id: c._id,
                visitorName: c.visitorName,
                sentiment: c.sentiment,
                createdAt: c.createdAt
            })),
            stats: {
                questionsAnswered,
                activeChats,
                totalChats,
                sentiment: { positive, neutral, negative }
            }
        });
    } catch (err) {
        console.error("[DASHBOARD] Server error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
