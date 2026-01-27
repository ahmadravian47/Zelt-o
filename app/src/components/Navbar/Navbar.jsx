import React from 'react';
import {Link} from 'react-router-dom'
import './Navbar.css';

const Navbar = () => {

  const navLinks = [
    'Products',
    'Solutions',
    'Resources',
    'Customers',
    'Pricing',
    'Careers',
  ];

  return (
    <nav className="navbar">
      {/* Left: Logo Section */}
      <div className="logo-container">
        <div className="logo-icon">
          <svg 
            viewBox="0 0 24 24" 
            width="18" 
            height="18" 
            fill="white"
          >
            <path d="M12 2c0 1.88-1.52 3.4-3.4 3.4C6.72 5.4 5.2 6.92 5.2 8.8c0 1.88 1.52 3.4 3.4 3.4 1.88 0 3.4-1.52 3.4-3.4 0-1.88 1.52-3.4 3.4-3.4 1.88 0 3.4 1.52 3.4 3.4 0 1.88-1.52 3.4-3.4 3.4-1.88 0-3.4 1.52-3.4 3.4 0 1.88 1.52 3.4 3.4 3.4s3.4-1.52 3.4-3.4" />
            <path d="M17.55 11.13c-.46-1.6-1.07-3.11-1.83-4.52-1.24-2.28-2.96-4.22-4.9-5.61a.5.5 0 00-.73.55c.21 1.29.07 2.58-.41 3.75-.48 1.17-1.3 2.14-2.35 2.76a.5.5 0 00-.25.43c0 2.4 1.35 4.54 3.44 5.66.42.22.69.66.69 1.14v.1c0 1.3.73 2.47 1.89 3.03l.23.11c.96.47 2.09.24 2.81-.56.9-.99 1.51-2.25 1.76-3.64.25-1.4.13-2.8-.35-4.1z" fill="#fff"/>
          </svg>
        </div>
        <span className="logo-text">zelt-o</span>
      </div>

      {/* Center: Navigation Links */}
      <div className="nav-links">
        {navLinks.map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`} className="nav-item">
            {link}
          </a>
        ))}
      </div>

      {/* Right: Login Button */}
      <div className="actions">
        <Link className="login-button" to='/login'>Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;