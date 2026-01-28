const express = require("express");
const router = express.Router();


// Simulate DB / knowledge base
const knowledgeBase = {
  "8b8d2494-c3ae-4e53-9e0a-c7d0e0c768ec": [
    { question: "Which nuts are best for energy?", answer: "Almonds and cashews are great for energy." },
    { question: "Do you offer gift packaging?", answer: "Yes! You can select gift packaging at checkout." },
    { question: "What are your shipping rates?", answer: "Shipping depends on your location; typically $5–$15." }
  ]
};

// Simple helper to find the best answer
function findAnswer(botId, message) {
  const faqs = knowledgeBase[botId] || [];
  const lower = message.toLowerCase();
  const found = faqs.find(f => lower.includes(f.question.toLowerCase().split(" ")[0]));
  return found ? found.answer : "Sorry, I couldn't answer that.";
}

// API endpoint
// userchat.js
router.post("/:botId", (req, res) => {
  const { botId } = req.params; // now botId comes from the URL
  const { message, visitorId } = req.body;

  console.log('I got the question');
  console.log(`Visitor ${visitorId} asked: ${message}`);

  const reply = findAnswer(botId, message);

  res.json({ reply });
});

module.exports = router;

