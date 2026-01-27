import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import google_icon from './search.png';

import './Login.css';

const Login = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const csrfRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/csrf-token`, {
            credentials: "include"
        });
        const { csrfToken } = await csrfRes.json();

        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/login`, {
            method: "POST",
            credentials: "include",
            headers:
            {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify({ email:emailOrPhone, password }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
            navigate("/dashboard");
        } else {
            alert(data.error || "Login failed");
        }
    };

    const handleGoogleLogin = () => {
        window.open(`${import.meta.env.VITE_SERVER_URL}/auth/google`, "_self");
    };

    return (
        <div className="login-parent">

            <div className="login-card">
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}  onClick={() => navigate("/")}>
                    <div className="logo-icon">
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="white"
                        >
                            <path d="M12 2c0 1.88-1.52 3.4-3.4 3.4C6.72 5.4 5.2 6.92 5.2 8.8c0 1.88 1.52 3.4 3.4 3.4 1.88 0 3.4-1.52 3.4-3.4 0-1.88 1.52-3.4 3.4-3.4 1.88 0 3.4 1.52 3.4 3.4 0 1.88-1.52 3.4-3.4 3.4-1.88 0-3.4 1.52-3.4 3.4 0 1.88 1.52 3.4 3.4 3.4s3.4-1.52 3.4-3.4" />
                            <path d="M17.55 11.13c-.46-1.6-1.07-3.11-1.83-4.52-1.24-2.28-2.96-4.22-4.9-5.61a.5.5 0 00-.73.55c.21 1.29.07 2.58-.41 3.75-.48 1.17-1.3 2.14-2.35 2.76a.5.5 0 00-.25.43c0 2.4 1.35 4.54 3.44 5.66.42.22.69.66.69 1.14v.1c0 1.3.73 2.47 1.89 3.03l.23.11c.96.47 2.09.24 2.81-.56.9-.99 1.51-2.25 1.76-3.64.25-1.4.13-2.8-.35-4.1z" fill="#fff" />
                        </svg>
                    </div>
                    <span className="logo-text">zelt-o</span>
                </div>
                <p className="login-subtitle">
                    Enter your credentials here
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="input-group">
                        <Mail className="input-icon" />
                        <input
                            type="text"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            placeholder="Email address"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <Lock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            className="eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <p className="terms">
                        By logging in, you consent to Zelt-o{" "}
                        <a href="#">Terms of Service</a> and{" "}
                        <a href="#">Privacy Policy</a>.
                    </p>

                    <button type="submit" className="login-btn">
                        Log in
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button onClick={handleGoogleLogin} className="google-btn">
                    <img src={google_icon} alt="Google" />
                    <span>Continue With Google</span>
                </button>

                <p className="signup-text">
                    New to Zelt-o?
                    <Link to="/signup"> Join us</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
