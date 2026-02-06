import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/forgot-password`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            }
        );

        const data = await res.json();
        setMessage(data.message || "A reset link has been sent to the Email");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9fafb",
            }}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "32px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                    width: "100%",
                    maxWidth: "448px",
                }}
            >
                <h2
                    style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        marginBottom: "16px",
                    }}
                >
                    Reset your password
                </h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            marginBottom: "16px",
                            fontSize: "16px",
                            boxSizing: "border-box",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "16px",
                            cursor: "pointer",
                        }}
                    >
                        Send reset link
                    </button>
                </form>

                {message && (
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#4b5563",
                            marginTop: "16px",
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
