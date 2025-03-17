import React, { useState } from "react";

const MonitorDomain = () => {
  const [domain, setDomain] = useState("");
  const [interval, setInterval] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch("http://localhost:5001/monitor-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, interval }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "An error occurred");
      }
    } catch (error) {
      setMessage("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded px-8 py-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Monitor Domain</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="domain"
              className="block text-gray-700 font-medium mb-2"
            >
              Domain
            </label>
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 bg-black border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="e.g. unionbankofindia.com"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="interval"
              className="block text-gray-700 font-medium mb-2"
            >
              Interval
            </label>
            <input
              type="text"
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-3 py-2 border  bg-black rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="e.g. 1 hour, 30 minutes"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Start Monitoring
          </button>
        </form>
        {message && (
          <div className="mt-4 p-2 bg-gray-200 text-gray-700 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorDomain;
