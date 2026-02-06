import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();

        const res = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/reset-password`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            }
        );

        if (res.ok) {
            alert("Password updated");
            navigate("/login");
        } else {
            alert("Invalid or expired link");
        }
    };

    return (
        <form
            onSubmit={submit}
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
            }}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "32px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    width: "384px",
                }}
            >
                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "16px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
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
                        borderRadius: "4px",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                >
                    Reset password
                </button>
            </div>
        </form>
    );
}
