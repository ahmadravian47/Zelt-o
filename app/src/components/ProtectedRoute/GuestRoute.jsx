import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const GuestRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const REACT_APP_SERVER_URL = import.meta.env.VITE_SERVER_URL;
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const csrfRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/csrf-token`, {
          credentials: "include"
        });
        const { csrfToken } = await csrfRes.json();

        await axios.get(`${import.meta.env.VITE_SERVER_URL}/userprofile`, {
          withCredentials: true, // include cookies
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF token header
          },
        });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;