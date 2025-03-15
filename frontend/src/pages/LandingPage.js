import Navbar from "./Navbar";
import "./LandingPage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // Ensure jsPDF is installed

function Dashboard() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [certInReportStatus, setCertInReportStatus] = useState(null);
  const [certInReportLoading, setCertInReportLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleDownloadJSON = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.domain}_report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text(`Domain: ${result.domain}`, 10, y);
    y += 10;
    doc.text(`Risk Score: ${result.risk_score}`, 10, y);
    y += 10;
    doc.text(`Status: ${result.status}`, 10, y);
    y += 10;
    doc.text(`Action Taken: ${result.actionTaken}`, 10, y);
    y += 10;
    doc.text("Detection Summary:", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(
      `- VirusTotal: ${result.virustotal.malicious_engines} of ${result.virustotal.total_engines} vendors flagged as malicious`,
      10,
      y
    );
    y += 10;
    doc.text(
      `- OpenPhish: ${
        result.openphish_flagged
          ? "Detected as phishing"
          : "Not found in database"
      }`,
      10,
      y
    );
    y += 10;
    doc.text(
      `- Suspicious Patterns: ${
        result.suspicious_indicators?.length || 0
      } detected`,
      10,
      y
    );
    y += 10;
    doc.text(
      `- Gemini Risk Score: ${result.gemini_analysis.risk_score}`,
      10,
      y
    );
    y += 10;
    doc.text(`- ML Prediction: ${result.ml_prediction}% chance`, 10, y);
    y += 10;
    if (result.whois_data && result.whois_data.registrar) {
      const registrar =
        typeof result.whois_data.registrar === "object"
          ? result.whois_data.registrar.name
          : result.whois_data.registrar;
      doc.text(`Registrar: ${registrar}`, 10, y);
      y += 10;
    }
    if (result.screenshot) {
      doc.text(
        `Screenshot URL: http://127.0.0.1:5001${result.screenshot}`,
        10,
        y
      );
      y += 10;
    }
    doc.save(`${result.domain}_report.pdf`);
  };

  const handleAnalyze = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send the URL exactly as entered (only trimmed)
      let cleanUrl = url.trim();

      const response = await axios.post("http://127.0.0.1:5001/analyze", {
        url: cleanUrl,
      });
      const data = response.data;

      console.log("API Response:", data);

      // **Weighted Phishing Detection Calculation**
      // Adjusted weights:
      // VirusTotal: weight factor = 30,
      // OpenPhish: +20 if flagged,
      // Gemini: risk_score * 10,
      // ML Prediction: value * 0.3,
      // Suspicious Patterns: 5 points per indicator.
      const vtScore =
        (data.virustotal.malicious_engines /
          Math.max(1, data.virustotal.total_engines)) *
        30;
      const openPhishScore = data.openphish_flagged ? 20 : 0;
      const geminiScore = data.gemini_analysis.risk_score * 10;
      const mlScore = data.ml_prediction * 0.3;
      const suspiciousScore = (data.suspicious_indicators?.length || 0) * 5;
      const riskScore =
        vtScore + openPhishScore + geminiScore + mlScore + suspiciousScore;

      // **Phishing threshold increased to 60**
      const isPhishing = riskScore >= 60;

      // Determine status and action based on analysis
      const status = isPhishing ? "phishing" : "safe";
      const actionTaken = isPhishing ? "Reported as Phishing" : "Marked Safe";

      setResult({
        ...data,
        risk_score: riskScore.toFixed(2),
        is_phishing: isPhishing, // Override backend value if any
        actionTaken,
        status,
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

  // Function to handle CERT-In report generation and submission
  const handleCertInReport = async () => {
    if (!result) return;

    setCertInReportLoading(true);
    setCertInReportStatus(null);

    try {
      // Save the analysis result to a JSON file that can be processed by the CERT-In report generator
      const jsonData = JSON.stringify(result);
      
      // Send the data to the backend for CERT-In report processing
      const response = await axios.post("http://127.0.0.1:5001/generate-certin-report", {
        reportData: jsonData,
      });

      if (response.data.success) {
        setCertInReportStatus({
          success: true,
          message: "CERT-In report successfully generated and sent."
        });
      } else {
        setCertInReportStatus({
          success: false,
          message: response.data.message || "Failed to generate CERT-In report."
        });
      }
    } catch (err) {
      console.error("Error generating CERT-In report:", err);
      setCertInReportStatus({
        success: false,
        message: "Error generating CERT-In report. Please try again later."
      });
    } finally {
      setCertInReportLoading(false);
    }
  };

  // Function to determine risk level color
  const getRiskColor = (score) => {
    if (score >= 70) return "#FF3B30"; // High risk - Red
    if (score >= 40) return "#FF9500"; // Medium risk - Orange
    if (score >= 20) return "#FFCC00"; // Low risk - Yellow
    return "#34C759"; // Very low risk - Green
  };

  // Function to determine if the risk score meets the CERT-In reporting threshold

  return (
    <div className="daashboard">
      <div className="search-section">
        <input
          type="text"
          placeholder="Enter URL, IP Address, or domain"
          className="search-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <p className="error-message" style={{ color: "red" }}>
          {error}
        </p>
      )}

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
                color: result.risk_score >= 40 ? "white" : "black",
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
              <strong>Domain:</strong>{" "}
              <span className="domain-text">{result.domain}</span>
            </div>

            <div className="detail-item">
              <strong>Risk Score:</strong>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${result.risk_score}%`,
                    backgroundColor: getRiskColor(result.risk_score),
                  }}
                ></div>
                <span className="progress-text">
                  {Math.round(result.risk_score)}%
                </span>
              </div>
            </div>

            {result.suspicious_indicators &&
              result.suspicious_indicators.length > 0 && (
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
                <li>
                  VirusTotal: {result.virustotal.malicious_engines} of{" "}
                  {result.virustotal.total_engines} vendors flagged as malicious
                </li>
                <li>
                  OpenPhish:{" "}
                  {result.openphish_flagged
                    ? "Detected as phishing"
                    : "Not found in database"}
                </li>
                <li>
                  Suspicious Patterns:{" "}
                  {result.suspicious_indicators?.length || 0} detected
                </li>
                <li>Gemini Risk Score: {result.gemini_analysis.risk_score}</li>
                <li>ML Prediction: {result.ml_prediction}% chance</li>
              </ul>
            </div>

            {result.whois_data && result.whois_data.registrar && (
              <div className="detail-item text-black">
                <strong>Registrar:</strong>{" "}
                <strong>
                  {typeof result.whois_data.registrar === "object"
                    ? result.whois_data.registrar.name
                    : result.whois_data.registrar}
                </strong>
              </div>
            )}

            {result.screenshot && (
              <div className="detail-item">
                <strong>Screenshot:</strong>
                <img
                  src={`http://127.0.0.1:5001${result.screenshot}`}
                  alt="Website Screenshot"
                  style={{ width: "100px" }}
                />
              </div>
            )}
          </div>

          <div className="download-buttons" style={{ marginTop: "1rem" }}>
            <button onClick={handleDownloadJSON}>
              Download Report as JSON
            </button>
            <button onClick={handleDownloadPDF}>Download Report as PDF</button>
            
            {/* CERT-In Report Button - Only show if risk score meets threshold */}
            <button 
  onClick={handleCertInReport} 
  disabled={certInReportLoading}
  className="certin-report-btn"
  style={{ 
    backgroundColor: "#D32F2F", 
    color: "white",
    fontWeight: "bold",
    marginLeft: "10px"
  }}
