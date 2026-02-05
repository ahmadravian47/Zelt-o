import React, { useEffect, useState } from "react";
import "./Description.css";

const Description = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/description`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDescription(data.businessDescription);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!description.trim()) {
      setMessage("Description cannot be empty");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          businessDescription: description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Description saved successfully");
      } else {
        setMessage("Failed to save description");
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader-container">
    <div className="loader"></div>
  </div>;

  return (
    <div className="desc-container">
      <h2 className="desc-title">Business Description</h2>
      <p className="desc-subtitle">
        Tell your chatbot what your business does. This helps it answer questions accurately.
      </p>

      <textarea
        className="desc-textarea"
        placeholder="Example: We sell premium dry fruits, healthy snacks, and gift boxes across India..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {message && <p className="desc-message">{message}</p>}

      <button
        className="desc-save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Description"}
      </button>
    </div>
  );
};

export default Description;
