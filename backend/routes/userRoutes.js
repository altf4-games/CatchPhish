const express = require('express');
const router = express.Router();
const User = require('../models/user');
const PhishingSite = require('../models/PhishingSite');
const bcrypt = require('bcrypt');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    console.log("Checking authentication:");
    console.log("Session ID:", req.session.id);
    console.log("Session data:", req.session);
    console.log("Cookies:", req.headers.cookie);
    
    if (req.session && req.session.userId && req.session.isAuthenticated) {
      console.log("User is authenticated, userId:", req.session.userId);
      return next();
    }
    
    console.log("Authentication failed - no valid session");
    return res.status(401).json({ message: "Unauthorized - Please log in" });
  }

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ message: 'Error registering user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Set session data
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.isAuthenticated = true;
      req.session.save();
      
      // Save the session explicitly
      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: 'Error saving session' });
        }
        
        console.log("Session after login:", req.session);
        console.log("Session ID:", req.session.id);
        
        // Set a cookie manually as a backup
        res.cookie('userLoggedIn', 'true', {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: false // Allow JavaScript access
        });
        
        return res.status(200).json({ 
          message: 'Login successful', 
          username: user.username,
          userId: user._id
        });
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  });

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: 'Logged out successfully' });
    });
});

// Get Current User Route
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ username: user.username });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get phishing sites submitted by the current user
router.get('/phishing-sites', isAuthenticated, async (req, res) => {
    try {
        console.log("Fetching phishing sites for user ID:", req.session.userId);
        const phishingSites = await PhishingSite.find({ userId: req.session.userId });
        console.log("Found phishing sites:", phishingSites.length);
        res.json(phishingSites);
    } catch (error) {
        console.error("Error fetching phishing sites:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/check-session', (req, res) => {
    console.log("Session check requested");
    console.log("Session ID:", req.session.id);
    console.log("Session:", req.session);
    
    if (req.session && req.session.userId) {
      return res.json({ 
        authenticated: true, 
        sessionId: req.session.id,
        userId: req.session.userId,
        username: req.session.username
      });
    }
    
    return res.json({ 
      authenticated: false, 
      sessionId: req.session.id
    });
  });

// Submit a phishing site
router.post('/phishing-sites', isAuthenticated, async (req, res) => {
    const { url, actionTaken, status } = req.body;
    try {
        const phishingSite = new PhishingSite({
            userId: req.session.userId,
            url,
            actionTaken,
            status,
            dateSubmitted: new Date(),
        });
        await phishingSite.save();
        res.json({ message: 'Phishing site saved' });
    } catch (error) {
        console.error("Error saving phishing site:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;