// userChat.js
const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization"); // your org schema

// Optional: Use MongoDB collection to store chat history
// const ChatSession = require("../models/ChatSession");

router.post("/:botId", async (req, res) => {
  const { botId } = req.params;
  const { message, visitorId } = req.body;

  if (!message || !visitorId) {
    return res.status(400).json({ reply: "Invalid request" });
  }

  try {
    // 1️⃣ Find the organization by botId
    const org = await Organization.findOne({ "bot.botId": botId });

    if (!org) {
      return res.status(404).json({ reply: "Bot not found" });
    }

    // 2️⃣ Check if bot is live
    if (!org.bot.isLive) {
      return res.status(403).json({ reply: "This bot is not live yet." });
    }

    // 3️⃣ Get FAQs or business info dynamically
    // Assuming you have a field org.faqs or org.businessInfo
    // For now, let's simulate simple FAQs array
    const faqs = org.faqs || [
      { question: "Which nuts are best for energy?", answer: "Almonds and cashews are great for energy." },
      { question: "Do you offer gift packaging?", answer: "Yes! You can select gift packaging at checkout." },
      { question: "What are your shipping rates?", answer: "Shipping depends on your location; typically $5–$15." }
    ];

    // 4️⃣ Simple keyword match (replace with AI later)
    const lower = message.toLowerCase();
    const found = faqs.find(f => lower.includes(f.question.toLowerCase().split(" ")[0]));
    const reply = found ? found.answer : "Sorry, I couldn't answer that.";

    // 5️⃣ Optional: Save chat to DB for analytics
    // await ChatSession.create({ visitorId, botId, message, reply });

    console.log(`Visitor ${visitorId} asked: ${message}`);
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

router.post("/:botId/register", async (req, res) => {
  const org = await Organization.findOne({ "bot.botId": req.params.botId });
  if (!org) return res.status(404).json({ success: false });
  if (!org.bot.isLive) {
    org.bot.isLive = true;
    org.bot.lastSeen = new Date();
    await org.save();
  }
  res.json({ success: true });
});

// POST /api/chat/:botId/heartbeat
router.post("/:botId/heartbeat", async (req, res) => {
  try {
    const org = await Organization.findOne({ "bot.botId": req.params.botId });
    if (!org) return res.status(404).json({ success: false });

    org.bot.lastSeen = new Date();
    org.bot.isLive = true; 
    await org.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;
