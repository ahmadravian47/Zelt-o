import React, { useEffect, useState } from "react";
import './DashboardHome.css'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, Settings, MessageSquare, History, BarChart3, LifeBuoy, LogOut, ExternalLink } from "lucide-react";

export default function DashboardHome({ data, setActiveView }) {

    if (!data) return <div>Loading...</div>;

    const { user, organization, faqCount, recentChats, stats } = data;
    const [copied, setCopied] = useState(false);


    return (
        <div style={{ flex: 1 }}>
            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1 className="header-title">Welcome Back, {user.name}!</h1>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="header-avatar" alt="profile" />
                </header>

                {/* <p style={{ marginBottom: "25px", fontWeight: "500" }}>
                    Your AI Chatbot is <span style={{ color: '#f25534' }}>{organization.bot.isLive ? "Live" : "Offline"}</span> on Your Site.
                </p> */}

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
                                <button
                                    className="dashboard-primary-btn"
                                    style={{ marginTop: "20px" }}
                                    onClick={() => setActiveView("description")} // <-- Switch parent view
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="dashboard-card">
                                <h4 style={{ margin: "0 0 10px 0" }}>FAQs</h4>
                                <div className="faq-count">{faqCount} <span className="faq-label">FAQs</span></div>
                                <button
                                    className="dashboard-primary-btn"
                                    style={{ marginTop: "20px" }}
                                    onClick={() => setActiveView("faqs")} // <-- Switch parent view
                                >
                                    Edit FAQs
                                </button>
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
    )
}

const StatCard = ({ label, value, sub, progress }) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: progress }} /></div>
    </div>
);
