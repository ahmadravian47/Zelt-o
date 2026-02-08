import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-icon">
          {/* Your SVG here */}
        </div>
        <span className="logo-text">zelt-o</span>
      </div>

      {/* Nav Links */}
      <div className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
        {navLinks.map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`} className="nav-item">
            {link}
          </a>
        ))}
      </div>

      {/* Login + Hamburger */}
      <div className="actions">
        <Link className="login-button" to='/login'>Login</Link>
        <button 
          className="hamburger" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon 
            icon={isMobileMenuOpen ? faXmark : faBars} 
            size="lg" 
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
