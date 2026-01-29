// chatbot.js
(function () {
  // Prevent loading twice
  if (window.__AI_CHATBOT_LOADED__) return;
  window.__AI_CHATBOT_LOADED__ = true;

  // Get the script tag that included this JS
  const script = document.currentScript;

  // Read configuration from data attributes
  const BOT_ID = script.getAttribute("data-bot-id");
  const API_BASE = script.getAttribute("data-api");
  const ASSETS_BASE = script.getAttribute("data-assets");

  /* ---------- Make bot live immediately ---------- */
  fetch(`${API_BASE}/api/chat/${BOT_ID}/register`, { method: "POST" })
    .then(() => console.log("Bot registered as live"))
    .catch(err => console.error("Failed to register bot as live", err));

  if (!BOT_ID || !API_BASE || !ASSETS_BASE) {
    console.error("Chatbot: Missing data-bot-id, data-api or data-assets");
    return;
  }

  // Heartbeat: ping backend every 5 minutes to update the last seen of bot
  setInterval(() => {
    fetch(`${API_BASE}/api/chat/${BOT_ID}/heartbeat`, { method: "POST" })
      .then(() => console.log("Heartbeat sent"))
      .catch(err => console.error("Heartbeat failed", err));
  }, 5 * 60 * 1000); // every 5 minutes


  /* ---------- Create Container ---------- */
  const container = document.createElement("div");
  container.id = "ai-chatbot-container";
  document.body.appendChild(container);

  /* ---------- Load CSS Dynamically ---------- */
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `${ASSETS_BASE}/chatbot.css`; // load from assets URL
  document.head.appendChild(css);

  /* ---------- Inject HTML ---------- */
  container.innerHTML = `
    <div class="chatbot-launcher" id="chatbot-launcher">💬</div>
    <div class="chatbot-window hidden" id="chatbot-window">
      <div class="chatbot-header">
        <span>Chat with us</span>
        <button id="chatbot-close">×</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-input-area">
        <input type="text" id="chatbot-input" placeholder="Ask a question..." />
        <button id="chatbot-send">Send</button>
      </div>
    </div>
  `;

  /* ---------- Elements ---------- */
  const launcher = document.getElementById("chatbot-launcher");
  const windowEl = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("chatbot-close");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const messagesEl = document.getElementById("chatbot-messages");

  /* ---------- Visitor ID ---------- */
  let visitorId = localStorage.getItem(`visitor_${BOT_ID}`);
  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(`visitor_${BOT_ID}`, visitorId);
  }

  /* ---------- Helpers ---------- */
  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `chatbot-message ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chatbot-message bot typing";
    typing.id = "typing-indicator";
    typing.textContent = "Typing...";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  /* ---------- Send Message to Backend ---------- */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/api/chat/${BOT_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          message: text
        }),
      });

      const data = await res.json();
      hideTyping();
      addMessage(data.reply || "Sorry, I couldn't answer that.", "bot");

    } catch (err) {
      hideTyping();
      addMessage("Something went wrong. Please try again.", "bot");
      console.error(err);
    }
  }

  /* ---------- Event Listeners ---------- */
  launcher.onclick = () => windowEl.classList.remove("hidden");
  closeBtn.onclick = () => windowEl.classList.add("hidden");
  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
