const asyncHandler = require("../middleware/asyncHandler");
const ErrorHandler = require("../middleware/ErrorHandler");
const Hospital = require("../models/hospital");
const InsuranceCompany = require("../models/insuranceCompany");
require('dotenv').config();

// ------------------- signup  --------------------
exports.signupHospital = asyncHandler(async (req, res, next) => {
    const { name,
        contactPerson,
        email,
        contactNumber,
        address,
        district,
        pincode,
        state,
        password
    } = req.body;

    // Create new Hospital instance
    const newHospital = new Hospital({
        name,
        contactPerson,
        email,
        contactNumber,
        address,
        district,
        pincode,
        state,
        password
    });

    // Save the Hospital to the database
    await newHospital.save();

    res.status(201).json({
        success: true,
        message: 'Hospital registered successfully. Please verify your email using the OTP sent.',
    });
});
// ------------------- signup --------------------

// ------------------- signin --------------------
// exports.signinHospital = asyncHandler(async (req, res, next) => {
//     const { email, password } = req.body;
//     const hospital = await Hospital.findOne({ email: email }).select("+password"); // 
//     if (!hospital) return res.status(500).json({ success: false, message: "Hospital Incorrect!"})
//     const comparePassword = await hospital.comparePassword(password)
//     if (!comparePassword) return res.status(500).json({ success: false, message: "Password Incorrect!"})
//     const token = await hospital.getJWTToken();
//     const options = {
//       expires: new Date(
//         Date.now() + 5 * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//     };
//     req.hospital = hospital;
//     res.status(200).cookie("hospitaltoken", token, options).json({
//       success: true,
//       token,
//       message: "Login Successfully"
//     });
//   });
// ------------------- signin --------------------

// ------------------ getAllHospitalsDetails -------------------
exports.getAllHospitalsDetails = asyncHandler(async (req, res, next) => {
    const hospitals = await Hospital.find({ isVerified: 'Approve' });
    res.status(200).json({
        success: true,
        hospitals,
        message: "Hospitals fetched successfully"
    });
  });
  // ------------------ getAllHospitalsDetails -------------------
