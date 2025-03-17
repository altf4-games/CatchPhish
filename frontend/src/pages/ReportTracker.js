import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportTracker = () => {
  const [username, setUsername] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Report Tracker</h1>
      <div className="mb-4">
        <p className="text-lg">
          Logged in as:{" "}
          <span className="font-semibold">
            {username ? username : "Loading..."}
          </span>
        </p>
      </div>
      <div className="mb-4">
        <button
          onClick={fetchReports}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Fetch Reports"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Domain</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="text-center">
                  <td className="py-2 px-4 border-b">{report.id}</td>
                  <td className="py-2 px-4 border-b">{report.domain}</td>
                  <td className="py-2 px-4 border-b">{report.status}</td>
                  <td className="py-2 px-4 border-b">{report.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="text-gray-600">No reports found.</div>
      )}
    </div>
  );
};

export default ReportTracker;
