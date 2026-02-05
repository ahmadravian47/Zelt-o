// routes/chatHistory.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// GET /api/chat/history/:organizationNumber
router.get("/", async (req, res) => {
    try {
        const user = req.user;
        const chats = await Chat.find({ organizationNumber: user.organizationNumber }).sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

module.exports = router;
