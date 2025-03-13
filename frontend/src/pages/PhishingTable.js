"use client"

import { useState } from "react"
import "./PhishingTable.css"

function PhishingTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredData = data.filter((item) => item.url.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date)
    }
    return 0
  })

  const pageCount = Math.ceil(sortedData.length / itemsPerPage)
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="phishing-table-container">
      <div className="table-header">
        <h2>Phishing Sites Detected</h2>
        <div className="table-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="sort-dropdown">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="phishing-table">
          <thead>
            <tr>
              <th>URL / Domain</th>
              <th>Confidence Score</th>
              <th>Action Taken</th>
              <th>Date Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index}>
                <td>{item.url}</td>
                <td>{item.confidence}</td>
                <td>{item.action}</td>
                <td>{item.date}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
          ‹
        </button>
        {[...Array(pageCount)].map((_, i) => (
          <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>
          ›
        </button>
      </div>
    </div>
  )
}

export default PhishingTable

