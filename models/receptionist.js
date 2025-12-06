const mongoose = require("mongoose");


const recepSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
})

const recep = mongoose.model("recep", recepSchema);
module.exports = recep;