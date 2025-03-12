const express = require("express");
const router = express.Router();
const Report = require("../models/report.model");

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log("Checking authentication in reports route:", req.session);
  if (req.session && req.session.userId) {
    return next();
  }
  console.log("Authentication failed - session:", req.session);
  return res.status(401).json({ error: "Authentication required" });
};

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Save Report (POST)
router.post("/", async (req, res) => {
    try {
        const { url, actionTaken, status } = req.body;

        if (!url || !actionTaken || !status) {
            console.log("Missing fields in report data:", req.body);
            return res.status(400).json({ error: "All fields are required" });
        }

        // Get the user ID from the session
        const userId = req.session.userId;
        console.log("Creating report for user:", userId);

        // Include userId in the new report
        const newReport = new Report({ 
            url, 
            actionTaken, 
            status,
            userId  // Add this field
        });
        
        await newReport.save();

        console.log("Report saved successfully:", newReport);
        res.status(201).json(newReport);
    } catch (error) {
        console.error("Error saving report:", error);
        res.status(500).json({ error: "Failed to save report" });
    }
});

// Fetch All Reports (GET)
router.get("/", async (req, res) => {
    try {
        // Get the user ID from the session
        const userId = req.session.userId;
        console.log("Fetching all reports for user:", userId);
        
        // Only fetch reports for the current user
        const reports = await Report.find({ userId });
        console.log(`Found ${reports.length} reports`);
        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

router.get("/fix-existing", async (req, res) => {
    try {
        // Get the user ID from the session
        const userId = req.session.userId;
        console.log("Fixing reports for user:", userId);

        // Update all reports that don't have a userId
        const result = await Report.updateMany(
            { userId: { $exists: false } }, 
            { $set: { userId: userId } }
        );

        console.log("Fixed reports result:", result);
        res.json({ 
            message: `Updated ${result.modifiedCount} existing reports with your user ID`,
            result 
        });
    } catch (error) {
        console.error("Error fixing reports:", error);
        res.status(500).json({ error: "Failed to fix reports" });
    }
});

// Get user-specific reports
router.get("/user", async (req, res) => {
    try {
        // Get the user ID from the session
        const userId = req.session.userId;
        console.log("Fetching user reports for:", userId);

        // Find reports for this specific user
        const reports = await Report.find({ userId });
        console.log(`Found ${reports.length} reports for user ${userId}`);
        
        res.json(reports);
    } catch (error) {
        console.error("Error fetching user reports:", error);
        res.status(500).json({ error: "Failed to fetch user reports" });
    }
});

// For debugging - get all reports regardless of user
// WARNING: Only for admin or debugging purposes!
router.get("/admin/all", async (req, res) => {
    try {
        if (req.session.isAdmin !== true) {
            return res.status(403).json({ error: "Admin access required" });
        }
        
        const reports = await Report.find();
        console.log(`Admin access: Found ${reports.length} total reports`);
        res.json(reports);
    } catch (error) {
        console.error("Error fetching all reports:", error);
        res.status(500).json({ error: "Failed to fetch all reports" });
    }
});

module.exports = router;