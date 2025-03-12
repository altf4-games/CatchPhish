const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);