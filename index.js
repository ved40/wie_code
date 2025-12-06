const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const multer = require("multer");
const nodemailer = require("nodemailer");
const recep = require("./models/receptionist");
const doc = require("./models/doctor")
const patient = require("./models/patient_rgstr");
const appointment = require("./models/appointment");
const admin = require("./models/admin_login");
const prescription = require("./models/prescription");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yourEmail@gmail.com",
        pass: "your-app-password"
    }
});



// Function to send registration confirmation email
async function sendRegistrationEmail(patientName, patientEmail) {
    try {
        const mailOptions = {
            from: "yourEmail@gmail.com",
            to: patientEmail,
            subject: "Registration Successful ✔",
            html: `<h2>Hello ${patientName},</h2>
                   <p>Your registration has been successfully completed.</p>
                   <p>Thank you for choosing our hospital.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", patientEmail);

    } catch (err) {
        console.log("Mail error:", err);
    }
}


app.use(methodOverride("_method"));

main()
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wiecode");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/uploads/doctors"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer configuration for prescription uploads
const prescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/uploads/prescriptions"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const prescriptionUpload = multer({
    storage: prescriptionStorage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.get("/", (req, res) => {
    res.render("home.ejs")
})

app.get("/user_type", (req, res) => {
    res.render("user_type.ejs")
})

app.get("/receptionist_login", (req, res) => {
    res.render("receptionist_login.ejs");
})

app.post("/receptionist_login", async (req, res) => {
    let recep_data = await recep.find();
    let recepData = recep_data[0];
    let formData = req.body;
    if ((recepData.email == formData.email) && (recepData.password == formData.password)) {
        res.render("receptionist_dashboard.ejs");
    } else {
        res.send("wrong credentials");
    }
})

app.post("/register_patient", async (req, res) => {
    let patientData = req.body;
    let newPatient = new patient(patientData);

    await newPatient.save()
        .then(async () => {
            // Send confirmation email
            await sendRegistrationEmail(req.body.name, req.body.email);
            res.render("patient_rgstr_success.ejs", { patientName: req.body.name });
        })
        .catch((err) => {
            res.send(err.errorResponse.errmsg);
        })

})

app.post("/create_appointment", async (req, res) => {
    let appointmentData = req.body;
    let newappointment = new appointment(appointmentData);

    await newappointment.save()
        .then(() => {
            res.send("success");
        })
        .catch((err) => {
            res.send(err.errorResponse.errmsg);
        })
})

app.get("/doctor_login", (req, res) => {
    res.render("doctor_login.ejs")
})

app.post("/doctor_login", async (req, res) => {
    let appointments = await appointment.find();
    let appointmentcount = await appointment.countDocuments({});
    let doc_data = await doc.find();
    let docData = doc_data[0];
    let formData = req.body;
    let patients = await patient.find();
    let patientcount = await patient.countDocuments({})
    if ((docData.email == formData.email) && (docData.password == formData.password)) {
        res.render("doctor_dashboard.ejs", { appointments, patients, patientcount, appointmentcount, doctor: docData });
    } else {
        res.send("wrong credentials");
    }
})

app.post("/upload_doctor_image/:email", upload.single("profileImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.send("No file uploaded");
        }

        const doctorEmail = req.params.email;
        const imagePath = "/uploads/doctors/" + req.file.filename;

        // Update doctor with image path
        await doc.findOneAndUpdate(
            { email: doctorEmail },
            { profileImage: imagePath },
            { new: true }
        );

        res.send("Image uploaded successfully!");
    } catch (err) {
        res.send("Error uploading image: " + err.message);
    }
})

app.post("/upload_prescription", prescriptionUpload.single("prescriptionFile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.send("No file uploaded");
        }

        const { patientEmail, patientName, doctorEmail, doctorName, medicines, expiryDate } = req.body;
        const prescriptionPath = "/uploads/prescriptions/" + req.file.filename;

        const newPrescription = new prescription({
            patientEmail,
            patientName,
            doctorEmail,
            doctorName,
            prescriptionFile: prescriptionPath,
            medicines,
            expiryDate: expiryDate || null
        });

        await newPrescription.save();
        res.send("Prescription uploaded successfully!");
    } catch (err) {
        res.send("Error uploading prescription: " + err.message);
    }
})

app.get("/get_prescriptions/:email", async (req, res) => {
    try {
        const patientEmail = req.params.email;
        const prescriptions = await prescription.find({ patientEmail }).sort({ date: -1 });
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get("/patient_login", (req, res) => {
    res.render("patient_login.ejs")
})

app.post("/patient_login", async (req, res) => {
    const { email, phone } = req.body;
    const user = await patient.findOne({ email });
    console.log(user);
    let appointments = await appointment.find();

    if (!user) return res.send("User not found");

    if (user.phone === phone) {

        res.render("patient_dashboard.ejs", { user, appointments });
    } else {
        res.send("Wrong credentials")
    }
});

app.get("/admin_login", (req, res) => {
    res.render("admin_login.ejs")
})

app.post("/admin_login", async (req, res) => {
    let admin_data = await admin.find();
    let adminData = admin_data[0];
    console.log(adminData)
    let formData = req.body;
    console.log(formData)
    let patients = await patient.find();
    let patientcount = await patient.countDocuments({})
    let doctors = await doc.find();
    let doctorcount = await doc.countDocuments({})
    let receptionists = await recep.find();
    let recepcount = await recep.countDocuments({})
    if ((adminData.email == formData.email) && (adminData.password == formData.password)) {
        res.render("admin.ejs", { patients, patientcount, doctors, doctorcount, receptionists, recepcount });
    } else {
        res.send("wrong credentials");
    }
})

app.get("/add_doctor", (req, res) => {
    res.render("add_doctor.ejs");
})

app.post("/add_doctor", async (req, res) => {
    let doctorData = req.body;
    let newDoctor = new doc(doctorData);

    await newDoctor.save()
        .then(() => {
            res.render("doctor_added_success.ejs");
        })
        .catch((err) => {
            res.send(err.errorResponse.errmsg);
        })
})

app.delete("/delete_doctor/:id", async (req, res) => {
    let doctorId = req.params.id;

    await doc.findByIdAndDelete(doctorId)
        .then(() => {
            res.send("Doctor deleted successfully!");
        })
        .catch((err) => {
            res.send("Error deleting doctor: " + err.message);
        })
})

app.get("/add_receptionist", (req, res) => {
    res.render("add_receptionist.ejs");
})

app.post("/add_receptionist", async (req, res) => {
    let recepData = req.body;
    let newReceptionist = new recep(recepData);

    await newReceptionist.save()
        .then(() => {
            res.render("receptionist_added_success.ejs");
        })
        .catch((err) => {
            res.send(err.errorResponse.errmsg);
        })
})

app.delete("/delete_receptionist/:id", async (req, res) => {
    let recepId = req.params.id;

    await recep.findByIdAndDelete(recepId)
        .then(() => {
            res.send("Receptionist deleted successfully!");
        })
        .catch((err) => {
            res.send("Error deleting receptionist: " + err.message);
        })
})




// app.get("/adminData", (req, res) => {
//     let adminData = new admin({
//         email: "renu@mail.com",
//         password: "13022007"
//     });

//     adminData.save();
//     console.log("saved");
//     res.send("successful");
// })

// app.get("/recep_data", (req, res) => {
//     let recepData = new recep({
//         email: "receptionist@mail.com",
//         password: "receptionist@2025"
//     });

//     recepData.save();
//     console.log("saved");
//     res.send("successful");
// })

// app.get("/doc_data", (req, res) => {
//     let docData = new doc({
//         email: "doctor@mail.com",
//         password: "doctor@2025"
//     });

//     docData.save();
//     console.log("saved");
//     res.send("successful");
// })

app.listen(8080, () => {
    console.log("app is listening on the port 8080");
})