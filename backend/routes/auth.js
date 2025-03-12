const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userId, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
});

module.exports = router;
