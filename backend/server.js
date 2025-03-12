const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const app = express();
const connectDB = require("./config/db");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/userRoutes");

// Import Report model - add this line
const Report = mongoose.model('Report', require('./models/report.model').schema);




// Middleware - Order is important!
app.use(express.json()); // Parse JSON bodies

app.use(cors({
  origin: "http://localhost:3000",  // Your frontend address
  credentials: true                 // Allow credentials (cookies)
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to Database - use only one connection method
connectDB();

// Debug middleware to log sessions
app.use((req, res, next) => {
  console.log("Session ID:", req.session.id);
  console.log("Session Data:", req.session);
  next();
});

// Authentication middleware - add this function
const authenticateUser = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = { _id: req.session.userId };
  next();
};
app.use("/api/reports", authenticateUser, reportRoutes);
// Routes
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

// Route redirects for backward compatibility
app.post("/login", (req, res) => {
  console.log("Redirecting /login to /api/users/login");
  req.url = "/api/users/login";
  app.handle(req, res);
});

app.post("/register", (req, res) => {
  console.log("Redirecting /register to /api/users/register");
  req.url = "/api/users/register";
  app.handle(req, res);
});

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});