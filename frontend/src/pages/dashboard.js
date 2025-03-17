"use client";
import InsightsAnalytics from './insight';
import { useState, useEffect } from "react";
import "./dashboard.css";

// StatsCards Component
function StatsCards({ stats }) {
  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.title.toLowerCase().replace(' ', '-')}`}>
          <h3>
            {stat.title}
            {stat.icon && <span className="stat-icon">{stat.icon}</span>}
          </h3>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// Sidebar Component – now accepts activeSection and setActiveSection as props
function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "🎯", label: "Takedown Tracker", id: "takedown" },
    { icon: "📈", label: "Insights & Analytics", id: "insights" },
    { icon: "⚙", label: "Settings", id: "settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="./setting.png" alt="Dashboard Logo" />
        </div>
        <h2>
          Dashboard <span className="version">v1.0</span>
        </h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// SitesTable Component
function SitesTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = data?.filter((item) =>
    item?.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...(filteredData || [])].sort((a, b) => {
    const dateA = new Date(a.date || a.dateSubmitted || 0);
    const dateB = new Date(b.date || b.dateSubmitted || 0);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
      setCurrentPage(newPage);
      document.querySelector('.table-header')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'phishing':
        return 'phishing';
      case 'safe':
        return 'safe';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="phishing-table-container">
      <div className="table-header">
        <h2>All Sites Analyzed</h2>
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search URL"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="phishing-table">
          <thead>
            <tr>
              <th>URL / Domain</th>
              <th>Action Taken</th>
              <th>Date Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={index}>
                  <td>{item.url}</td>
                  <td>{item.actionTaken}</td>
                  <td>{formatDate(item.date || item.dateSubmitted)}</td>
                  <td>
                    <span className={`status-badge ${getBadgeClass(item.status)}`}>
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">No sites found matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span>Page {currentPage} of {pageCount}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
function Dashboard() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    setLoading(true);
    // Check session then get user data
    fetch("http://localhost:5000/api/users/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(sessionData => {
        console.log("Session check:", sessionData);
        if (!sessionData.authenticated) {
          window.location.href = "/login";
          throw new Error("Not authenticated");
        }
        return fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          credentials: "include",
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Authentication error: ${response.status}`);
        }
        return response.json();
      })
      .then(userData => {
        console.log("User data:", userData);
        setUsername(userData.username);
        return fetch("http://localhost:5000/api/reports/user", {
          method: "GET",
          credentials: "include",
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch site data: ${response.status}`);
        }
        return response.json();
      })
      .then(siteData => {
        console.log("Site data:", siteData);
        if (!Array.isArray(siteData)) {
          console.error("Site data is not an array:", siteData);
          siteData = [];
        }
        setUserData(siteData);
        const totalSites = siteData.length;
        const phishingSites = siteData.filter(site => site.status === "phishing").length;
        const safeSites = siteData.filter(site => site.status === "safe").length;
        const pendingSites = siteData.filter(site => 
          site.status !== "phishing" && site.status !== "safe"
        ).length;
        setStats([
          { title: "Total Sites", value: totalSites, icon: "🔍" },
          { title: "Phishing", value: phishingSites, icon: "⚠" },
          { title: "Safe", value: safeSites, icon: "✅" },
          { title: "Pending", value: pendingSites, icon: "⏳" }
        ]);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        if (error.message !== "Not authenticated") {
          setError(error.message);
        }
        setLoading(false);
      });
  }, []);

  // Render the appropriate section based on activeSection state
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome, {username}</h1>
            <StatsCards stats={stats} />
            <SitesTable data={userData} />
          </div>
        );
      case 'takedown':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Takedown Tracker</h1>
            {/* Insert your takedown tracker content here */}
          </div>
        );
      case 'insights':
        return <InsightsAnalytics />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            {/* Insert your settings content here */}
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Page not found</h1>
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="dashboard">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="dashboard-content">
          <div className="error-container">
            <h2>Error loading dashboard</h2>
            <p>{error}</p>
            <p>Please ensure you are logged in and try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: 'rgba(231, 76, 60, 0.2)',
                border: '1px solid rgba(231, 76, 60, 0.5)',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="dashboard-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard flex h-screen bg-gray-900 text-white">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="dashboard-content flex-1 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
}

export default Dashboard;