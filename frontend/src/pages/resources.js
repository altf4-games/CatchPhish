import React from 'react';
import './resources.css';

function Resources() {
  return (
    <div className="resources-container">
      <h1 className="resources-title">CatchPhish Resources</h1>
      <p className="resources-description">
        Your ultimate hub for staying safe online and combating phishing attacks. Access cutting-edge tools, insightful articles, guides, and more to master phishing detection and prevention.
      </p>

      <div className="resources-grid">
        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Phishing Awareness" />
          <h2>Phishing Awareness Guide</h2>
          <p>Learn how to recognize phishing attempts and protect your data with our comprehensive guide.</p>
          <a href="https://www.phishing.org/what-is-phishing" target="_blank" rel="noopener noreferrer" className="resource-btn">Read More</a>
        </div>

        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Browser Addons" />
          <h2>Browser Security Add-ons</h2>
          <p>Enhance your browsing experience with powerful security add-ons that block malicious sites.</p>
          <a href="https://addons.mozilla.org/en-US/firefox/tag/security" target="_blank" rel="noopener noreferrer" className="resource-btn">Explore Add-ons</a>
        </div>

        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Open-Source Tools" />
          <h2>Open-Source Phishing Detection</h2>
          <p>Discover community-driven tools and techniques to enhance phishing defense strategies.</p>
          <a href="https://github.com/topics/phishing" target="_blank" rel="noopener noreferrer" className="resource-btn">Explore GitHub</a>
        </div>

        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Real-Time Threat Feeds" />
          <h2>Real-Time Threat Feeds</h2>
          <p>Stay updated on emerging threats and real-time phishing attacks from across the globe.</p>
          <a href="https://threatfeeds.io/" target="_blank" rel="noopener noreferrer" className="resource-btn">View Threat Feeds</a>
        </div>

        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Phishing Simulation" />
          <h2>Phishing Simulation Tools</h2>
          <p>Test your organization’s readiness with realistic phishing simulation software.</p>
          <a href="https://www.phishingbox.com/" target="_blank" rel="noopener noreferrer" className="resource-btn">Start Simulating</a>
        </div>

        <div className="resource-card">
          <img src="https://via.placeholder.com/300x200" alt="Security Articles" />
          <h2>Expert Security Articles</h2>
          <p>Read in-depth articles from cybersecurity experts to stay ahead of phishing tactics.</p>
          <a href="https://www.kaspersky.com/blog/" target="_blank" rel="noopener noreferrer" className="resource-btn">Read Articles</a>
        </div>
      </div>
    </div>
  );
}

export default Resources;
