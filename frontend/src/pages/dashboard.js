"use client";
import { useState, useEffect } from "react";
// Fix the imports - make sure paths are correct and extensions are included
import "./HomePage.js"; // Add proper extension
import ReportTracker from "./ReportTracker";
import InsightsAnalytics from "./insight";
import MonitorDomain from "./Monitor.js";

function Dashboard() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setLoading(true);
    // Check session then get user data
    fetch("http://localhost:5000/api/users/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((sessionData) => {
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
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Authentication error: ${response.status}`);
        }
        return response.json();
      })
      .then((userData) => {
        console.log("User data:", userData);
        setUsername(userData.username);
        return fetch("http://localhost:5000/api/reports/user", {
          method: "GET",
          credentials: "include",
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch site data: ${response.status}`);
        }
        return response.json();
      })
      .then((siteData) => {
        console.log("Site data:", siteData);
        if (!Array.isArray(siteData)) {
          console.error("Site data is not an array:", siteData);
          siteData = [];
        }
        setUserData(siteData);
        const totalSites = siteData.length;
        const phishingSites = siteData.filter(
          (site) => site.status === "phishing"
        ).length;
        const safeSites = siteData.filter(
          (site) => site.status === "safe"
        ).length;
        const pendingSites = siteData.filter(
          (site) => site.status !== "phishing" && site.status !== "safe"
        ).length;
        setStats([
          {
            title: "Total Sites",
            value: totalSites,
            icon: "🔍",
            color: "from-blue-500 to-blue-700",
          },
          {
            title: "Phishing",
            value: phishingSites,
            icon: "⚠️",
            color: "from-red-500 to-red-700",
          },
          {
            title: "Safe",
            value: safeSites,
            icon: "✅",
            color: "from-green-500 to-green-700",
          },
          {
            title: "Pending",
            value: pendingSites,
            icon: "⏳",
            color: "from-yellow-500 to-yellow-700",
          },
        ]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.message !== "Not authenticated") {
          setError(error.message);
        }
        setLoading(false);
      });
  }, []);

  // SitesTable functionality
  const filteredData = userData?.filter((item) =>
    item?.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...(filteredData || [])].sort((a, b) => {
    const dateA = new Date(a.date || a.dateSubmitted || 0);
    const dateB = new Date(b.date || b.dateSubmitted || 0);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pageCount) {
      setCurrentPage(newPage);
      document
        .querySelector(".table-header")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "phishing":
        return "bg-red-900/20 text-red-400 border border-red-700/30";
      case "safe":
        return "bg-green-900/20 text-green-400 border border-green-700/30";
      default:
        return "bg-yellow-900/20 text-yellow-400 border border-yellow-700/30";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Sidebar items
  const menuItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "🎯", label: "Takedown Tracker", id: "takedown" },
    { icon: "📈", label: "Insights & Analytics", id: "insights" },
    { icon: "📊", label: "Monitor", id: "monitor" },
    { icon: "⚙️", label: "Settings", id: "settings" },
  ];

  // Render the appropriate section based on activeSection state
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Welcome, {username} <span className="animate-wave">👋</span>
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-blue-900/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg relative overflow-hidden group"
                >
                  <div
                    className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r animate-pulse ${stat.color}`}
                  ></div>
                  <h3 className="text-lg text-white/75 mb-3 flex justify-between items-center font-medium">
                    {stat.title}
                    <span className="text-xl">{stat.icon}</span>
                  </h3>
                  <p className="text-4xl font-bold transition-transform duration-200 group-hover:scale-105">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Sites Table */}
            <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center p-6 border-b border-blue-900/25 table-header">
                <h2 className="text-xl font-semibold">All Sites Analyzed</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search URL"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-slate-900/65 border border-blue-900/40 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-200"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-slate-900/65 border border-blue-900/40 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-200"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-white/80">
                        URL / Domain
                      </th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-white/80">
                        Action Taken
                      </th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-white/80">
                        Date Submitted
                      </th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-white/80">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-blue-900/15 hover:bg-blue-900/15 transition-colors duration-150"
                        >
                          <td className="p-4">{item.url}</td>
                          <td className="p-4">{item.actionTaken}</td>
                          <td className="p-4">
                            {formatDate(item.date || item.dateSubmitted)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold transition-transform duration-150 hover:scale-105 ${getBadgeClass(
                                item.status
                              )}`}
                            >
                              {item.status
                                ? item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)
                                : "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-white/50 italic"
                        >
                          No sites found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pageCount > 1 && (
                <div className="flex justify-between items-center p-5 border-t border-blue-900/20">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-900/65 border border-blue-900/40 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 hover:bg-blue-900/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-white/70">
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="px-4 py-2 bg-slate-900/65 border border-blue-900/40 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 hover:bg-blue-900/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case "takedown":
        return <ReportTracker />; // Use the imported component with proper JSX syntax
      case "insights":
        // Wrap the component in error boundary to prevent crashes
        try {
          return <InsightsAnalytics />;
        } catch (error) {
          console.error("Error rendering InsightsAnalytics:", error);
          return (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Insights & Analytics</h1>
              <div className="bg-red-900/10 backdrop-blur rounded-xl border border-red-900/30 p-8 text-center">
                <p className="text-lg text-white/70">
                  There was an error loading the Insights component. Please
                  check the console for details.
                </p>
              </div>
            </div>
          );
        }
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 p-8 text-center">
              <p className="text-lg text-white/70">
                Settings functionality will be implemented here
              </p>
            </div>
          </div>
        );
      case "monitor":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Monitor</h1>
            <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-blue-900/30 p-8 text-center">
              <MonitorDomain />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Page not found</h1>
            <div className="bg-red-900/10 rounded-xl border border-red-900/30 p-8 text-center">
              <p className="text-lg text-white/70">
                The requested section does not exist
              </p>
            </div>
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <aside className="w-64 bg-slate-950/85 border-r border-blue-900/25 p-6 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 pb-5 border-b border-blue-900/25 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-500/40">
              D
            </div>
            <h2 className="text-xl font-semibold">
              Dashboard <span className="text-xs text-white/60 ml-1">v1.0</span>
            </h2>
          </div>

          <nav className="flex flex-col gap-2 mt-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-900/35 hover:translate-x-1 ${
                  activeSection === item.id
                    ? "bg-blue-900/55 text-white shadow-md shadow-blue-900/25"
                    : "text-white/75"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-red-900/10 backdrop-blur rounded-xl border border-red-900/30 p-8 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-4">
                Error loading dashboard
              </h2>
              <p className="mb-2">{error}</p>
              <p className="mb-6">
                Please ensure you are logged in and try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-3 bg-red-900/20 border border-red-900/50 rounded-lg text-white font-medium transition-all duration-200 hover:bg-red-900/30"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <aside className="w-64 bg-slate-950/85 border-r border-blue-900/25 p-6 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 pb-5 border-b border-blue-900/25 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-500/40">
              D
            </div>
            <h2 className="text-xl font-semibold">
              Dashboard <span className="text-xs text-white/60 ml-1">v1.0</span>
            </h2>
          </div>

          <nav className="flex flex-col gap-2 mt-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-900/35 hover:translate-x-1 ${
                  activeSection === item.id
                    ? "bg-blue-900/55 text-white shadow-md shadow-blue-900/25"
                    : "text-white/75"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-white/70">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/85 border-r border-blue-900/25 p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-blue-900/25 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-500/40">
            D
          </div>
          <h2 className="text-xl font-semibold">
            Dashboard <span className="text-xs text-white/60 ml-1">v1.0</span>
          </h2>
        </div>

        <nav className="flex flex-col gap-2 mt-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-900/35 hover:translate-x-1 ${
                activeSection === item.id
                  ? "bg-blue-900/55 text-white shadow-md shadow-blue-900/25"
                  : "text-white/75"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="w-6 h-6 flex items-center justify-center">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{renderSection()}</div>
    </div>
  );
}

// CSS Animations
const style = document.createElement("style");
style.innerHTML = `
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-15deg); }
    75% { transform: rotate(15deg); }
  }
  
  .animate-wave {
    display: inline-block;
    animation: wave 1s ease-in-out 1;
  }
`;
document.head.appendChild(style);

export default Dashboard;
