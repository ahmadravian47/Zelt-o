const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");


router.post("/:botId", async (req, res) => {
  const { botId } = req.params;
  const { message, visitorId } = req.body;

  if (!message || !visitorId) {
    return res.status(400).json({ reply: "Invalid request" });
  }

  try {
    const org = await Organization.findOne({ "bot.botId": botId });

    if (!org) {
      return res.status(404).json({ reply: "Bot not found" });
    }

    if (!org.bot.isLive) {
      return res.status(403).json({ reply: "This bot is not live yet." });
    }

    const faqs = org.faqs || [
      { question: "Which nuts are best for energy?", answer: "Almonds and cashews are great for energy." },
      { question: "Do you offer gift packaging?", answer: "Yes! You can select gift packaging at checkout." },
      { question: "What are your shipping rates?", answer: "Shipping depends on your location; typically $5–$15." }
    ];

    const lower = message.toLowerCase();
    const found = faqs.find(f => lower.includes(f.question.toLowerCase().split(" ")[0]));
    const reply = found ? found.answer : "Sorry, I couldn't answer that.";

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
