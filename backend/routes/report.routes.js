const express = require("express");
const Report = require("../models/report.model"); // Update path if necessary
const router = express.Router();

// Save Report Route
router.post("/", async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    console.log("Report saved:", newReport);
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ error: "Failed to save report" });
  }
});

// Get All Reports Route (optional, for testing)
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

module.exports = router;