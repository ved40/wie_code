const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    patientEmail: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    prescriptionFile: { type: String, required: true },  // File path
    medicines: { type: String, required: true },  // Medicine details/notes
    date: { type: Date, default: Date.now },
    expiryDate: { type: Date },
});

const prescription = mongoose.model("prescription", prescriptionSchema);
module.exports = prescription;
