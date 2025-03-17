import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <main className="flex-1 flex relative p-8 md:p-12 lg:p-16 bg-gradient-to-br from-blue-950 to-blue-800 overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-radial-gradient opacity-30 animate-pulse-slow pointer-events-none"></div>
        
        {/* Net illustration */}
        <div className="absolute -left-20 -bottom-20 w-72 md:w-96 opacity-60 pointer-events-none animate-float z-0">
          <img src="/net.png" alt="Fishing net illustration" className="w-full h-auto filter drop-shadow-2xl" />
        </div>
        
        {/* Fish illustration */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-36 md:w-56 opacity-80 pointer-events-none animate-swim z-0">
          <img src="/fish.png" alt="Fish illustration" className="w-full h-auto filter drop-shadow-2xl" />
        </div>
        
        <div className="flex-1 max-w-6xl mx-auto text-center z-10 relative w-full">
          {/* Logo and title */}
          <div className="flex items-center justify-center mb-10 animate-fade-in flex-col md:flex-row">
            <img src="./LOGO.png" alt="CatchPhish" className="h-16 md:h-24 mb-4 md:mb-0 md:mr-4 filter drop-shadow-lg transition-transform duration-300 hover:scale-105 hover:-rotate-5" />
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 drop-shadow-md m-0">Catch</h1>
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 drop-shadow-md m-0">Phish</p>
          </div>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-sm animate-fade-in-delay px-4">
            Analyze suspicious domains, IPs and URLs to detect phishing and malicious sites automatically and share them with the security community.
          </p>
          
          {/* Dashboard component */}
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
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
    navigate("/HomePage");

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
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-orange-500";
    if (score >= 20) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="w-full max-w-4xl mx-auto">
        {/* Search Input */}
        <div className="mb-10 relative transform transition-transform duration-300 hover:scale-102 animate-slide-up w-full flex flex-col md:flex-row">
          <input
            type="text"
            placeholder="Enter URL, IP Address, or domain"
            className="w-full py-5 px-6 text-lg border-none rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:shadow-xl bg-white/95 focus:bg-white text-focus:bg-white text-gray-800 mb-4 md:mb-0 md:mr-4 placeholder-gray-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            className="py-5 px-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {/* File Upload Section */}
        <div 
          className={`mb-10 p-8 rounded-2xl border-dashed border-2 ${
            dragActive ? "border-orange-400 bg-orange-50" : "border-gray-300 bg-white/90"
          } text-center cursor-pointer transition-all duration-300 animate-fade-in-delay shadow-md hover:shadow-lg`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload").click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <div className="flex flex-col items-center justify-center">
            <svg
              className={`w-12 h-12 mb-4 ${
                dragActive ? "text-orange-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {fileAnalysisLoading
                ? "Analyzing..."
                : "Analyze suspicious emails & images"}
            </h3>
            <p className="text-sm text-gray-500">
              Drag & drop or click to upload a screenshot, email, or PDF (Max 10MB)
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 animate-fade-in">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 mb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Analysis Results
                </h2>
                <p className="text-gray-600">
                  {result.type === "url"
                    ? result.domain || result.url
                    : result.image_name}
                </p>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  onClick={handleDownloadJSON}
                  className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  JSON
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  PDF
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleCertInReport}
                    disabled={certInReportLoading}
                    className="py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center"
                  >
                    {certInReportLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-700"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          ></path>
                        </svg>
                        CERT-In Report
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {certInReportStatus && (
              <div
                className={`mb-6 p-4 ${
                  certInReportStatus.success
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700"
                } border-l-4 animate-fade-in`}
              >
                <p>{certInReportStatus.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Risk Score Card */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Risk Score
                </h3>
                <div className="flex items-center">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ${getRiskColor(
                      parseFloat(result.risk_score)
                    )}`}
                  >
                    {result.risk_score}
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-lg font-bold ${
                        parseFloat(result.risk_score) >= 60
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {parseFloat(result.risk_score) >= 60
                        ? "High Risk"
                        : parseFloat(result.risk_score) >= 40
                        ? "Medium Risk"
                        : "Low Risk"}
                    </p>
                    <p className="text-gray-600">
                      {result.is_phishing
                        ? "Likely Phishing"
                        : "Likely Legitimate"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Domain Age Card */}
             {result.type === "url" && (
               <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                 <h3 className="text-lg font-medium text-gray-700 mb-4">
                   Domain Information
                 </h3>
                 <p className="text-sm text-gray-600 mb-2">
                   <span className="font-medium">Registration:</span>{" "}
                   {result.domain_info?.registration_date
                     ? new Date(
                         result.domain_info.registration_date
                       ).toLocaleDateString()
                     : "Unknown"}
                 </p>
                 <p className="text-sm text-gray-600 mb-2">
                   <span className="font-medium">Age:</span>{" "}
                   {result.domain_info?.age_days
                     ? `${result.domain_info.age_days} days`
                     : "Unknown"}
                 </p>
                 <p
                   className={`text-sm ${
                     result.domain_info?.is_newly_registered
                       ? "text-red-600"
                       : "text-green-600"
                   } font-medium mt-2`}
                 >
                   {result.domain_info?.is_newly_registered
                     ? "⚠️ Recently registered domain"
                     : "✓ Established domain"}
                 </p>
               </div>
             )}

             {/* Security Checks Card */}
             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
               <h3 className="text-lg font-medium text-gray-700 mb-4">
                 Security Checks
               </h3>
               {result.type === "url" ? (
                 <>
                   <p className="text-sm text-gray-600 mb-2 flex items-center">
                     <span
                       className={`w-4 h-4 rounded-full mr-2 ${
                         result.virustotal?.malicious_engines > 0
                           ? "bg-red-500"
                           : "bg-green-500"
                       }`}
                     ></span>
                     VirusTotal:{" "}
                     {result.virustotal?.malicious_engines > 0
                       ? `${result.virustotal.malicious_engines}/${result.virustotal.total_engines} flagged`
                       : "Clear"}
                   </p>
                   <p className="text-sm text-gray-600 mb-2 flex items-center">
                     <span
                       className={`w-4 h-4 rounded-full mr-2 ${
                         result.openphish_flagged ? "bg-red-500" : "bg-green-500"
                       }`}
                     ></span>
                     OpenPhish: {result.openphish_flagged ? "Flagged" : "Clear"}
                   </p>
                   <p className="text-sm text-gray-600 flex items-center">
                     <span
                       className={`w-4 h-4 rounded-full mr-2 ${
                         result.ssl_info?.is_valid ? "bg-green-500" : "bg-red-500"
                       }`}
                     ></span>
                     SSL Certificate:{" "}
                     {result.ssl_info?.is_valid ? "Valid" : "Invalid/Missing"}
                   </p>
                 </>
               ) : (
                 <>
                   <p className="text-sm text-gray-600 mb-2">
                     <span className="font-medium">Confidence:</span>{" "}
                     {result.confidence}
                   </p>
                   <p className="text-sm text-gray-600 mb-2">
                     <span className="font-medium">Risk Level:</span>{" "}
                     <span
                       className={
                         result.risk_level === "High"
                           ? "text-red-600 font-medium"
                           : result.risk_level === "Medium"
                           ? "text-orange-600 font-medium"
                           : "text-green-600 font-medium"
                       }
                     >
                       {result.risk_level}
                     </span>
                   </p>
                   {result.detected_logos && result.detected_logos.length > 0 && (
                     <p className="text-sm text-gray-600">
                       <span className="font-medium">Detected Logos:</span>{" "}
                       {result.detected_logos.join(", ")}
                     </p>
                   )}
                 </>
               )}
             </div>
           </div>

           {/* Indicators */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
               <h3 className="text-lg font-medium text-red-600 mb-4 flex items-center">
                 <svg
                   className="w-5 h-5 mr-2"
                   fill="currentColor"
                   viewBox="0 0 20 20"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     fillRule="evenodd"
                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                     clipRule="evenodd"
                   ></path>
                 </svg>
                 Suspicious Indicators
               </h3>
               {(result.suspicious_indicators?.length > 0 ||
                 result.suspicious_elements?.length > 0) ? (
                 <ul className="space-y-2">
                   {(result.suspicious_indicators || result.suspicious_elements || []).map(
                     (indicator, index) => (
                       <li
                         key={index}
                         className="text-sm text-gray-600 flex items-start"
                       >
                         <span className="text-red-500 mr-2">•</span> {indicator}
                       </li>
                     )
                   )}
                 </ul>
               ) : (
                 <p className="text-sm text-gray-600">
                   No suspicious indicators found.
                 </p>
               )}
             </div>

             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
               <h3 className="text-lg font-medium text-green-600 mb-4 flex items-center">
                 <svg
                   className="w-5 h-5 mr-2"
                   fill="currentColor"
                   viewBox="0 0 20 20"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     fillRule="evenodd"
                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                     clipRule="evenodd"
                   ></path>
                 </svg>
                 Legitimate Indicators
               </h3>
               {(result.legitimate_indicators?.length > 0 ||
                 result.legitimate_elements?.length > 0) ? (
                 <ul className="space-y-2">
                   {(result.legitimate_indicators || result.legitimate_elements || []).map(
                     (indicator, index) => (
                       <li
                         key={index}
                         className="text-sm text-gray-600 flex items-start"
                       >
                         <span className="text-green-500 mr-2">•</span> {indicator}
                       </li>
                     )
                   )}
                 </ul>
               ) : (
                 <p className="text-sm text-gray-600">
                   No legitimate indicators found.
                 </p>
               )}
             </div>
           </div>

           {/* Fuzzy Domain Results */}
           {result.type === "url" && fuzzyResults.length > 0 && (
             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
               <h3 className="text-lg font-medium text-gray-700 mb-4">
                 Similar Domains
               </h3>
               <div className="overflow-x-auto">
                 <table className="min-w-full text-sm">
                   <thead>
                     <tr className="border-b">
                       <th className="text-left py-2 px-3 font-medium text-gray-600">
                         Domain
                       </th>
                       <th className="text-left py-2 px-3 font-medium text-gray-600">
                         Similarity
                       </th>
                       <th className="text-left py-2 px-3 font-medium text-gray-600">
                         Status
                       </th>
                     </tr>
                   </thead>
                   <tbody>
                     {fuzzyResults.map((domain, index) => (
                       <tr
                         key={index}
                         className="border-b hover:bg-gray-50 transition-colors"
                       >
                         <td className="py-2 px-3">{domain.domain}</td>
                         <td className="py-2 px-3">
                           {Math.round(domain.similarity * 100)}%
                         </td>
                         <td className="py-2 px-3">
                           <span
                             className={`px-2 py-1 rounded-full text-xs font-medium ${
                               domain.status === "phishing"
                                 ? "bg-red-100 text-red-800"
                                 : domain.status === "suspicious"
                                 ? "bg-yellow-100 text-yellow-800"
                                 : "bg-green-100 text-green-800"
                             }`}
                           >
                             {domain.status.charAt(0).toUpperCase() +
                               domain.status.slice(1)}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           )}

           {/* AI Analysis */}
           {result.type === "url" && result.gemini_analysis && (
             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
               <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                 <svg
                   className="w-5 h-5 mr-2"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                   ></path>
                 </svg>
                 AI Security Analysis
               </h3>
               <div className="prose prose-sm max-w-none text-gray-600">
                 <p>{result.gemini_analysis.summary}</p>
                 {result.gemini_analysis.reasoning && (
                   <div className="mt-4">
                     <h4 className="text-md font-medium text-gray-700 mb-2">
                       Reasoning
                     </h4>
                     <p>{result.gemini_analysis.reasoning}</p>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Image Analysis */}
           {result.type === "image" && result.overall_assessment && (
             <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
               <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                 <svg
                   className="w-5 h-5 mr-2"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                   ></path>
                 </svg>
                 Analysis Summary
               </h3>
               <div className="prose prose-sm max-w-none text-gray-600">
                 <p>{result.overall_assessment}</p>
               </div>
             </div>
           )}
         </div>
       )}
     </div>
   </div>
 ); 
};

export default LandingPage;