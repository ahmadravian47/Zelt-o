const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const FAQ = require("../models/Faq");
const Chat = require("../models/Chat");
const { spawn } = require("child_process");

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

    // 1️⃣ Find or create active chat
    let chat = await Chat.findOne({
      organizationNumber: org.organizationNumber,
      visitorId,
      isActive: true,
    });

    if (!chat) {
      chat = await Chat.create({
        organizationNumber: org.organizationNumber,
        visitorId,
        messages: [],
      });
    }

    // 2️⃣ Save user message
    chat.messages.push({ sender: "user", text: message });
    await chat.save();

    // 3️⃣ Fetch FAQs
    const faqs = await FAQ.find({ organizationNumber: org.organizationNumber }).lean();

    // 4️⃣ Prepare payload for Python
    const payload = {
      description: org.businessDescription,
      faqs: faqs.map(f => ({ question: f.question, answer: f.answer })),
      query: message,
      visitorId, // send visitorId to Groq script for session tracking
      chat_history: chat.messages // send previous messages for multi-turn RAG
    };

    // 5️⃣ Decide Python script based on AI provider
    const pythonScript = org.ai.provider === "external"
      ? "python/groq_based_chatbot.py"
      : "python/chatbot.py";

    const py = spawn("python3", [pythonScript]);

    let output = "";

    py.stdout.on("data", data => { output += data.toString(); });
    py.stderr.on("data", err => { console.error("Python error:", err.toString()); });

    py.on("close", async () => {
      try {
        const result = JSON.parse(output);
        const reply = result.answer || "Sorry, I couldn't answer that.";

        // 6️⃣ Save bot message
        chat.messages.push({ sender: "bot", text: reply });
        await chat.save();

        res.json({ reply });
      } catch (err) {
        console.error("Python parse error:", err);
        res.json({ reply: "Something went wrong." });
      }
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

router.post("/:botId/end", async (req, res) => {
  const { visitorId } = req.body;

  try {
    const org = await Organization.findOne({ "bot.botId": req.params.botId });
    if (!org) return res.status(404).json({ success: false });

    const chat = await Chat.findOne({
      organizationNumber: org.organizationNumber,
      visitorId,
      isActive: true,
    });

    if (!chat) return res.json({ success: true });

    // Collect ONLY user messages
    const userMessages = chat.messages
      .filter(m => m.sender === "user")
      .map(m => m.text);

    const py = spawn("python3", ["python/sentiment.py"]);

    let output = "";

    py.stdout.on("data", data => {
      output += data.toString();
    });

    py.stderr.on("data", err => {
      console.error("Sentiment error:", err.toString());
    });

    py.on("close", async () => {
      try {
        const result = JSON.parse(output);

        chat.sentiment = result.sentiment || "neutral";
        chat.isActive = false;
        await chat.save();

        res.json({ success: true });
      } catch (err) {
        console.error("Sentiment parse error:", err);
        res.status(500).json({ success: false });
      }
    });

    py.stdin.write(JSON.stringify({ messages: userMessages }));
    py.stdin.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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