>
  {certInReportLoading ? "Sending..." : "Send CERT-In Report"}
</button>
          </div>

          {/* CERT-In Report Status Message */}
          {certInReportStatus && (
            <div 
              className="certin-status"
              style={{ 
                marginTop: "10px", 
                padding: "10px", 
                borderRadius: "4px",
                backgroundColor: certInReportStatus.success ? "#DFF2BF" : "#FFBABA",
                color: certInReportStatus.success ? "#4F8A10" : "#D8000C"
              }}
            >
              {certInReportStatus.message}
            </div>
          )}

{!isAuthenticated && (
  <div className="login-prompt">
    <p>Log in to save this report and access your history</p>
    <button className="login-btn" onClick={() => navigate("/login")}>
      Log in
    </button>
  </div>
)}
          
          {/* Additional information about CERT-In reporting */}
          { (
            <div className="certin-info" style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>About CERT-In Reporting</h4>
            <p style={{ fontSize: "0.9em", margin: "0" }}>
              The CERT-In (Indian Computer Emergency Response Team) report is an official format for reporting cybersecurity incidents to the Indian government.
              When you click "Send CERT-In Report", our system generates a detailed report in the required format and sends it to CERT-In for review and action.
            </p>
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
            <h1>Catch</h1>
            <p>Phish</p>
          </div>
          <p className="description">
            Analyze suspicious domains, IPs and URLs to detect phishing and
            malicious sites automatically share them with the security
            community.
          </p>
          <Dashboard />
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-icon">↑</div>
            <p>Select a file or drag and drop here</p>
            <p className="file-info">
              JPG, PNG or PDF, file size no more than 10MB
            </p>
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