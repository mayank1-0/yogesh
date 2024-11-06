const asyncHandler = require("../middleware/asyncHandler");
const Admin = require("../models/admin");
const ErrorHandler = require("../middleware/ErrorHandler");
const TPA = require("../models/TPA");
const InsuranceCompany = require("../models/insuranceCompany");
const Hospital = require("../models/hospital");
const TPAName = require('../models/tpaName');
const InsuranceCompanyName = require('../models/insuranceCompanyName');
const sendMail = require('../middleware/sendMail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const PaginationAndFilter = require("../middleware/paginationAndFilter");


require('dotenv').config();

exports.loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email }).select("+password"); // 
  if (!admin) return res.status(500).json({ success: false, message: "admin Incorrect!", alert: true })
  const comparePassword = await admin.comparePassword(password)
  if (!comparePassword) return res.status(500).json({ success: false, message: "Password Incorrect!", alert: true })
  const token = await admin.getJWTToken();
  const options = {
    expires: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  req.admin = admin
  res.status(200).cookie("admntoken", token, options).json({
    success: true,
    token,
    message: "Login Successfully"
  });
});

// Logout Admin token
exports.logout = asyncHandler(async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  res.cookie("admntoken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "logged out" })
});

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });

    if (!admin) {
      return next(new ErrorHandler("Registered Email Incorrect", 404));
    }

    // Get ResetPassword Token
    const resetToken = admin.getResetPasswordToken();

    await admin.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND}api/admin/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendMail({
        email: admin.email,
        subject: `Rohenii Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `${admin.email}`,
      });
    } catch (error) {
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;

      await admin.save({ validateBeforeSave: false });

      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    next(new ErrorHandler(error.message, 400))
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) {
      return next(
        new ErrorHandler(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not password", 400));
    }

    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();
    const token = await admin.getJWTToken();

    // options for cookie
    const options = {
      expire: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    req.admin = admin;

    res.status(200).cookie("admintoken", token, options).json({
      success: true,
      message: "Password Change Successfully",
      admin,
      token,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 400))
  }
};

exports.getAdminDetails = asyncHandler(async (req, res, next) => {
  if (!req?.admin) next(new ErrorHandler("Login First"));
  const admin = await Admin.findById(req.admin._id)
  if (!admin) next(new ErrorHandler("Login Expire Please Login First"))
  res.status(200).json({ success: true, message: "fetched", admin })
});

// ========================================= update details =====================================
exports.UpdateDetails = asyncHandler(async (req, res, next) => {
  const { name, mobile } = req.body;
  const findAdmin = await Admin.findById(req.admin?._id);
  if (!findAdmin) return next(new ErrorHandler("Admin not found!"))

  const updateAdmin = await Admin.findByIdAndUpdate(req.admin?._id, {
    name, mobile
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!updateAdmin) return next(new ErrorHandler("Admin not update"))
  await updateAdmin.save()

  res.status(200).json({ success: true, message: "Profile updated successfully!" })
})
// ========================================= update details =====================================

// ========================================= change password =====================================
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) return res.status(500).json({ success: false, message: "New password and confirm new password do not match!" })
  const findAdmin = await Admin.findById(req?.admin?._id).select("+password");
  if (!findAdmin) return next(new ErrorHandler("Sign-in first"))
  const comparePassword = await findAdmin.comparePassword(oldPassword)
  if (!comparePassword) return res.status(500).json({ success: false, message: "Password Mismatch!" })
  const updatePassword = await bcrypt.hash(newPassword, 10)
  const updateAdmin = await Admin.findByIdAndUpdate(findAdmin._id, { password: updatePassword }, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  if (!updateAdmin) return next(new ErrorHandler("Password Not Updated"))
  res.status(200).json({ success: true, message: "Admin password updated successfully!" })
});
// ========================================= change password =====================================

// -------------- fetch all verified TPAs Count------------
exports.getAllVerifiedTPAsCount = asyncHandler(async (req, res, next) => {
  const count = await TPA.countDocuments({ isVerified: 'Approve' });
  res.status(200).json({
    success: true,
    count,
    message: "TPAs count fetched successfully"
  });
});
// -------------- fetch all verified TPAs Count------------

// -------------- fetch all verified insurance companies count ------------
exports.getAllVerifiedInsuranceCompaniesCount = asyncHandler(async (req, res, next) => {
  const count = await InsuranceCompany.countDocuments({ isVerified: 'Approve' });
  res.status(200).json({
    success: true,
    count,
    message: "InsuranceCompanies fetched successfully"
  });
});
// -------------- fetch all verified insurance companies count ------------

// ------------------ getAllVerifiedHospitalsCount -------------------
exports.getAllVerifiedHospitalsCount = asyncHandler(async (req, res, next) => {
  const count = await Hospital.countDocuments({ isVerified: 'Approve' });
  res.status(200).json({
    success: true,
    count,
    message: "Hospitals fetched successfully"
  });
});
// ------------------ getAllVerifiedHospitalsCount -------------------

// -------------- fetch all un-verified TPAs Count------------
exports.getAllUnVerifiedTPAsCount = asyncHandler(async (req, res, next) => {
  const count = await TPA.countDocuments({ isVerified: 'Request' });
  res.status(200).json({
    success: true,
    count,
    message: "TPAs count fetched successfully"
  });
});
// -------------- fetch all un-verified TPAs Count------------

// -------------- fetch all un-verified insurance companies count ------------
exports.getAllUnVerifiedInsuranceCompaniesCount = asyncHandler(async (req, res, next) => {
  const count = await InsuranceCompany.countDocuments({ isVerified: 'Request' });
  res.status(200).json({
    success: true,
    count,
    message: "InsuranceCompanies fetched successfully"
  });
});
// -------------- fetch all un-verified insurance companies count ------------

// ------------------ getAllUnVerifiedHospitalsCount -------------------
exports.getAllUnVerifiedHospitalsCount = asyncHandler(async (req, res, next) => {
  const count = await Hospital.countDocuments({ isVerified: 'Request' });
  res.status(200).json({
    success: true,
    count,
    message: "Hospitals fetched successfully"
  });
});
// ------------------ getAllUnVerifiedHospitalsCount -------------------

//------------------- verifyUnVerifyHospital ------------------------
exports.verifyUnVerifyHospital = asyncHandler(async (req, res, next) => {
  const hospitalId = req.params.hospitalId;
  const response = req.body.response;

  const hospital = await Hospital.findById(hospitalId).select('_id name isVerified')

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  if (hospital.isVerified == "Approve") {
    return res.status(200).json({
      success: true,
      message: "Hospital account verification already approved",
      data: hospital
    });
  }
  if (response == "yes") {
    hospital.verifyAccount();
    const updatedHospital = await hospital.save();

    res.status(200).json({
      success: true,
      message: "Hospital account verification approved successfully",
      data: updatedHospital,
    });
  }
  else {
    hospital.unVerifyAccount();
    const updatedHospital = await hospital.save();

    res.status(200).json({
      success: true,
      message: "Hospital account verification rejected successfully",
      data: updatedHospital,
    });
  }
});
//------------------- verifyUnVerifyHospital ------------------------

//------------------- verifyTpa ------------------------
exports.verifyUnVerifyTpa = asyncHandler(async (req, res, next) => {
  const tpaId = req.params.tpaId;
  const response = req.body.response;

  const tpa = await TPA.findById(tpaId).select('_id name isVerified')

  if (!tpa) {
    throw new Error("TPA not found");
  }

  if (tpa.isVerified == "Approve") {
    return res.status(200).json({
      success: true,
      message: "Tpa account verification already approved",
      data: tpa
    });
  }
  if (response == "yes") {
    tpa.verifyAccount();
    const updatedTpa = await tpa.save();

    res.status(200).json({
      success: true,
      message: "Tpa account verification approved successfully",
      data: updatedTpa,
    });
  }
  else {
    tpa.unVerifyAccount();
    const updatedTpa = await tpa.save();

    res.status(200).json({
      success: true,
      message: "Tpa account verification rejected successfully",
      data: updatedTpa,
    });
  }
});
//------------------- verifyTpa ------------------------

//------------------- verifyUnVerifyInsuranceCompany ------------------------
exports.verifyUnverifyInsuranceCompany = asyncHandler(async (req, res, next) => {
  const insuranceCompanyId = req.params.insuranceCompanyId;
  const response = req.body.response;

  const insuranceCompany = await InsuranceCompany.findById(insuranceCompanyId).select('_id name isVerified')

  if (!insuranceCompany) {
    throw new Error("Insurance Company not found");
  }

  if (insuranceCompany.isVerified == "Approve") {
    return res.status(200).json({
      success: true,
      message: "Insurance Company account verification already approved",
      data: insuranceCompany
    });
  }
  if (response == "yes") {
    insuranceCompany.verifyAccount();
    const updatedInsuranceCompany = await insuranceCompany.save();

    res.status(200).json({
      success: true,
      message: "Insurance company account verification approved successfully",
      data: updatedInsuranceCompany,
    });
  }
  else {
    insuranceCompany.unVerifyAccount();
    const updatedInsuranceCompany = await insuranceCompany.save();

    res.status(200).json({
      success: true,
      message: "Insurance company account verification rejected successfully",
      data: updatedInsuranceCompany,
    });
  }
});
//------------------- verifyUnVerifyInsuranceCompany ------------------------

// ------------- update document hospital/tpa/insuranceCompany from 'Approve' to 'Reject' ------------------
exports.deleteApprovedTableDocument = asyncHandler(async (req, res, next) => {
  const tableName = req.params.tableName;
  const docId = req.params.documentId;
  let document;
  if (tableName == 'Hospital') {
    document = await Hospital.findById(docId).select('_id name isVerified');
  }
  else if (tableName == 'TPA') {
    document = await TPA.findById(docId).select('_id name isVerified');
  }
  else if (tableName == 'InsuranceCompany') {
    document = await InsuranceCompany.findById(docId).select('_id name isVerified');
  }

  if (!document) {
    throw new Error("Document not found");
  }

  document.unVerifyAccount();
  await document.save();

  res.status(200).json({
    success: true,
    message: "Document verification status changed to Rejected successfully",
  });
});
// ------------- update document hospital/tpa/insuranceCompany from 'Approve' to 'Reject' ------------------

// ------------- add tpa-name ------------------------
exports.addTPAName = asyncHandler(async (req, res, next) => {
  const { name,
    email,
    password,
    address
  } = req.body;

  // Create new TPA instance
  const newTPAName = new TPAName({
    name,
    email,
    password,
    address
  });

  // Save the TPAName to the database
  await newTPAName.save();

  res.status(201).json({
    success: true,
    message: 'TPAName registered successfully. Please update your password',
  });
});
// ------------- add tpa-name ------------------------

// ------------- add insurance-company-name ------------------------
exports.addInsuranceCompanyName = asyncHandler(async (req, res, next) => {
  const { name,
    email,
    password,
    address,
    establishedYear
  } = req.body;

  // Create new TPA instance
  const newInsuranceCompanyName = new InsuranceCompanyName({
    name,
    email,
    password,
    address,
    establishedYear
  });

  // Save the TPAName to the database
  await newInsuranceCompanyName.save();

  res.status(201).json({
    success: true,
    message: 'InsuranceCompanyName registered successfully. Please update your password',
  });
});
// ------------- add insurance-company-name ------------------------

// ------------------ getAllHospitalsRequest -------------------
exports.getAllHospitalsRequest = asyncHandler(async (req, res, next) => {
  const hospitals = await Hospital.find({ isVerified: 'Request' }).select('+password');
  res.status(200).json({
    success: true,
    hospitals,
    message: "Hospitals fetched successfully"
  });
});
// ------------------ getAllHospitalsRequest -------------------

// ------------------ getAllHospitalsDetails -------------------
exports.getAllHospitalsDetails = asyncHandler(async (req, res, next) => {
  const hospitals = await Hospital.find({ isVerified: 'Approve' }).select('+password');
  res.status(200).json({
    success: true,
    hospitals,
    message: "Hospitals fetched successfully"
  });
});
// ------------------ getAllHospitalsDetails -------------------

// -------------- fetch all insurance companies requests ------------
exports.getAllInsuranceCompaniesRequest = asyncHandler(async (req, res, next) => {
  const insurnaceCompanies = await InsuranceCompany.find({ isVerified: 'Request' }).select('+password').populate({
    path: 'name',
    select: '-_id name' // Only select the name field
  });
  res.status(200).json({
    success: true,
    insurnaceCompanies,
    message: "InsuranceCompanies Requests fetched successfully"
  });
});
// -------------- fetch all insurance companies requests ------------

// ------------------ getAllInsuranceCompaniesDetails -------------------
exports.getAllInsuranceCompaniesDetails = asyncHandler(async (req, res, next) => {
  const insuranceCompanies = await InsuranceCompany.find({ isVerified: 'Approve' }).select('+password').populate({
    path: 'name',
    select: '-_id name' // Only select the name field
  });
  res.status(200).json({
    success: true,
    insuranceCompanies,
    message: "Insurance companies fetched successfully"
  });
});
// ------------------ getAllInsuranceCompaniesDetails -------------------

// -------------- fetch all TPAs Request ------------
exports.getAllTPAsRequest = asyncHandler(async (req, res, next) => {
  const tpas = await TPA.find({ isVerified: "Request" }).select('+password').populate({
    path: 'name',
    select: '-_id name' // Only select the name field
  });
  res.status(200).json({
    success: true,
    tpas,
    message: "TPAs requests fetched successfully"
  });
});
// -------------- fetch all TPAs Request ------------

// ------------------ getAllTPADetails -------------------
exports.getAllTPADetails = asyncHandler(async (req, res, next) => {
  const tpas = await TPA.find({ isVerified: 'Approve' }).select('+password').populate({
    path: 'name',
    select: '-_id name' // Only select the name field
  });
  res.status(200).json({
    success: true,
    tpas,
    message: "TPAs fetched successfully"
  });
});
// ------------------ getAllTPADetails -------------------

// ------------- paid membership hospitals having excludedByTPAorInsuranceCompany ---------------
exports.getExcludedHospitalList = asyncHandler(async (req, res, next) => {
  const { listType } = req.query;
  let hospitals;
  if (listType == 'Paid') {
    hospitals = await Hospital.find({
      membershipStatus: listType,
      isVerified: 'Approve',
      $or: [
        { excludedByTPAs: { $exists: true, $ne: [] } }, // At least one value in excludedByTPAs
        { excludedByInsuranceCompanies: { $exists: true, $ne: [] } } // At least one value in excludedByInsuranceCompanies
      ]
    });
  }
  else if (listType == 'Unpaid') {
    hospitals = await Hospital.find({
      membershipStatus: listType,
      isVerified: 'Approve',
      $or: [
        { excludedByTPAs: { $exists: true, $ne: [] } }, // At least one value in excludedByTPAs
        { excludedByInsuranceCompanies: { $exists: true, $ne: [] } } // At least one value in excludedByInsuranceCompanies
      ]
    });
  }
  else if (listType == 'Renewal') {
    hospitals = await Hospital.find({
      membershipStatus: listType,
      isVerified: 'Approve',
      $or: [
        { excludedByTPAs: { $exists: true, $ne: [] } }, // At least one value in excludedByTPAs
        { excludedByInsuranceCompanies: { $exists: true, $ne: [] } } // At least one value in excludedByInsuranceCompanies
      ]
    });
  }
  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals
  });
});
// ------------- paid membership hospitals having excludedByTPAorInsuranceCompany ---------------

// ========================================= Get Single hospital =====================================
exports.GetSingleHospital = asyncHandler(async (req, res, next) => {
  let hospital = await Hospital.findById(req.params.id)
  res.status(200).json({ success: true, message: "hospital fetched successfully!", hospital })
})

exports.updateMembershipStatus = asyncHandler(async (req, res, next) => {
  const { status, id } = req.params;

  // Validate the status
  const validStatuses = ['Paid', 'Unpaid', 'Renewal'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid membership status." });
  }

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    return res.status(404).json({ message: "Hospital not found." });
  }

  hospital.membershipStatus = status;

  if (status === 'Paid') {
    hospital.membershipBoughtDate = Date.now();
    // Automatically set renewal date
    hospital.membershipRenewalDate = new Date(hospital.membershipBoughtDate);
    hospital.membershipRenewalDate.setFullYear(hospital.membershipRenewalDate.getFullYear() + 1);
  } else if (status === 'Renewal') {
    // Set renewal date to one year from now, keep bought date unchanged
    hospital.membershipRenewalDate = new Date();
    hospital.membershipRenewalDate.setFullYear(hospital.membershipRenewalDate.getFullYear() + 1);
    // Optional: You might want to set membershipBoughtDate to now as well
    hospital.membershipBoughtDate = Date.now();
  } else if (status === 'Unpaid') {
    // Clear dates if membership is unpaid
    hospital.membershipBoughtDate = null;
    hospital.membershipRenewalDate = null;
  }

  await hospital.save();

  res.status(200).json({
    message: "Membership status updated successfully.", hospital });
})