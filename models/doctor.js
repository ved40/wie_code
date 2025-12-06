const mongoose = require("mongoose");

const docSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
})

const doc = mongoose.model("doc", docSchema);
module.exports = doc;