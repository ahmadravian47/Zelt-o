import React from 'react';
import { useNavigate, Link } from 'react-router-dom'
import './Section3.css';

const Section3 = () => {
    const points = [
        "Turn your business info into a smart chatbot",
        "Deploy on your website with one line of code",
        "See fewer repetitive questions",
        "Safe, accurate answers — no risky automations"
    ];

    const avatars = [
        "https://i.pravatar.cc/100?u=1",
        "https://i.pravatar.cc/100?u=2",
        "https://i.pravatar.cc/100?u=3",
        "https://i.pravatar.cc/100?u=4"
    ];

    return (
        <section className="ims-section-wrapper">
            {/* Top Header */}
            <header className="ims-hero-header">
                <h1 className="ims-primary-heading">So good, you’ll stop <br className='section3-h-sep'/>answering same questions</h1>
                <p className="ims-lead-text">
                    Ready to let your website handle customer questions for you?
                    Create your chatbot in minutes and see it in action.
                </p>
            </header>

            {/* Main Card */}
            <div className="ims-content-card">

                {/* Left Side: UI Mockup */}
                <div className="ims-viz-pane">
                    <div className="ims-mockup-window">
                        <div className="ims-window-bar">
                            <span className="ims-home-icon">🏠</span>
                            <span className="ims-window-label">Dashboard</span>
                        </div>

                        <div className="ims-window-body">
                            <div className="ims-data-section">
                                <p className="ims-section-tag">VISITOR QUESTIONS <small>· last 4 weeks</small></p>
                                <div className="ims-stats-row">
                                    <div className="ims-stat-item ims-success-bg">
                                        <span>Questions answered</span>
                                        <strong>+42%</strong>
                                    </div>
                                    <div className="ims-stat-item ims-success-bg">
                                        <span>Time spent replying</span>
                                        <strong>-31%</strong>
                                    </div>
                                    <div className="ims-stat-item ims-danger-bg">
                                        <span>Missed questions</span>
                                        <strong>-14%</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="ims-active-section">
                                <p className="ims-section-tag">ACTIVE CHATS<span>12</span></p>
                                <div className="ims-status-row">
                                    <div className="ims-status-pill"><div className="ims-dot ims-blue"></div> Product</div>
                                    <div className="ims-status-pill"><div className="ims-dot ims-red"></div> Pricing</div>
                                    <div className="ims-status-pill"><div className="ims-dot ims-orange"></div> Policies</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Text & CTA */}
                <div className="ims-text-pane">
                    <h2 className="ims-info-heading">We’d love to show you how it works</h2>
                    <ul className="ims-feature-list">
                        {points.map((point, i) => (
                            <li key={i}>
                                <span className="ims-check-mark">✓</span>
                                {point}
                            </li>
                        ))}
                    </ul>

                    <div className="ims-footer-cta">
                        <Link to='/signup' className="ims-cta-btn">Get a demo</Link>
                        <div className="ims-avatar-stack">
                            {avatars.map((url, i) => (
                                <img key={i} src={url} alt="Expert" className="ims-expert-photo" />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Section3;