import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  History,
  BarChart3,
  LogOut
} from "lucide-react";
import "./dashboard.css";
import DashboardHome from "../DashboardHome/DashboardHome";
import BotSettings from "../BotSettings/BotSettings";
import ChatHistory from "../ChatHistory/ChatHistory";
import Faqs from "../Faqs/Faqs";
import Description from "../Description/Description";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/dashboard`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/csrf-token`,
        { credentials: "include" }
      );
      const { csrfToken } = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        }
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!data) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const { user, organization } = data;

  return (
    <div className="dashboard-container">
      {/* Hamburger Button */}
      <button
        className={`dashboard-hamburger-btn ${
          sidebarOpen ? "dashboard-hamburger-open" : ""
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "dashboard-sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-circle">
            <div className="logo-dot" />
          </div>
          <h2 className="sidebar-title">Dashboard</h2>
        </div>

        <div className="user-profile">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            className="user-avatar"
            alt="User"
          />
          <div>
            <p className="user-name">{user.name}</p>
            <p className="user-company">{organization.businessName}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeView === "dashboard"}
            onClick={() => {
              setActiveView("dashboard");
              setSidebarOpen(false);
            }}
          />

          <NavItem
            icon={<Settings size={20} />}
            label="Bot Settings"
            active={activeView === "settings"}
            onClick={() => {
              setActiveView("settings");
              setSidebarOpen(false);
            }}
          />

          <NavItem
            icon={<MessageSquare size={20} />}
            label="FAQs & Info"
            active={activeView === "faqs"}
            onClick={() => {
              setActiveView("faqs");
              setSidebarOpen(false);
            }}
          />

          <NavItem
            icon={<History size={20} />}
            label="Chat History"
            active={activeView === "history"}
            onClick={() => {
              setActiveView("history");
              setSidebarOpen(false);
            }}
          />

          <NavItem
            icon={<BarChart3 size={20} />}
            label="Description"
            active={activeView === "description"}
            onClick={() => {
              setActiveView("description");
              setSidebarOpen(false);
            }}
          />
        </nav>

        <div className="sidebar-footer">
          <div onClick={handleLogout} className="nav-item">
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {activeView === "dashboard" && (
        <DashboardHome data={data} setActiveView={setActiveView} />
      )}
      {activeView === "settings" && <BotSettings />}
      {activeView === "faqs" && <Faqs />}
      {activeView === "history" && <ChatHistory />}
      {activeView === "description" && <Description />}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    className={`nav-item ${active ? "active" : ""}`}
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    {icon}
    <span className="nav-label">{label}</span>
  </div>
);

export default Dashboard;
