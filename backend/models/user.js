const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId()
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,  // Enforce unique usernames
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
