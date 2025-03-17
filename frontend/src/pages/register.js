import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import Navbar from "./Navbar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email
        }),
      });

      const data = await response.json();
      console.log("Register response:", data);

      if (response.ok) {
        setMessage("User registered successfully!");
        alert("User registered successfully!");
        navigate("/login");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("Registration error. Please try again.");
    }
  };

  return (
    <>

      <div className="login-container">
        <main className="main-content">
          <div className="login-card">
            <div className="login-form-container">
              <h2>Create Account</h2>
              <p className="login-subtitle">Join CatchPhish today</p>
              
              <form className="login-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="username">USER ID</label>
                  <div className="input-group">
                    <i className="icon user-icon"></i>
                    <input
                      id="username"
                      type="text"
                      placeholder="    Enter employee user ID"
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
                      placeholder="   Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                  <div className="input-group">
                    <i className="icon lock-icon"></i>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="   Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="security-verify">
                  <i className="icon shield-icon"></i>
                  <span className="verify-text">Click to verify your identity for enhanced security</span>
                </div>

                {message && <div className="message-alert">{message}</div>}

                <button type="submit" className="login-button">
                  REGISTER
                </button>

                <div className="account-options">
                  <span className="new-user-text">
                    Already have an account? <span className="register-link" onClick={() => navigate("/login")}>Login</span>
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

export default Register;