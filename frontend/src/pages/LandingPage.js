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
  const [certInReportStatus, setCertInReportStatus] = useState(null);
  const [certInReportLoading, setCertInReportLoading] = useState(false);
  const [fuzzyResults, setFuzzyResults] = useState([]);
  const [fuzzyLoading, setFuzzyLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileAnalysisLoading, setFileAnalysisLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

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

  const handleReportSubmission = async (domain, actionTaken, status) => {
    if (!isAuthenticated) {
      setError("Please log in to submit reports");
      navigate("/login");
      return;
    }
    try {
      const reportData = { url: domain, actionTaken, status };
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleFileAnalyze = async (file) => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("File must be JPG, PNG, or PDF.");
      return;
    }

    setFileAnalysisLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "http://localhost:5001/api/phishing/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      console.log("Image Analysis API Response:", data);

      const analysisResult = data.analysis;
      const extractedData = data.extracted_data;

      let phishingScore = 0;
      let isPhishing = false;
      let statusVal = "safe";
      let actionTaken = "Marked Safe";

      if (!analysisResult.error) {
        phishingScore = analysisResult.phishing_score * 100;
        isPhishing = phishingScore >= 60;
        statusVal = isPhishing ? "phishing" : "safe";
        actionTaken = isPhishing ? "Reported as Phishing" : "Marked Safe";
      }

      setResult({
        type: "image",
        domain: file.name,
        risk_score: phishingScore.toFixed(2),
        is_phishing: isPhishing,
        actionTaken,
        status: statusVal,
        confidence: `${phishingScore.toFixed(2)}%`,
        suspicious_indicators: analysisResult.suspicious_elements || [],
        legitimate_indicators: analysisResult.legitimate_elements || [],
        extracted_text: extractedData.text || "",
        detected_logos: extractedData.logos || [],
        detected_labels: extractedData.labels || [],
        overall_assessment: analysisResult.overall_assessment || "",
        risk_level: analysisResult.risk_level || "Unknown",
        image_name: file.name,
      });

      if (isAuthenticated) {
        try {
          const reportResult = await handleReportSubmission(
            file.name,
            actionTaken,
            statusVal
          );
          console.log("Report successfully saved:", reportResult);
        } catch (reportError) {
          console.error("Failed to save report:", reportError);
          setError("Image analyzed successfully, but failed to save report.");
        }
      }
    } catch (err) {
      setError("Error analyzing the image. Please try again.");
      console.error("Error:", err);
    } finally {
      setFileAnalysisLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${result.domain || "phishing"}_report.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/generate-pdf",
        result,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `${result.domain || "phishing"}_report.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error generating PDF.");
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
      const cleanUrl = url.trim();
      const response = await axios.post("http://127.0.0.1:5001/analyze", {
        url: cleanUrl,
      });
      const data = response.data;
      console.log("API Response:", data);

      const vtScore =
        (data.virustotal.malicious_engines /
          Math.max(1, data.virustotal.total_engines)) *
        40;
      const geminiScore = data.gemini_analysis.risk_score * 40;
      const mlScore = data.ml_prediction * 0.4;
      const openPhishScore = data.openphish_flagged ? 10 : 0;
      const suspiciousScore = (data.suspicious_indicators?.length || 0) * 1;

      const riskScore =
        vtScore + geminiScore + mlScore + openPhishScore + suspiciousScore;
      const isPhishing = riskScore >= 60;
      const statusVal = isPhishing ? "phishing" : "safe";
      const actionTaken = isPhishing ? "Reported as Phishing" : "Marked Safe";

      setResult({
        type: "url",
        ...data,
        risk_score: riskScore.toFixed(2),
        is_phishing: isPhishing,
        actionTaken,
        status: statusVal,
      });

      setFuzzyLoading(true);
      try {
        const fuzzyResponse = await axios.post(
          "http://127.0.0.1:5001/fuzzy-search",
          { domain: url }
        );
        const fuzzyData = fuzzyResponse.data;
        console.log("Fuzzy Search Results:", fuzzyData);
        setFuzzyResults(fuzzyData.matches);
      } catch (fuzzyErr) {
        console.error("Fuzzy search error:", fuzzyErr);
      } finally {
        setFuzzyLoading(false);
      }

      if (isAuthenticated) {
        try {
          const reportResult = await handleReportSubmission(
            data.domain,
            actionTaken,
            statusVal
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
      handleFileAnalyze(file);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("Dropped file:", file.name);
      handleFileAnalyze(file);
    }
  };

  const handleCertInReport = async () => {
    if (!result) return;
    setCertInReportLoading(true);
    setCertInReportStatus(null);
    try {
      const userResponse = await fetch("http://localhost:5000/api/users/me", {
        method: "GET",
        credentials: "include",
      });
      const userData = await userResponse.json();
      const username = userData.username;
      const jsonData = JSON.stringify(result);
      const response = await axios.post(
        "http://127.0.0.1:5001/generate-certin-report",
        {
          reportData: jsonData,
          username: username,
        }
      );
      if (response.data.success) {
        setCertInReportStatus({
          success: true,
          message: "CERT-In report successfully generated and sent.",
        });
      } else {
        setCertInReportStatus({
          success: false,
          message:
            response.data.message || "Failed to generate CERT-In report.",
        });
      }
    } catch (err) {
      console.error("Error generating CERT-In report:", err);
      setCertInReportStatus({
        success: false,
        message: "Error generating CERT-In report. Please try again later.",
      });
    } finally {
      setCertInReportLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "#FF3B30";
    if (score >= 40) return "#FF9500";
    if (score >= 20) return "#FFCC00";
    return "#34C759";
  };

  return (
    <div className="dashboard">
      <div className="analysis-container">
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

        <div
          className={`upload-area ${dragActive ? "active-drag" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileAnalysisLoading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing image...</p>
            </div>
          ) : (
            <>
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
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <label htmlFor="file-upload" className="select-button">
                SELECT FILE
              </label>
            </>
          )}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {result && result.type === "url" && (
        <div className="result-container">
          <div className="result-header">
            <h2>Analysis Results</h2>
            <div
              className="risk-indicator"
              style={{ backgroundColor: getRiskColor(result.risk_score) }}
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
                {result.virustotal && (
                  <li>
                    VirusTotal: {result.virustotal.malicious_engines} of{" "}
                    {result.virustotal.total_engines} vendors flagged as
                    malicious
                  </li>
                )}
                {result.openphish_flagged !== undefined && (
                  <li>
                    OpenPhish:{" "}
                    {result.openphish_flagged
                      ? "Detected as phishing"
                      : "Not found in database"}
                  </li>
                )}
                <li>
                  Suspicious Patterns:{" "}
                  {result.suspicious_indicators?.length || 0} detected
                </li>
                {result.gemini_analysis && (
                  <li>
                    Gemini Risk Score: {result.gemini_analysis.risk_score}
                  </li>
                )}
                {result.ml_prediction !== undefined && (
                  <li>ML Prediction: {result.ml_prediction}% chance</li>
                )}
              </ul>
            </div>

            {result.whois_data && result.whois_data.registrar && (
              <div className="detail-item">
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

          <div className="download-buttons">
            <button onClick={handleDownloadJSON}>
              Download Report as JSON
            </button>
            <button onClick={handleDownloadPDF}>Download Report as PDF</button>
            <button
              onClick={handleCertInReport}
              disabled={certInReportLoading}
              className="certin-report-btn"
            >
              {certInReportLoading ? "Sending..." : "Send CERT-In Report"}
            </button>
          </div>

          {!isAuthenticated && (
            <div className="login-prompt">
              <p>Log in to save this report and access your history</p>
              <button className="login-btn" onClick={() => navigate("/login")}>
                Log in
              </button>
            </div>
          )}

          {fuzzyLoading && (
            <div className="fuzzy-loading">
              <div className="loading-bar"></div>
            </div>
          )}

          {fuzzyResults.length > 0 && (
            <div className="fuzzy-panel">
              <h3>
                Fuzzy Search Results (Today: {new Date().toLocaleDateString()})
              </h3>
              <ul>
                {fuzzyResults.map((match, index) => (
                  <li key={index}>
                    {match[0]} - Score: {parseInt(match[1])}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="certin-info">
            <h4>About CERT-In Reporting</h4>
            <p>
              The CERT-In (Indian Computer Emergency Response Team) report is an
              official format for reporting cybersecurity incidents to the
              Indian government. When you click "Send CERT-In Report", our
              system generates a detailed report in the required format and
              sends it to CERT-In for review and action.
            </p>
          </div>
        </div>
      )}

      {result && result.type === "image" && (
        <div className="result-container">
          <div className="result-header">
            <h2>Image Analysis Results</h2>
            {(() => {
              const fileRisk = result.risk_score;
              const isPhishing = result.is_phishing;
              return (
                <div
                  className="risk-indicator"
                  style={{ backgroundColor: getRiskColor(fileRisk) }}
                >
                  {isPhishing ? "⚠️ PHISHING DETECTED" : "✅ SAFE"}
                  <span style={{ display: "block", fontSize: "0.8em" }}>
                    Confidence: {result.confidence}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="result-details">
            <div className="detail-item">
              <strong>Risk Level:</strong> {result.risk_level}
            </div>
            <div className="detail-item">
              <strong>Overall Assessment:</strong> {result.overall_assessment}
            </div>
            {result.suspicious_indicators &&
              result.suspicious_indicators.length > 0 && (
                <div className="detail-item">
                  <strong>Suspicious Elements:</strong>
                  <ul className="indicators-list">
                    {result.suspicious_indicators.map((elem, index) => (
                      <li key={index}>{elem}</li>
                    ))}
                  </ul>
                </div>
              )}
            {result.legitimate_indicators &&
              result.legitimate_indicators.length > 0 && (
                <div className="detail-item">
                  <strong>Legitimate Elements:</strong>
                  <ul className="indicators-list">
                    {result.legitimate_indicators.map((elem, index) => (
                      <li key={index}>{elem}</li>
                    ))}
                  </ul>
                </div>
              )}
            <div className="detail-item">
              <strong>Extracted Text:</strong>
              <pre>{result.extracted_text}</pre>
            </div>
            {result.detected_logos && result.detected_logos.length > 0 && (
              <div className="detail-item">
                <strong>Detected Logos:</strong>
                <ul className="indicators-list">
                  {result.detected_logos.map((logo, index) => (
                    <li key={index}>
                      {logo.description} (Confidence:{" "}
                      {(logo.confidence * 100).toFixed(2)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.detected_labels && result.detected_labels.length > 0 && (
              <div className="detail-item">
                <strong>Detected Labels:</strong>
                <ul className="indicators-list">
                  {result.detected_labels.map((label, index) => (
                    <li key={index}>
                      {label.description} (Confidence:{" "}
                      {(label.confidence * 100).toFixed(2)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="download-buttons">
            <button onClick={handleDownloadJSON}>
              Download Report as JSON
            </button>
            <button onClick={handleDownloadPDF}>Download Report as PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing-page">
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
            malicious sites automatically and share them with the security
            community.
          </p>
          <Dashboard />
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
