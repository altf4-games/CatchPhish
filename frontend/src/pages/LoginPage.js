import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import Navbar from "./Navbar";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Added missing state variable
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/LandingPage');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("Connection error. Please try again.");
    }
  };

  return (
    <> 
    <Navbar></Navbar>
    <div className="login-container">


      <main className="main-content">
        <div className="login-card">
          <div className="login-form-container">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Log in to your account</p>
            
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">USER ID</label>
                <div className="input-group">
                  <i className="icon user-icon"></i>
                  <input
                    id="username"
                    type="text"
                    placeholder="   Enter employee user ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">PASSWORD</label>
                <div className="input-group">
                  <i className="icon lock-icon"></i>
                  <input
                    id="password"
                    type="password"
                    placeholder="    Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="security-verify">
                <i className="icon shield-icon"></i>
                <span className="verify-text">Click to verify your IP address for enhanced security</span>
              </div>

              {message && <div className="message-alert">{message}</div>}

              <button type="submit" className="login-button">
                LOGIN
              </button>

              <div className="account-options">
                <span className="new-user-text">
                  New User? <span className="register-link" onClick={() => navigate("/register")}>Register Now!</span>
                </span>
                <span className="forgot-password" onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </span>
              </div>
            </form>
          </div>

          <div className="brand-showcase">
            <div className="brand-content">
              <img src="./cp.png" alt="CatchPhish Logo" className="showcase-image" />
              <div className="feature-highlights">
                <div className="feature-item">
                  <i className="feature-icon shield-check"></i>
                  <span>Advanced Phishing Protection</span>
                </div>
                <div className="feature-item">
                  <i className="feature-icon education"></i>
                  <span>Security Awareness Training</span>
                </div>
                <div className="feature-item">
                  <i className="feature-icon report"></i>
                  <span>Threat Intelligence Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <p className="copyright">Copyright © 2025 CatchPhish Securities, All rights reserved</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
    </> 
  );
};

export default Login;