import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReportTracker.css";

const ReportTracker = () => {
  const [username, setUsername] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(true);

  // Fetch current user information to get the username
  useEffect(() => {
    fetch("http://localhost:5000/api/users/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.username) {
          setUsername(data.username);
        } else {
          setError("Unable to fetch username.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching user info.");
      });
      
    // Hide loading animation after 2 seconds
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  }, []);

  const fetchReports = async () => {
    if (!username.trim()) {
      setError("No username available.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/get-reports?username=${username}`
      );
      setReports(response.data.reports);
    } catch (err) {
      console.error(err);
      setError("Error fetching reports.");
    } finally {
      setLoading(false);
    }
  };

  // Generate random data points for the background chart
  const generateChartData = () => {
    const data = [];
    for (let i = 0; i < 15; i++) {
      data.push(Math.floor(Math.random() * 100));
    }
    return data;
  };
  
  const chartData = generateChartData();
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-black text-blue-50 overflow-hidden">
      {/* Animated cybersecurity background elements */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="cyber-grid"></div>
        {chartData.map((value, index) => (
          <div 
            key={index}
            className="absolute h-px bg-blue-400"
            style={{
              width: `${value * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${(index * 7) % 100}%`,
              opacity: 0.4,
              animation: `pulse ${1 + Math.random() * 2}s infinite alternate`
            }}
          ></div>
        ))}
      </div>
      
      {/* Loading overlay */}
      {showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          <div className="cyber-scanner"></div>
          <div className="mt-4 text-blue-400 font-mono text-lg">
            <span className="typing-animation">Initializing CatchPhish Protocol...</span>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto p-6 relative z-10">
        <div className="mb-8 flex items-center">
          {/* Small logo */}
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
            <img 
              src="./logo.png" 
              alt="Logo" 
              className="h-4 w-4 text-white"
            />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Takedown Tracker</h1>
        </div>
        
        <div className="backdrop-filter backdrop-blur-md bg-blue-900 bg-opacity-20 border border-blue-800 rounded-xl p-6 shadow-2xl mb-8">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-lg text-blue-300 font-mono">
                SESSION ACTIVE //
                <span className="ml-2 font-semibold text-cyan-300 bg-blue-900 bg-opacity-30 px-3 py-1 rounded-md border-l-4 border-cyan-400">
                  {username ? username : "Authenticating..."}
                </span>
              </p>
            </div>
            
            <button
              onClick={fetchReports}
              disabled={loading}
              className={`tech-button relative overflow-hidden px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${
                loading 
                ? "bg-blue-800 text-blue-300" 
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50"
              }`}
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <img 
                      src="/path/to/loading-spinner.png" 
                      alt="Loading" 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    />
                    SCANNING...
                  </>
                ) : (
                  <>
                    <img 
                      src="./document.png" 
                      alt="Document" 
                      className="h-4 w-4 mr-2" 
                    />
                    FETCH REPORTS
                  </>
                )}
              </span>
            </button>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg font-mono flex items-center">
              <img 
                src="./warning.png" 
                alt="Warning" 
                className="h-4 w-4 mr-2 text-red-400" 
              />
              <span>ERROR: {error}</span>
            </div>
          )}
          
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-700">
                    <th className="py-3 px-4 text-left text-blue-300 font-mono font-medium">
                      <div className="flex items-center">
                        <img 
                          src="./info.png" 
                          alt="Info" 
                          className="h-3 w-3 mr-1 text-cyan-400" 
                        />
                        ID
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-blue-300 font-mono font-medium">
                      <div className="flex items-center">
                        <img 
                          src="./globe.png" 
                          alt="Globe" 
                          className="h-3 w-3 mr-1 text-cyan-400" 
                        />
                        DOMAIN
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-blue-300 font-mono font-medium">
                      <div className="flex items-center">
                        <img 
                          src="./status.png" 
                          alt="Status" 
                          className="h-3 w-3 mr-1 text-cyan-400" 
                        />
                        STATUS
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-blue-300 font-mono font-medium">
                      <div className="flex items-center">
                        <img 
                          src="./clock.png" 
                          alt="Clock" 
                          className="h-3 w-3 mr-1 text-cyan-400" 
                        />
                        TIMESTAMP
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr 
                      key={report.id} 
                      className={`border-b border-blue-800/50 hover:bg-blue-800/30 transition-colors ${
                        index % 2 === 0 ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-cyan-200">{report.id}</td>
                      <td className="py-3 px-4 font-mono text-cyan-100">{report.domain}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium font-mono flex items-center ${
                          report.status === "clean" 
                            ? "bg-green-900/40 text-green-300 border border-green-700" 
                            : report.status === "suspicious" 
                            ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700"
                            : "bg-red-900/40 text-red-300 border border-red-700"
                        }`}>
                          {/* Added status indicators */}
                          {report.status === "clean" && (
                            <img 
                              src="/path/to/check-icon.png" 
                              alt="Check" 
                              className="h-4 w-4 mr-1" 
                            />
                          )}
                          {report.status === "suspicious" && (
                            <img 
                              src="/path/to/warning-icon.png" 
                              alt="Warning" 
                              className="h-4 w-4 mr-1" 
                            />
                          )}
                          {report.status === "malicious" && (
                            <img 
                              src="/path/to/danger-icon.png" 
                              alt="Danger" 
                              className="h-4 w-4 mr-1" 
                            />
                          )}
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-50">{report.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <div className="border-2 border-dashed border-blue-700 rounded-lg p-12 text-center bg-blue-900/20">
                {/* Improved empty state icon */}
                <img 
                  src="/path/to/empty-state-icon.png" 
                  alt="Empty State" 
                  className="h-24 w-24 mx-auto text-blue-500 opacity-50 mb-4" 
                />
                <p className="text-blue-300 text-lg font-mono">No reported domains found in database.</p>
                <p className="text-blue-400 opacity-75 mt-2 font-mono text-sm">Click "FETCH REPORTS" to scan for new data.</p>
              </div>
            )
          )}
        </div>
        
        <div className="text-xs text-blue-500 opacity-70 text-center font-mono mt-6">
          {/* Enhanced system status indicators */}
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/path/to/console-icon.png" 
              alt="Console" 
              className="h-5 w-5 mr-2 text-cyan-400" 
            />
            SYSTEM STATUS: ACTIVE // PROCESSING NODES: ONLINE // LAST UPDATED: {new Date().toLocaleTimeString()}
          </div>
          <div className="mt-2 flex justify-center items-center">
            <div className="mr-3 flex items-center">
              <span className="status-indicator mr-1"></span>
              <span className="text-xs">ACTIVE</span>
            </div>
            <div className="mx-3 flex items-center">
              <span className="status-indicator warning mr-1"></span>
              <span className="text-xs">WARNING</span>
            </div>
            <div className="ml-3 flex items-center">
              <span className="status-indicator danger mr-1"></span>
              <span className="text-xs">ALERT</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional styles */}
      <style jsx>{`
        .cyber-grid {
          background-image: linear-gradient(rgba(0, 128, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 128, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          width: 100%;
          height: 100%;
        }
        
        .cyber-scanner {
          width: 240px;
          height: 40px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
          animation: scanning 2s infinite;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }
        
        .cyber-scanner::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            transparent,
            transparent 5px,
            rgba(0, 128, 255, 0.3) 5px,
            rgba(0, 128, 255, 0.3) 10px
          );
        }
        
        .typing-animation {
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid cyan;
          width: 0;
          animation: typing 2s steps(28) forwards, blink 1s infinite;
        }
        
        @keyframes scanning {
          0% { background-position: -240px 0; }
          100% { background-position: 240px 0; }
        }
        
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.6; }
        }
        
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blink {
          0%, 100% { border-color: transparent; }
          50% { border-color: cyan; }
        }
      `}</style>
      
      {/* Add the scan line effect */}
      <div className="scan-line"></div>
      {/* Add the scan line effect */}
      <div className="scan-line"></div>
      
      {/* Add the digital noise effect */}
      <div className="digital-noise"></div>
    </div>
  );
};

export default ReportTracker;