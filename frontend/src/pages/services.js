import React from 'react';
import './services.css';
import emailIcon from '../images/email.jpg'; // Updated path
import websiteIcon from '../images/website.png'; // Updated path
import browserIcon from '../images/browser.png'; // Updated path
import reportIcon from '../images/report.png'; // Updated path
import monitorIcon from '../images/hacker.png'; // Updated path

function Services() {
  return (
    <div className="services-container">
      <h1 className="services-title">Our Powerful Anti-Phishing Services</h1>
      <p className="services-description">
        At <span className="highlight">Catch<span className="phish">Phish</span></span>, we take phishing protection to the next level with cutting-edge technology and real-time detection.
      </p>

      <div className="service-cards">
        <div className="card">
          <img src={emailIcon} alt="Email Phishing Detection" />
          <h2>Email Phishing Detection</h2>
          <p>Analyze and detect malicious email links and attachments. Stay safe from phishing emails and protect your inbox.</p>
        </div>

        <div className="card">
          <img src={websiteIcon} alt="Website Phishing Protection" />
          <h2>Website Phishing Protection</h2>
          <p>Automatically detect and block phishing websites in real-time. Ban and report suspicious sites instantly.</p>
        </div>

        <div className="card">
          <img src={browserIcon} alt="Real-Time Browser Addon" />
          <h2>Real-Time Browser Addon</h2>
          <p>Our advanced browser extension safeguards your browsing by detecting phishing sites and alerting you instantly.</p>
        </div>

        <div className="card">
          <img src={reportIcon} alt="Comprehensive Threat Reporting" />
          <h2>Comprehensive Threat Reporting</h2>
          <p>Ban, report, and blacklist malicious sites to keep the internet safer for everyone.</p>
        </div>

        <div className="card">
          <img src={monitorIcon} alt="24/7 Threat Monitoring" />
          <h2>24/7 Threat Monitoring</h2>
          <p>Our systems constantly analyze potential phishing attacks to ensure you’re always protected.</p>
        </div>
      </div>

      <div className="addon-banner">
        <h2>CatchPhish Real-Time Addon</h2>
        <p>
          Install our powerful browser extension to get instant phishing alerts and protect your data.
          <br />One click to secure your browsing experience!
        </p>
        <button className="install-btn">Install Addon Now</button>
      </div>
    </div>
  );
}

export default Services;