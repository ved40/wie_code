const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const recep = require("./models/receptionist");
const doc = require("./models/doctor")
const patient = require("./models/patient_rgstr");
const appointment = require("./models/appointment");
const admin = require("./models/admin_login");


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
        .then(() => {
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
    let doc_data = await doc.find();
    let docData = doc_data[0];
    let formData = req.body;
    let patients = await patient.find();
    if ((docData.email == formData.email) && (docData.password == formData.password)) {
        res.render("doctor_dashboard.ejs", { appointments, patients });
    } else {
        res.send("wrong credentials");
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
    if ((adminData.email == formData.email) && (adminData.password == formData.password)) {
        res.render("admin.ejs", { patients, patientcount });
    } else {
        res.send("wrong credentials");
    }
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