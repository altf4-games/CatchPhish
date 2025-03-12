const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const User = require('./models/User');
const bcrypt = require('bcrypt');
app.use(cors());
app.use(express.json()); // Parses JSON requests

// Connect to MongoDB (Make sure your connection string is correct)
mongoose.connect("mongodb://127.0.0.1:27017/catchphish", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Register Route (POST request)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            userId: new mongoose.Types.ObjectId(), // Ensure unique ID
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Error in Register API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Test Route to check if backend is working
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Start Server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

const users = [{ username: "test", password: "1234" }];

app.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body); // ✅ Debug input data

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        console.log('User not found'); // ✅ Check if the user exists
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        console.log('Password incorrect'); // ✅ Debug password check
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful');
    res.json({ message: 'Login successful', token: 'your_jwt_token_here' });
});