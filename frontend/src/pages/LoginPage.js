import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import "./styles.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
            localStorage.setItem('token', data.token); // ✅ Save token
            alert('Login successful!');
            navigate('/LandingPage'); // Redirect after login
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="new">
          <img src="./LOGO.png" height={100} alt="Logo" />
        </div>
        <h1>
          <span className="highlight">Catch</span>
          Phish - Empowering you to stay safe online
        </h1>
      </div>

      <div className="login-box">
        <div className="login-form">
          <label>USER ID</label>
          <input
            type="text"
            placeholder="Enter employee user ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>PASSWORD</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="verify-link">*Click to Verify your IP Address</p>

          <button className="login-button" onClick={handleLogin}>
            LOGIN
          </button>

          <p className="forgot-password">
            New User? <span className="register-link" onClick={() => navigate("/register")}>Register Now!</span>
          </p>
        </div>

        <div className="login-logo">
          <img src="./cp.png" alt="CatchPhish Logo" />
        </div>
      </div>

      <footer>
        Copyright © CatchPhish Securities, All rights reserved
      </footer>
    </div>
  );
};

export default Login;
