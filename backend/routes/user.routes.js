const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({ username: req.body.username, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ id: user._id }, 'secretKey');
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(400).send('Error logging in');
    }
});

module.exports = router;
