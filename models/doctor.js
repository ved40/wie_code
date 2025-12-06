const mongoose = require("mongoose");

const docSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    specialization: { type: String, default: "General" },
    profileImage: { type: String, default: null },  // Store image file path
})

const doc = mongoose.model("doc", docSchema);
module.exports = doc;