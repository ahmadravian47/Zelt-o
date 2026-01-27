import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, Settings, MessageSquare, History, BarChart3, LifeBuoy, LogOut, ExternalLink } from "lucide-react";
import "./dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/dashboard`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {

      const csrfRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/csrf-token`, {
        credentials: "include"
      });
      const { csrfToken } = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers:
        {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        }
      });
      navigate('/login');
     
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!data) return <div>Loading...</div>;

  const { user, organization, faqCount, recentChats, stats } = data;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle"><div className="logo-dot" /></div>
          <h2 className="sidebar-title">Dashboard</h2>
        </div>

        <div className="user-profile">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="user-avatar" alt="User" />
          <div>
            <p className="user-name">{user.name}</p>
            <p className="user-company">{organization.businessName}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Settings size={20} />} label="Bot Settings" />
          <NavItem icon={<MessageSquare size={20} />} label="FAQs & Info" />
          <NavItem icon={<History size={20} />} label="Chat History" />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
        </nav>

        <div className="sidebar-footer">
          <NavItem icon={<LifeBuoy size={20} />} label="Support" />
          <div onClick={handleLogout} className="nav-item" style={{ cursor: "pointer" }}>
            <LogOut size={20} /> <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="header-title">Welcome Back, {user.name}!</h1>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="header-avatar" alt="profile" />
        </header>

        <p style={{ marginBottom: "25px", fontWeight: "500" }}>
          Your AI Chatbot is <span style={{ color: organization.branding.primaryColor }}>{organization.bot.isLive ? "Live" : "Offline"}</span> on Your Site.
        </p>

        {/* Stats Row */}
        <div className="stats-grid">
          <StatCard label="Questions Answered" value={stats.questionsAnswered} sub="This Month" progress="70%" />
          <StatCard label="Active Chats" value={stats.activeChats} sub="Right Now" progress="40%" />
          <StatCard label="Satisfaction Rate" value={Math.round((stats.sentiment.positive / stats.totalChats) * 100) || 0 + "%"} sub="This Month" progress={Math.round((stats.sentiment.positive / stats.totalChats) * 100) + "%"} />
        </div>

        {/* Left Column */}
        <div className="content-grid">
          <div>
            <h3 className="dashboard-section-title">Training & Content</h3>
            <div className="training-grid">
              <div className="dashboard-card training-card">
                <h4>Business Info</h4>
                <p className="training-description">Learn more simple to displace customer products, regarding projects, and more.</p>
                <button className="dashboard-primary-btn" style={{ marginTop: "20px" }}>Manage</button>
              </div>
              <div className="dashboard-card">
                <h4 style={{ margin: "0 0 10px 0" }}>FAQs</h4>
                <div className="faq-count">{faqCount} <span className="faq-label">FAQs</span></div>
                <button className="dashboard-primary-btn" style={{ marginTop: "20px" }}>Edit FAQs ▾</button>
              </div>
            </div>

            <h3 className="dashboard-section-title">Recent Chats</h3>
            <div className="dashboard-card chats-container">
              {recentChats.map((chat, i) => (
                <div key={i} className="dashboard-chat-row">
                  <p className="chat-message">
                    <strong className="chat-user">{chat.visitorName || "Anonymous"}:</strong>
                    <span className="chat-text">"{chat.sentiment}"</span>
                  </p>
                  <div className="chat-time">{new Date(chat.createdAt).toLocaleTimeString()} <ExternalLink size={12} /></div>
                </div>
              ))}
              <button className="view-all-btn">View All Chats &gt;</button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="dashboard-card sentiment-analysis">
              <h4>Sentiment Analysis</h4>
              <div className="files-stats">
                <div>
                  <div className="doc-count">{stats.totalChats} <span className="doc-label">Total Chats</span></div>
                  <ul className="sentiment-list">
                    <li className="sentiment-item"><div className="sentiment-dot positive" /> {stats.sentiment.positive}% Positive</li>
                    <li className="sentiment-item"><div className="sentiment-dot neutral" /> {stats.sentiment.neutral}% Neutral</li>
                    <li className="sentiment-item"><div className="sentiment-dot negative" /> {stats.sentiment.negative}% Negative</li>
                  </ul>
                </div>
                <div className="sentiment-circle">
                  {Math.round((stats.sentiment.positive / stats.totalChats) * 100) || 0}% <span className="sentiment-percentage">Positive</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h4 style={{ margin: "0 0 10px 0" }}>Embed Code</h4>
              <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "10px" }}>Add this code to your website:</p>
              <div className="code-container">
                <code dangerouslySetInnerHTML={{ __html: organization.bot.embedCode }} />
              </div>
              <button className="dashboard-primary-btn" style={{ width: "100%", marginTop: "15px" }}>Copy Code</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components (NavItem, StatCard same as before)
const NavItem = ({ icon, label, active }) => <div className={`nav-item ${active ? "active" : ""}`}>{icon} <span className="nav-label">{label}</span></div>;
const StatCard = ({ label, value, sub, progress }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-sub">{sub}</div>
    <div className="progress-bar"><div className="progress-fill" style={{ width: progress }} /></div>
  </div>
);

export default Dashboard;
