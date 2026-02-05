import React, { useState, useEffect } from "react";
import "./Faqs.css";

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/faqs`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setFaqs(data.faqs || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFaqs();
  }, []);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs([data.faq, ...faqs]); // Add new one to the top
        setNewQuestion(""); setNewAnswer("");
        setSuccessMsg("Added!");
        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/faqs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if ((await res.json()).success) {
        setFaqs(faqs.filter((f) => f._id !== id));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="faq-page">
      <div className="faq-upper">
        <h1>Knowledge Base</h1>
        <p>Manage your store's frequently asked questions in one place.</p>
      </div>

      <div className="faq-grid">
        {/* The "Add New" Card is always first */}
        <div className="faq-card add-card">
          <h3>Create New FAQ</h3>
          <form onSubmit={handleAddFaq}>
            <input
              placeholder="Question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
            />
            <textarea
              placeholder="Answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              required
            />
            <button type="submit">{successMsg || "Add FAQ"}</button>
          </form>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq._id} className="faq-card display-card">
              <div className="card-content">
                <span className="q-badge">Q</span>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
              <button className="card-delete" onClick={() => handleDelete(faq._id)}>
                <i class="fa-regular fa-trash-can"></i>
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Faqs;