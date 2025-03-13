import React from 'react';
import './about.css';
import Navbar from './Navbar'; // Import the Navbar component

const AboutUs = () => {
    return (
        <div className="about-container">
            <Navbar /> {/* Include the Navbar */}
            <div className="about-header">
                <h1 className="about-title">About CatchPhish</h1>
                <p className="about-subtitle">
                    Your AI-powered Phishing Detection and Reporting Solution
                </p>
            </div>
            <div className="about-content">
                <p className="about-text">
                    CatchPhish is an advanced AI-powered platform designed to detect and report phishing websites and malicious URLs. Our cutting-edge technology scans suspicious links and generates detailed reports to help users stay safe from phishing threats.
                </p>
                <p className="about-text">
                    Our platform is equipped with powerful AI models that analyze domains, IPs, and URLs to identify potential phishing attempts. With integration into various threat intelligence sources and APIs, CatchPhish ensures high accuracy and minimal false positives.
                </p>
                <p className="about-text">
                    Once identified, phishing reports are shared with CERTs (Computer Emergency Response Teams), government authorities, and ISPs to take necessary actions. By collaborating with global cybersecurity experts, CatchPhish contributes to making the internet a safer place.
                </p>
            </div>
            <div className="about-stats">
                <div className="stat-item">
                    <h2 className="stat-number">10K+</h2>
                    <p className="stat-text">Phishing Attacks Prevented</p>
                </div>
                <div className="stat-item">
                    <h2 className="stat-number">50+</h2>
                    <p className="stat-text">CERTs and ISPs Partnered</p>
                </div>
                <div className="stat-item">
                    <h2 className="stat-number">24/7</h2>
                    <p className="stat-text">Real-Time Threat Monitoring</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;