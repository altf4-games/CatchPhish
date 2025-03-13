"use client";

import { useState, useEffect } from "react";
import "./dashboard.css";

// StatsCards Component with improved visualization
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

// Sidebar Component with improved navigation
function Sidebar() {
  const menuItems = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "🎯", label: "Takedown Tracker", hasSubmenu: true },
    { icon: "📈", label: "Insights & Analytics", hasSubmenu: true },
    { icon: "⚙️", label: "Settings", hasSubmenu: true },
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
          <div key={index} className={`nav-item ${item.active ? "active" : ""}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.hasSubmenu && <span className="submenu-arrow">›</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}

// SitesTable Component with enhanced UI
function SitesTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = data?.filter((item) =>
    item?.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...(filteredData || [])].sort((a, b) => {
    // Handle both date and dateSubmitted field names
    const dateA = new Date(a.date || a.dateSubmitted || 0);
    const dateB = new Date(b.date || b.dateSubmitted || 0);
    
    if (sortBy === "newest") {
      return dateB - dateA;
    }
    return dateA - dateB;
  });

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
      setCurrentPage(newPage);
      // Scroll to top of table on page change
      document.querySelector('.table-header')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to get badge class based on status
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

  // Format date to be more readable
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
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'}
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

// Main Dashboard Component with enhanced UI and animations
function Dashboard() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState([]);
  const [stats, setStats] = useState([
    { title: "Total Sites", value: 0, icon: "🔍" },
    { title: "Phishing", value: 0, icon: "⚠️" },
    { title: "Safe", value: 0, icon: "✅" },
    { title: "Pending", value: 0, icon: "⏳" }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // First, check if the session is valid
    fetch("http://localhost:5000/api/users/check-session", {
      method: "GET",
      credentials: "include",
    })
    .then(response => response.json())
    .then(sessionData => {
      console.log("Session check:", sessionData);
      
      if (!sessionData.authenticated) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        throw new Error("Not authenticated");
      }
      
      // If authenticated, get user data
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
      
      // Fetch ALL sites
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
      
      // Check if siteData is an array
      if (!Array.isArray(siteData)) {
        console.error("Site data is not an array:", siteData);
        siteData = [];
      }
      
      setUserData(siteData);
      
      // Update stats with counts and icons
      const totalSites = siteData.length;
      const phishingSites = siteData.filter(site => site.status === "phishing").length;
      const safeSites = siteData.filter(site => site.status === "safe").length;
      const pendingSites = siteData.filter(site => 
        site.status !== "phishing" && site.status !== "safe"
      ).length;
      
      setStats([
        { title: "Total Sites", value: totalSites, icon: "🔍" },
        { title: "Phishing", value: phishingSites, icon: "⚠️" },
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

  if (error) {
    return (
      <div className="dashboard">
        <Sidebar />
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

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <h1>Welcome, {username || "User"}<span>👋</span></h1>
            <StatsCards stats={stats} />
            <SitesTable data={userData} />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;