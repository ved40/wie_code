const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    dob: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    appointmentDateTime: {
        type: Date,
        required: true
    },
})

const appointment = mongoose.model("appointments", AppointmentSchema);
module.exports = appointment;
