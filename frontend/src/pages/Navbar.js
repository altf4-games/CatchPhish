import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const toggleContactSlider = () => {
    setIsContactOpen(!isContactOpen);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/about" className="navbar-brand">
          <img src="/LOGO.png" alt="CatchPhish" />
          <span>Catch<span className="highlight">Phish</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/LandingPage" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
          <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
          <Link to="/resources" className={location.pathname === '/resources' ? 'active' : ''}>Resources</Link>
          <button onClick={toggleContactSlider} className="contact-link">Contact Us</button>
        </div>

        <div className="auth-links">
          <Link to="/signup" className="sign-up">Sign Up</Link>
          <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
        </div>
      </nav>

      {/* Contact Slider */}
      <div className={`contact-slider ${isContactOpen ? 'open' : ''}`}>
        <div className="contact-header">
          <div className="header-content">
            <img src="/hacker.png" alt="Hacker" className="header-image" />
            <h2>Contact Our Cyber Squad</h2>
          </div>
          <button onClick={toggleContactSlider} className="close-btn">&times;</button>
        </div>
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input type="text" id="firstName" name="firstName" required />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input type="text" id="lastName" name="lastName" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input type="text" id="company" name="company" />
          </div>
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input type="text" id="position" name="position" />
          </div>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>

      {/* Overlay */}
      {isContactOpen && <div className="overlay" onClick={toggleContactSlider}></div>}
    </>
  );
}

export default Navbar;