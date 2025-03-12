const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    actionTaken: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;