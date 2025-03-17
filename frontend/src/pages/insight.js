import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  Shield,
  Calendar,
  Activity,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertCircle,
  Info,
} from "lucide-react";

// Import the CSS
import "./insight.css";

const InsightsAnalytics = () => {
  // State to store fetched analytics data
  const [analyticsData, setAnalyticsData] = useState({
    scanHistory: [],
    detectionRate: [],
    domainTypes: [],
    riskScores: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Create default data for charts when API calls fail
  const createDefaultData = () => {
    // Default scanHistory data (last 7 days)
    const scanHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      scanHistory.push({
        date: date.toISOString().split("T")[0],
        total: Math.floor(Math.random() * 50) + 30,
        safe: Math.floor(Math.random() * 30) + 10,
        phishing: Math.floor(Math.random() * 15) + 5,
        pending: Math.floor(Math.random() * 10) + 2,
      });
    }

    // Default detection rate data (last 6 months)
    const detectionRate = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      detectionRate.push({
        month: date.toLocaleString("default", { month: "short" }),
        rate: Math.floor(Math.random() * 30) + 65,
      });
    }

    // Default domain types
    const domainTypes = [
      { name: "Financial", value: 42 },
      { name: "Google", value: 28 },
      { name: "Microsoft", value: 18 },
      { name: "Amazon", value: 12 },
      { name: "Other", value: 24 },
    ];

    // Default risk scores
    const riskScores = [
      {
        domain: "securebank-verify.com",
        score: 9.2,
        status: "phishing",
        lastScanned: new Date().toISOString(),
        scanTime: 1.2,
      },
      {
        domain: "myclouddrive-access.net",
        score: 8.7,
        status: "phishing",
        lastScanned: new Date(Date.now() - 86400000).toISOString(),
        scanTime: 1.5,
      },
      {
        domain: "google.com",
        score: 1.2,
        status: "safe",
        lastScanned: new Date(Date.now() - 172800000).toISOString(),
        scanTime: 0.8,
      },
      {
        domain: "microsoft.com",
        score: 1.5,
        status: "safe",
        lastScanned: new Date(Date.now() - 259200000).toISOString(),
        scanTime: 0.9,
      },
      {
        domain: "amazoncloud-storage.net",
        score: 6.8,
        status: "pending",
        lastScanned: new Date(Date.now() - 345600000).toISOString(),
        scanTime: 1.7,
      },
    ];

    return {
      scanHistory,
      detectionRate,
      domainTypes,
      riskScores,
    };
  };

  // Helper function to fetch an endpoint with fallback
  const fetchEndpoint = async (url) => {
    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        console.error(`Error fetching ${url}: ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${url}: ${err.message}`);
      return [];
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [
          scanHistoryData,
          detectionRateData,
          domainTypesData,
          riskScoresData,
        ] = await Promise.all([
          fetchEndpoint("http://localhost:5000/api/analytics/scan-history"),
          fetchEndpoint("http://localhost:5000/api/analytics/detection-rate"),
          fetchEndpoint("http://localhost:5000/api/analytics/domain-types"),
          fetchEndpoint("http://localhost:5000/api/analytics/risk-scores"),
        ]);

        // Use data from API or default data if empty
        const defaultData = createDefaultData();

        setAnalyticsData({
          scanHistory:
            scanHistoryData.length > 0
              ? scanHistoryData
              : defaultData.scanHistory,
          detectionRate:
            detectionRateData.length > 0
              ? detectionRateData
              : defaultData.detectionRate,
          domainTypes:
            domainTypesData.length > 0
              ? domainTypesData
              : defaultData.domainTypes,
          riskScores:
            riskScoresData.length > 0 ? riskScoresData : defaultData.riskScores,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err.message);
        setLoading(false);
        // Use default data if API calls fail
        setAnalyticsData(createDefaultData());
      }
    };

    fetchAnalyticsData();
  }, []);

  // Colors for charts
  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884D8"];
  const STATUS_COLORS = {
    safe: "#4ade80",
    phishing: "#f87171",
    pending: "#fbbf24",
  };

  // Calculate statistics from scan history and risk scores
  const calculateStats = () => {
    if (!analyticsData.scanHistory.length)
      return {
        totalScans: 0,
        safeCount: 0,
        phishingCount: 0,
        pendingCount: 0,
        avgScanTime: 0,
        successRate: 0,
      };

    const totals = analyticsData.scanHistory.reduce(
      (acc, day) => {
        acc.totalScans += day.total || 0;
        acc.safeCount += day.safe || 0;
        acc.phishingCount += day.phishing || 0;
        acc.pendingCount += day.pending || 0;
        return acc;
      },
      { totalScans: 0, safeCount: 0, phishingCount: 0, pendingCount: 0 }
    );

    // Calculate average scan time from riskScores (if available)
    const avgScanTime =
      analyticsData.riskScores.reduce(
        (sum, item) => sum + (item.scanTime || 0),
        0
      ) / (analyticsData.riskScores.length || 1);

    // Success rate calculated as percentage of scans that are either safe or phishing (i.e. completed scans)
    const successRate = totals.totalScans
      ? (
          ((totals.safeCount + totals.phishingCount) / totals.totalScans) *
          100
        ).toFixed(1)
      : 0;

    return {
      ...totals,
      avgScanTime: avgScanTime.toFixed(1),
      successRate,
    };
  };

  const stats = calculateStats();

  // Render content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="stats-grid">
            {/* Total Scans */}
            <div className="stat-item">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <h4>Total Scans</h4>
              <div className="stat-value">{stats.totalScans}</div>
              <div className="stat-label">Last 7 days</div>
            </div>

            {/* Safe URLs */}
            <div className="stat-item">
              <div className="stat-icon">
                <Shield size={24} />
              </div>
              <h4>Safe URLs</h4>
              <div className="stat-value">{stats.safeCount}</div>
              <div className="stat-label">Last 7 days</div>
            </div>

            {/* Phishing URLs */}
            <div className="stat-item">
              <div className="stat-icon">
                <AlertTriangle size={24} />
              </div>
              <h4>Phishing URLs</h4>
              <div className="stat-value">{stats.phishingCount}</div>
              <div className="stat-label">Last 7 days</div>
            </div>

            {/* Success Rate */}
            <div className="stat-item">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <h4>Success Rate</h4>
              <div className="stat-value">{stats.successRate}%</div>
              <div className="stat-label">Completed scans</div>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="analytics-card">
            <h3>
              <LineChartIcon size={20} /> Scan History (Last 7 Days)
            </h3>
            <div className="line-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.scanHistory}>
                  <CartesianGrid />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="safe"
                    stroke={STATUS_COLORS.safe}
                    name="Safe"
                  />
                  <Line
                    type="monotone"
                    dataKey="phishing"
                    stroke={STATUS_COLORS.phishing}
                    name="Phishing"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke={STATUS_COLORS.pending}
                    name="Pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "domains":
        return (
          <div className="analytics-card">
            <h3>
              <PieChartIcon size={20} /> Domain Distribution
            </h3>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.domainTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {analyticsData.domainTypes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "detection":
        return (
          <div className="analytics-card">
            <h3>
              <BarChart2 size={20} /> Detection Rate (Last 6 Months)
            </h3>
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.detectionRate}>
                  <CartesianGrid />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="rate" name="Detection Rate">
                    {analyticsData.detectionRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#60a5fa" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "risk":
        return (
          <div className="analytics-card">
            <h3>
              <AlertCircle size={20} /> Recent Risk Scores
            </h3>
            <div className="overflow-x-auto">
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                    <th>Last Scanned</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.riskScores.map((item, index) => (
                    <tr key={index}>
                      <td>{item.domain}</td>
                      <td>
                        <div className="flex items-center">
                          <div className="risk-score-bar">
                            <div
                              className={`risk-score-fill ${
                                item.score > 7
                                  ? "high"
                                  : item.score > 3
                                  ? "medium"
                                  : "low"
                              }`}
                              style={{ width: `${item.score * 10}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{item.score}/10</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.lastScanned).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="analytics-container flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="analytics-card">
          <h3>
            <AlertTriangle size={20} /> Error
          </h3>
          <p>Failed to load analytics data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>
          <Activity size={24} /> Analytics & Insights
        </h2>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={18} />
          <span>Overview</span>
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <LineChartIcon size={18} />
          <span>Scan History</span>
        </button>
        <button
          className={`tab-button ${activeTab === "domains" ? "active" : ""}`}
          onClick={() => setActiveTab("domains")}
        >
          <PieChartIcon size={18} />
          <span>Domain Types</span>
        </button>
        <button
          className={`tab-button ${activeTab === "detection" ? "active" : ""}`}
          onClick={() => setActiveTab("detection")}
        >
          <BarChart2 size={18} />
          <span>Detection Rate</span>
        </button>
        <button
          className={`tab-button ${activeTab === "risk" ? "active" : ""}`}
          onClick={() => setActiveTab("risk")}
        >
          <AlertCircle size={18} />
          <span>Risk Analysis</span>
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Additional information */}
      <div className="info-box">
        <Info size={20} />
        <p>
          <strong>Analytics Tip:</strong> This data reflects your URL scanning
          activity. Regular scanning helps improve phishing detection accuracy
          and enhances your security posture.
        </p>
      </div>
    </div>
  );
};

export default InsightsAnalytics;
