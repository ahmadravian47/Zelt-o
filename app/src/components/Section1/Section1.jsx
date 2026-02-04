import React from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { Book, Network, BarChart3, Puzzle, Sparkles, ArrowRight } from 'lucide-react';
import './Section1.css';

const FeatureCard = ({ icon: Icon, title, description, isHighlighted = false }) => {
  return (
    <div className={`feature-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="icon-container">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

const Section1 = () => {
  const features = [
    {
      icon: Book,
      title: "Knowledge Base",
      description: "Turn your business information, FAQs, and product details into a smart knowledge source your chatbot understands instantly.",
    },
    {
      icon: Network,
      title: "Chat Widget",
      description: "A lightweight, customizable chatbot that embeds on your website with a single line of code.",
    },
    {
      icon: BarChart3,
      title: "Accuracy Control",
      description: "Answers are generated strictly from your business content — if the chatbot doesn’t know, it won’t guess.",
    },
    {
      icon: Puzzle,
      title: "Easy Setup",
      description: "Create, train, and deploy your chatbot in minutes. No AI configuration. No integrations to manage.",
    },
    {
      icon: Sparkles,
      title: "AI Engine",
      description: "Context-aware AI that understands visitor questions and responds clearly, consistently, and safely.",
      isHighlighted: true,
    },
  ];

  return (
    <section className="section-container">
      <div className="feature-grid">
        
        {/* Header Block */}
        <div className="header-block">
          <h2>Built on rock-solid foundations</h2>
          <p>Everything you need to answer customer questions accurately without complexity.</p>
          <Link to="/signup" className="cta-link">
            Discover our AI platform <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Cards */}
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}

      </div>
    </section>
  );
};

export default Section1;