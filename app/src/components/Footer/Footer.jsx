import React from 'react';
import './Footer.css';
// You can use lucide-react or any SVG library for the icons
import { Twitter, Linkedin, Facebook, Youtube, Slack, Flame } from 'lucide-react';

const Footer = () => {
  const sections = [
    {
      title: "Product",
      links: ["On-call", "Incident Response", "Status Pages", "AI", "Changelog"],
    },
    {
      title: "Learn",
      links: ["Blog", "Customer Stories", "Help Center", "Alternatives", "Community"],
    },
    {
      title: "Company",
      links: ["Legal", "Privacy Choices", "Security and Compliance", "Careers", "Status"],
    },
  ];

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        
        {/* Brand/Social Section */}
        <div className="brand-column">
          <div className="logo-box">
            <Flame size={24} color="white" fill="white" />
          </div>
          
          <div className="social-icons">
            <Linkedin size={20} />
            <span className="x-icon">𝕏</span>
            <Facebook size={20} />
            <Youtube size={20} />
            <Slack size={20} />
          </div>

          <div className="copyright">
            <p>© 2026 Zelt-o.</p>
            <p>All rights reserved.</p>
          </div>
        </div>

        {/* Links Sections */}
        <div className="links-grid">
          {sections.map((section, idx) => (
            <div key={idx} className="link-column">
              <h3 className="column-title">{section.title}</h3>
              <ul className="link-list">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
};

export default Footer;