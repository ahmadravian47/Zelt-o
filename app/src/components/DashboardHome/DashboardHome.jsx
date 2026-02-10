import React, { useState } from "react";
import "./DashboardHome.css";
import { ExternalLink } from "lucide-react";

export default function DashboardHome({ data, setActiveView }) {
  if (!data) return <div>Loading...</div>;

  const { user, organization, faqCount, recentChats, stats } = data;
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ flex: 1 }}>
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="header-title">Welcome Back, {user.name}!</h1>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            className="header-avatar"
            alt="profile"
          />
        </header>

        {/* Stats Row */}
        <div className="stats-grid">
          <StatCard
            label="Questions Answered"
            value={stats.questionsAnswered}
            sub="This Month"
            progress="70%"
            className="qa-box"
          />

          <StatCard
            label="Active Chats"
            value={stats.activeChats}
            sub="Right Now"
            progress="40%"
            className="activechat-box"
          />

          <SentimentStatCard stats={stats} className="sentiment-box" />
        </div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column */}
          <div>
            <h3 className="dashboard-section-title">Training & Content</h3>

            <div className="training-grid">
              <div className="dashboard-card training-card">
                <h4>Business Info</h4>
                <p className="training-description">
                  Your business description is very helpful in answering questions.
                </p>
                <button
                  className="dashboard-primary-btn"
                  style={{ marginTop: "20px" }}
                  onClick={() => setActiveView("description")}
                >
                  Manage
                </button>
              </div>

              <div className="dashboard-card">
                <h4 style={{ margin: "0 0 10px 0" }}>FAQs</h4>
                <div className="faq-count">
                  {faqCount} <span className="faq-label">FAQs</span>
                </div>
                <button
                  className="dashboard-primary-btn editfaq"
                  style={{ marginTop: "20px" }}
                  onClick={() => setActiveView("faqs")}
                >
                  Edit FAQs
                </button>
              </div>
            </div>

            <h3 className="dashboard-section-title rechat">Recent Chats</h3>

            <div className="dashboard-card chats-container">
              {recentChats.map((chat, i) => (
                <div key={i} className="dashboard-chat-row">
                  <p className="chat-message">
                    <strong className="chat-user">
                      {chat.visitorName || "Anonymous"}:
                    </strong>
                    <span className="chat-text">"{chat.sentiment}"</span>
                  </p>
                  <div className="chat-time">
                    {new Date(chat.createdAt).toLocaleTimeString()}
                    <ExternalLink size={12} />
                  </div>
                </div>
              ))}
              <button className="view-all-btn">View All Chats &gt;</button>
            </div>
          </div>

          {/* Right Column */}
          <div className="embedcode-grid">
            <div className="dashboard-card embedcode">
              <h4 style={{ margin: "0 0 10px 0" }}>Embed Code</h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  marginBottom: "10px",
                }}
              >
                Add this code to your website:
              </p>

              <div className="code-container">
                <pre>
                  <code>{organization.bot.embedCode}</code>
                </pre>
              </div>

              <button
                className="dashboard-primary-btn"
                style={{ width: "100%", marginTop: "15px" }}
                onClick={() => {
                  navigator.clipboard.writeText(organization.bot.embedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Components ---------- */

const StatCard = ({ label, value, sub, progress }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-sub">{sub}</div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: progress }} />
    </div>
  </div>
);

const SentimentStatCard = ({ stats }) => {
  const positivePercent =
    Math.round((stats.sentiment.positive / stats.totalChats) * 100) || 0;

  return (
    <div className="stat-card sentiment-stat">
      <div className="stat-label">Sentiment</div>

      <div className="sentiment-stat-value">
        {positivePercent}%
        <span className="sentiment-stat-sub">Positive</span>
      </div>

      <div className="sentiment-mini">
        <span className="positive">{stats.sentiment.positive}% P</span>
        <span className="neutral">{stats.sentiment.neutral}% N</span>
        <span className="negative">{stats.sentiment.negative}% Neg</span>
      </div>
    </div>
  );
};
