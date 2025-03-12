const mongoose = require("mongoose");

const phishingSiteSchema = new mongoose.Schema({
    url: String,
    actionTaken: String,
    date: { type: Date, default: Date.now },  // Changed from dateSubmitted
    status: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
module.exports = mongoose.model("PhishingSite", phishingSiteSchema);
