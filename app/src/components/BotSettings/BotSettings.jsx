import React, { useState, useEffect } from "react";
import "./BotSettings.css";

const BotSettings = () => {
  const [businessName, setBusinessName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#f25534");
  const [useExternalAI, setUseExternalAI] = useState(false); // rename state
  const [openAiKey, setOpenAiKey] = useState("");
  const [loadingBranding, setLoadingBranding] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [brandingStatus, setBrandingStatus] = useState({ type: "", message: "" });
  const [aiStatus, setAiStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/botsettings/my-info`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.organization) {
          const org = data.organization;
          setBusinessName(org.businessName || "");
          setPrimaryColor(org.branding?.primaryColor || "#f25534");
          if (org.ai?.provider === "external") {
            setUseExternalAI(true);
          } else {
            setUseExternalAI(false);
          }

        }
      } catch (err) {
        setBrandingStatus({ type: "error", message: "Failed to load settings." });
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleBrandingSave = async () => {
    setLoadingBranding(true);
    setBrandingStatus({ type: "", message: "" });
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/botsettings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ businessName, branding: { primaryColor } }),
      });
      if (res.ok) setBrandingStatus({ type: "success", message: "Info updated!" });
      else throw new Error();
    } catch (err) {
      setBrandingStatus({ type: "error", message: "Update failed." });
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleAIEngineSave = async () => {
    setLoadingAI(true);
    setAiStatus({ type: "", message: "" });
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/botsettings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ai: useExternalAI ? { provider: "external" } : { provider: "internal" },
        }),
      });
      if (res.ok) setAiStatus({ type: "success", message: "AI Engine updated!" });
      else throw new Error();
    } catch (err) {
      setAiStatus({ type: "error", message: "Update failed." });
    } finally {
      setLoadingAI(false);
    }
  };


  if (fetching) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>

  );

  return (
    <div className="bs-layout-root">
      <header className="bs-header-area">
        <h1 className="bs-main-title">Bot Settings</h1>
        <p style={{ textAlign: 'left', marginTop: '0.5rem' }}>Tailor your assistant's personality and look.</p>
      </header>

      {/* BRANDING CARD */}
      <div className="bs-config-section">
        <h3 className="bs-section-heading">Business Info</h3>

        <div className="bs-input-wrapper">
          <input
            className="bs-text-input"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business Name"
          />
        </div>

        <div className="bs-color-row">
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Color Scheme</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {primaryColor}
            </span>

            <div
              style={{
                position: 'relative',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div
                className="bs-color-preview-circle"
                style={{ backgroundColor: primaryColor, width: '100%', height: '100%' }}
              />
            </div>
          </div>

        </div>

        <button className="bs-submit-trigger" onClick={handleBrandingSave} disabled={loadingBranding}>
          {loadingBranding ? "Updating..." : "Save Info"}
        </button>
        {brandingStatus.message && (
          <span className={`bs-status-pill bs-type-${brandingStatus.type}`}>{brandingStatus.message}</span>
        )}
      </div>

      {/* AI ENGINE CARD */}
      {/* SECTION: INTELLIGENCE ENGINE */}
      <div className="bs-config-section">
        <div className="bs-section-header">
          <h3 className="bs-section-heading">Intelligence Engine</h3>
          <span className="bs-badge-info"> Control the logic and model for your chatbot</span>
        </div>

        <div className="bs-ux-selection-stack">
          {/* Option 1: Internal */}
          <div
            className={`bs-ux-card ${!useExternalAI ? 'is-selected' : ''}`}
            onClick={() => setUseExternalAI(false)}
            style={{ marginTop: '1rem' }}
          >
            <div className="bs-ux-card-content">
              <div className="bs-ux-check-wrapper">
                <div className="bs-ux-check"></div>
              </div>
              <div className="bs-ux-text">
                <div className="bs-ux-title">Use without LLM</div>
              </div>
            </div>
          </div>

          {/* Option 2: External */}
          <div
            className={`bs-ux-card ${useExternalAI ? 'is-selected' : ''}`}
            onClick={() => setUseExternalAI(true)}
          >
            <div className="bs-ux-card-content">
              <div className="bs-ux-check-wrapper">
                <div className="bs-ux-check"></div>
              </div>
              <div className="bs-ux-text">
                <div className="bs-ux-title">Use External AI (Recommended)</div>
              </div>
            </div>
          </div>


        </div>

        <div className="bs-ux-action-area">
          <button className="bs-submit-trigger" onClick={handleAIEngineSave} disabled={loadingAI}>
            {loadingAI ? "Deploying Engine..." : "Save Intelligence"}
          </button>
          {aiStatus.message && (
            <div className={`bs-ux-status bs-type-${aiStatus.type}`}>
              {aiStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotSettings;