import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ChatHistory.css";

export default function ChatHistory() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chathistory/`, { withCredentials: true });
        setChats(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (!chats.length) return <div className="empty-state">No conversations found yet.</div>;

  return (
    <div className="chat-history-wrapper">
      <header className="history-header">
        <h1>Chat History</h1>
        <p>{chats.length} sessions</p>
      </header>

      <div className="chat-history-grid">
        {chats.map((chat) => (
          <div 
            key={chat.visitorId} 
            className={`chat-card ${expandedId === chat.visitorId ? 'active' : ''}`}
            onClick={() => setExpandedId(expandedId === chat.visitorId ? null : chat.visitorId)}
          >
            <div className="chat-card-summary">
              <div className="avatar">{chat.visitorName?.[0] || 'V'}</div>
              <div className="info">
                <h3>{chat.visitorName || `Visitor ${chat.visitorId.slice(0, 5)}`}</h3>
                <p>{chat.messages[chat.messages.length - 1]?.text.substring(0, 40)}...</p>
              </div>
              <span className="timestamp">
                {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {expandedId === chat.visitorId && (
              <div className="chat-thread" onClick={(e) => e.stopPropagation()}>
                {chat.messages.map((msg, index) => (
                  <div key={index} className={`msg-bubble-wrapper ${msg.sender}`}>
                    <div className="msg-bubble">
                      {msg.text}
                      <span className="msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}