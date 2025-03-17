const express = require("express");
const router = express.Router();
const Report = require("../models/report.model");

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
};

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get scan history data (last 7 days)
router.get("/scan-history", async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all reports from the last 7 days
    const reports = await Report.find({
      userId: userId,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    // Group reports by date
    const groupedByDate = {};
    reports.forEach((report) => {
      const dateStr = report.date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = {
          date: dateStr,
          total: 0,
          phishing: 0,
          safe: 0,
          pending: 0,
        };
      }

      groupedByDate[dateStr].total += 1;

      if (report.status === "phishing") {
        groupedByDate[dateStr].phishing += 1;
      } else if (report.status === "safe") {
        groupedByDate[dateStr].safe += 1;
      } else {
        groupedByDate[dateStr].pending += 1;
      }
    });

    // Convert to array and fill in missing dates
    const result = [];
    const currentDate = new Date(sevenDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (groupedByDate[dateStr]) {
        result.push(groupedByDate[dateStr]);
      } else {
        result.push({
          date: dateStr,
          total: 0,
          phishing: 0,
          safe: 0,
          pending: 0,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching scan history:", error);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

// Get detection rate data (monthly)
router.get("/detection-rate", async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get reports from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reports = await Report.find({
      userId: userId,
      date: { $gte: sixMonthsAgo },
    });

    // Group reports by month
    const groupedByMonth = {};
    reports.forEach((report) => {
      const date = new Date(report.date);
      const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });

      if (!groupedByMonth[monthStr]) {
        groupedByMonth[monthStr] = {
          month: monthName,
          total: 0,
          completed: 0,
        };
      }

      groupedByMonth[monthStr].total += 1;
      if (report.status === "phishing" || report.status === "safe") {
        groupedByMonth[monthStr].completed += 1;
      }
    });

    // Calculate detection rate and convert to array
    const result = Object.values(groupedByMonth).map((month) => ({
      month: month.month,
      rate:
        month.total > 0
          ? ((month.completed / month.total) * 100).toFixed(1)
          : 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching detection rate:", error);
    res.status(500).json({ error: "Failed to fetch detection rate" });
  }
});

// Get domain types distribution
router.get("/domain-types", async (req, res) => {
  try {
    const userId = req.session.userId;
    const reports = await Report.find({ userId });

    // Extract domain types from URLs
    const domainTypes = {};
    reports.forEach((report) => {
      let type = "Other";
      const url = report.url.toLowerCase();

      if (url.includes("google") || url.includes("gmail")) {
        type = "Google";
      } else if (url.includes("facebook") || url.includes("fb")) {
        type = "Facebook";
      } else if (
        url.includes("microsoft") ||
        url.includes("outlook") ||
        url.includes("office365")
      ) {
        type = "Microsoft";
      } else if (url.includes("amazon")) {
        type = "Amazon";
      } else if (
        url.includes("bank") ||
        url.includes("paypal") ||
        url.includes("finance")
      ) {
        type = "Financial";
      }

      if (!domainTypes[type]) {
        domainTypes[type] = 0;
      }
      domainTypes[type] += 1;
    });

    // Convert to array format expected by the frontend
    const result = Object.entries(domainTypes).map(([name, value]) => ({
      name,
      value,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching domain types:", error);
    res.status(500).json({ error: "Failed to fetch domain types" });
  }
});

// Get risk scores
router.get("/risk-scores", async (req, res) => {
  try {
    const userId = req.session.userId;
    const reports = await Report.find({ userId }).sort({ date: -1 }).limit(10);

    // Generate risk scores and other metrics
    const result = reports.map((report) => {
      // Generate a risk score based on the status
      let score = 0;
      if (report.status === "phishing") {
        score = 7 + Math.random() * 3; // 7-10 for phishing
      } else if (report.status === "safe") {
        score = 1 + Math.random() * 2; // 1-3 for safe
      } else {
        score = 3 + Math.random() * 4; // 3-7 for pending/unknown
      }

      return {
        domain: report.url,
        score: Math.round(score * 10) / 10,
        status: report.status,
        lastScanned: report.date,
        scanTime: 2 + Math.random() * 3, // 2-5 seconds scan time
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching risk scores:", error);
    res.status(500).json({ error: "Failed to fetch risk scores" });
  }
});

module.exports = router;
