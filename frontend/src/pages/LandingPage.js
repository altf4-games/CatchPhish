import Navbar from "./Navbar";
import "./LandingPage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/check-session", {
          credentials: "include"
        });
        const data = await response.json();
        console.log("Authentication status:", data);
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    };
    
    checkAuth();
  }, []);

  const handleReportSubmission = async (url, actionTaken, status) => {
    if (!isAuthenticated) {
      setError("Please log in to submit reports");
      navigate("/login");
      return;
    }

    try {
      const reportData = { url, actionTaken, status };
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // This is crucial for sending cookies
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      console.log("Report saved:", data);
      return data;
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      // Clean URL input
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'http://' + cleanUrl;
      }
  
      const response = await axios.post("http://127.0.0.1:5001/analyze", { url: cleanUrl });
      const data = response.data;
  
      console.log("API Response:", data);
  
      // Fix for OpenPhish flagged sites
      // Consider a site as phishing if either the risk score is high OR it's flagged by OpenPhish
      const isPhishing = data.risk_score >= 40 || data.openphish_flagged;
      
      // Determine status and action based on analysis
      const status = isPhishing ? "phishing" : "safe";
      const actionTaken = status === "phishing" ? "Reported as Phishing" : "Marked Safe";
  
      setResult({
        ...data,
        is_phishing: isPhishing, // Make sure to override the is_phishing property
        actionTaken,
        status
      });
  
      if (isAuthenticated) {
        try {
          const reportResult = await handleReportSubmission(
            data.domain,
            actionTaken,
            status
          );
          
          console.log("Report successfully saved:", reportResult);
        } catch (reportError) {
          console.error("Failed to save report:", reportError);
          setError("URL analyzed successfully, but failed to save report.");
        }
      }
    } catch (err) {
      setError("Error analyzing the URL. Please check the URL and try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine risk level color
  const getRiskColor = (score) => {
    if (score >= 70) return "#FF3B30"; // High risk - Red
    if (score >= 40) return "#FF9500"; // Medium risk - Orange
    if (score >= 20) return "#FFCC00"; // Low risk - Yellow
    return "#34C759"; // Very low risk - Green
  };

  return (
    <div className="daashboard">
      <div className="search-section">
        <input
          type="text"
          placeholder="Enter URL, IP Address, or domain"
          className="search-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button 
          className="analyze-btn" 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {result && (
        <div className="result-container">
          <div className="result-header">
            <h2>Analysis Results</h2>
            <div 
              className="risk-indicator" 
              style={{ 
                backgroundColor: getRiskColor(result.risk_score),
                padding: "5px 10px",
                borderRadius: "4px",
                color: result.risk_score >= 40 ? "white" : "black"
              }}
            >
              {result.is_phishing ? "⚠️ PHISHING DETECTED" : "✅ SAFE"}
              <span style={{ display: "block", fontSize: "0.8em" }}>
                Confidence: {result.confidence}
              </span>
            </div>
          </div>
          
          <div className="result-details">
            <div className="detail-item">
            <strong>Domain:</strong> <span class="domain-text">{result.domain}</span>
            </div>
            
            <div className="detail-item">
              <strong>Risk Score:</strong> 
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${result.risk_score}%`,
                    backgroundColor: getRiskColor(result.risk_score)
                  }}
                ></div>
                <span className="progress-text">{Math.round(result.risk_score)}%</span>
              </div>
            </div>
            
            {result.suspicious_indicators && result.suspicious_indicators.length > 0 && (
              <div className="detail-item">
                <strong>Suspicious Indicators:</strong>
                <ul className="indicators-list">
                  {result.suspicious_indicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="detail-item">
              <strong>Detection Summary:</strong>
              <ul>
                <li>VirusTotal: {result.virustotal.malicious_engines} of {result.virustotal.total_engines} security vendors flagged as malicious</li>
                <li>OpenPhish Database: {result.openphish_flagged ? "Detected as phishing" : "Not found in database"}</li>
                <li>Suspicious Patterns: {result.suspicious_indicators?.length || 0} detected</li>
              </ul>
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="login-prompt">
              <p>Log in to save this report and access your history</p>
              <button className="login-btn" onClick={() => navigate("/login")}>
                Log in
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LandingPage() {
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file.name);
      alert("File analysis feature coming soon!");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      console.log("Dropped file:", file.name);
      alert("File analysis feature coming soon!");
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      <main className="main-content">
        <div className="net-illustration">
          <img src="/net.png" alt="Fishing net illustration" />
        </div>
        <div className="content-center">
          <div className="main-logo">
            <img src="./LOGO.png" alt="CatchPhish" />
            <h1>Catch</h1><p>Phish</p>
          </div>
          <p className="description">
            Analyze suspicious domains, IPs and URLs to detect phishing and malicious sites automatically share them
            with the security community.
          </p>
          <Dashboard />
          <div className="upload-area" onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="upload-icon">↑</div>
            <p>Select a file or drag and drop here</p>
            <p className="file-info">JPG, PNG or PDF, file size no more than 10MB</p>
            <input
              type="file"
              id="file-upload"
              className="file-input"
              onChange={handleFileSelect}
              accept=".jpg,.png,.pdf"
            />
            <label htmlFor="file-upload" className="select-button">
              SELECT FILE
            </label>
          </div>
        </div>
        <div className="fish-illustration">
          <img src="/fish.png" alt="Fish illustration" />
        </div>
      </main>
      <div className="footer">
        <p>Copyright © CatchPhish Securities, All rights reserved</p>
      </div>
    </div>
  );
}

export default LandingPage;