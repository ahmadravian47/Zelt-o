import React from 'react';
import './Section2.css';

const Section2 = () => {
  return (
    <div className="wrapper">
      <div className="banner-card">
        
        {/* Chat Bubbles with staggered delays */}
        <div className="bubble-container">
          <div className="bubble bubble-left" style={{ animationDelay: '0.2s' }}>
           Why do visitors leave?
          </div>
          <div className="bubble bubble-right" style={{ animationDelay: '0.8s' }}>
           Answered already?
          </div>
          <div className="bubble bubble-left" style={{ animationDelay: '1.4s' }}>
           How many times do we repeat this?
          </div>
        </div>

        {/* Text Content */}
        <div className="content animate-text">
          <h1 className="title">
           Things get <span className='italic'>repetitive.</span> All the time.
          </h1>
          <p className="description">
          Visitors expect instant answers — even when you’re not there. Your website should help, not add work.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Section2;