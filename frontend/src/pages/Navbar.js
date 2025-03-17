import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/check-session",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        
        // Update authentication state
        setIsAuthenticated(data.authenticated);
        
        // Extract username directly from the response
        if (data.authenticated && data.username) {
          setUsername(data.username);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    };

    checkAuth();
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleContactSlider = () => {
    setIsContactOpen(!isContactOpen);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUsername('');
        setUserDropdownOpen(false);
        navigate('/');
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/LandingPage" className="navbar-brand">
          <img src="/LOGO.png" alt="CatchPhish" />
          <span>Catch<span className="highlight">Phish</span></span>
        </Link>

        <div className="navbar-toggle" onClick={toggleMobileMenu}>
          <span className={`toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`navbar-content ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/LandingPage" className={location.pathname === '/' || location.pathname === '/LandingPage' ? 'active' : ''} onClick={closeMenus}>Home</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenus}>About Us</Link>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMenus}>Services</Link>
            <Link to="/resources" className={location.pathname === '/resources' ? 'active' : ''} onClick={closeMenus}>Resources</Link>
            
              
            <button onClick={toggleContactSlider} className="contact-link">Contact Us</button>
          </div>
        

          <div className="auth-container">
            {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="dashboard-btn" onClick={closeMenus}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
                  </svg>
                  Dashboard
                </Link>
              <div className="user-profile" ref={userDropdownRef}>
                
                <div className="user-profile-trigger" onClick={toggleUserDropdown}>
                  <div className="user-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="username">
                    {username}
                    <svg className={`dropdown-arrow ${userDropdownOpen ? 'up' : ''}`} viewBox="0 0 24 24" width="16" height="16">
                      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                    </svg>
                  </span>
                </div>
                
                <div className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">{username}</span>
                      <span className="user-role">Member</span>
                    </div>
                  </div>
                  
                  <div className="dropdown-links">
                      <Link to="/dashboard" className="dashboard-btn" onClick={closeMenus}>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-link" onClick={closeMenus}>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                      </svg>
                      Profile
                    </Link>
                    <Link to="/settings" className="dropdown-link" onClick={closeMenus}>
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor" />
                      </svg>
                      Settings
                    </Link>
                  </div>
                  <div className="dropdown-footer">
                    <button onClick={handleLogout} className="logout-btn">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/register" className="sign-up-btn" onClick={closeMenus}>Sign Up</Link>
                <Link to="/login" className="login-btn" onClick={closeMenus}>Login</Link>
              </div>
            )}
          </div>
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

      {/* Overlay for any open menus */}
      {(isContactOpen || (mobileMenuOpen && window.innerWidth <= 768)) && 
        <div className="overlay" onClick={() => {
          setIsContactOpen(false);
          setMobileMenuOpen(false);
        }}></div>
      }
    </>
  );
}

export default Navbar;