// chatbot.js
(function () {
  if (window.__AI_CHATBOT_LOADED__) return;
  window.__AI_CHATBOT_LOADED__ = true;

  const script = document.currentScript;

  const BOT_ID = script.getAttribute("data-bot-id");
  const API_BASE = script.getAttribute("data-api");
  const ASSETS_BASE = script.getAttribute("data-assets");

  if (!BOT_ID || !API_BASE || !ASSETS_BASE) {
    console.error("Chatbot: Missing data attributes");
    return;
  }

  fetch(`${API_BASE}/api/chat/${BOT_ID}/register`, { method: "POST" }).catch(() => { });

  setInterval(() => {
    fetch(`${API_BASE}/api/chat/${BOT_ID}/heartbeat`, { method: "POST" }).catch(() => { });
  }, 5 * 60 * 1000);

  const container = document.createElement("div");
  container.id = "ai-chatbot-container";
  document.body.appendChild(container);

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `${ASSETS_BASE}/chatbot.css`;
  document.head.appendChild(css);

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

  const launcher = document.getElementById("chatbot-launcher");
  const windowEl = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("chatbot-close");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const messagesEl = document.getElementById("chatbot-messages");

  // ----- Visitor ID -----
  function createVisitor() {
    const id = "v_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(`visitor_${BOT_ID}`, id);
    return id;
  }

  let visitorId = localStorage.getItem(`visitor_${BOT_ID}`) || createVisitor();

  // ----- LocalStorage keys -----
  const CHAT_KEY = `chat_${BOT_ID}`;
  const CHAT_START_KEY = `chat_start_${BOT_ID}`;

  // ----- Chat storage functions -----
  function saveChat(messages) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  }

  function loadChat() {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function getChatStart() {
    const ts = localStorage.getItem(CHAT_START_KEY);
    return ts ? parseInt(ts) : null;
  }

  function setChatStart() {
    localStorage.setItem(CHAT_START_KEY, Date.now());
  }

  function clearChat() {
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(CHAT_START_KEY);
    messagesEl.innerHTML = "";
  }

  // ----- Check if 24 hours passed -----
  const chatStart = getChatStart();
  if (chatStart && Date.now() - chatStart >= 24 * 60 * 60 * 1000) {
    fetch(`${API_BASE}/api/chat/${BOT_ID}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    }).catch(() => { });
    clearChat();
  }

  // ----- Render messages -----
  function renderMessages() {
    messagesEl.innerHTML = "";
    const messages = loadChat();
    messages.forEach(({ text, sender }) => {
      addMessage(text, sender, false);
    });
  }

  // ----- Add message -----
  function addMessage(text, sender, save = true) {
    const msg = document.createElement("div");
    msg.className = `chatbot-message ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    if (save) {
      const messages = loadChat();
      messages.push({ text, sender });
      saveChat(messages);
      if (!getChatStart()) setChatStart();
    }
  }

  // ----- Typing indicator -----
  function showTyping() {
    const t = document.createElement("div");
    t.className = "chatbot-message bot typing";
    t.id = "typing-indicator";
    t.textContent = "Typing...";
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById("typing-indicator");
    if (t) t.remove();
  }

  // ----- Welcome message -----
  const greetedKey = `greeted_${BOT_ID}`;
  function showWelcomeMessage() {
    if (!localStorage.getItem(greetedKey)) {
      // setTimeout(() => addMessage("Hi 👋 How can I help you?"), 400);
      localStorage.setItem(greetedKey, "1");
    }
  }

  // ----- Send message -----
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
        body: JSON.stringify({ visitorId, message: text }),
      });

      const data = await res.json();
      hideTyping();
      addMessage(data.reply || "Sorry, I couldn't answer that.", "bot");
    } catch {
      hideTyping();
      addMessage("Something went wrong. Please try again.", "bot");
    }
  }

  // ----- Events -----
  launcher.onclick = () => {
    windowEl.classList.remove("hidden");
    renderMessages();
    showWelcomeMessage();
  };

  closeBtn.onclick = () => windowEl.classList.add("hidden");
  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
})();
