const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    ph: { type: String, required: true },
})

const patient = mongoose.model("patient", patientSchema);
module.exports = patient;