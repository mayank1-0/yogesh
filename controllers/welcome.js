const asyncHandler = require("../middleware/asyncHandler");
const ErrorHandler = require("../middleware/ErrorHandler");
const Hospital = require("../models/hospital");
const TPA = require("../models/TPA");
const InsuranceCompany = require("../models/insuranceCompany");
const TPANames = require("../models/tpaName");
const InsuranceCompanyNames = require("../models/insuranceCompanyName");
const PaginationAndFilter = require("../middleware/paginationAndFilter");
const mongoose = require("mongoose");

require('dotenv').config();

// ------------------ getAllHospitalsAndExcludedByData -------------------
exports.getAllHospitalsAndExcludedByData = asyncHandler(async (req, res, next) => {
    const hospital = await new PaginationAndFilter(Hospital);
    const hospitals = await hospital.getPaginatedAndFilteredResults(req.query);
    res.json(hospitals);
});
// ------------------ getAllHospitalsAndExcludedByData -------------------

// ---------------- getHospitalexcludedInsuranceAndTPA -------------
exports.getHospitalexcludedInsuranceAndTPA = asyncHandler(async (req, res, next) => {
    const hospitalId = req.params.hospitalId;
    // Find the hospital by ID and populate excludedInsurances and excludedTPAs
    const hospital = await Hospital.findById(hospitalId)
        .populate({
            path: 'excludedByInsuranceCompanies',
            select: 'name' // Only select the name field
        })
        .populate({
            path: 'excludedByTPAs',
            select: 'name' // Only select the name field
        });
    // Check if the hospital exists
    if (!hospital) {
        return res.status(404).json({
            success: false,
            message: "Hospital not found"
        });
    }

    // Send the excluded insurances and TPAs in the response
    res.status(200).json({
        success: true,
        hospitalName: hospital.name,
        excludedByInsuranceCompanies: hospital.excludedByInsuranceCompanies,
        excludedByTPAs: hospital.excludedByTPAs,
        message: "Excluded by insurance companies and by TPAs fetched successfully"
    });
});
// ---------------- getHospitalexcludedInsuranceAndTPA -------------

// -------------- fetch all TPAs ------------
exports.getAllTPAsNameId = asyncHandler(async (req, res, next) => {
    const tpas = await TPA.find().select('name');
    res.status(200).json({
        success: true,
        tpas,
        message: "TPAs name and Id fetched successfully"
    });
});
// -------------- fetch all TPAs ------------

// -------------- fetch all insurance companies ------------
exports.getAllInsuranceCompaniesNameId = asyncHandler(async (req, res, next) => {
    const insurnaceCompanies = await InsuranceCompany.find().select('name');
    res.status(200).json({
        success: true,
        insurnaceCompanies,
        message: "InsuranceCompanies name and Id fetched successfully"
    });
});
// -------------- fetch all insurance companies ------------

// -------------- fetch all hospitals ------------
exports.getAllHospitalsNameId = asyncHandler(async (req, res, next) => {
    const hospitals = await Hospital.find().select('name');
    res.status(200).json({
        success: true,
        hospitals,
        message: "Hospitals name and Id fetched successfully"
    });
});
// -------------- fetch all hospitals ------------

// -------------- get all TPANames names & ids -----------
exports.getAllTPANamesData = asyncHandler(async (req, res, next) => {
    const tpaNameNames = await TPANames.find().select('name');
    res.status(200).json({
        success: true,
        tpaNameNames,
        message: "TPANames name and Id fetched successfully"
    });
});
// -------------- get all TPANames names & ids -----------

// -------------- get all InsuranceCompaniesNames names & ids -----------
exports.getAllInsuranceCompanyNamesData = asyncHandler(async (req, res, next) => {
    const insuranceCompanyNames = await InsuranceCompanyNames.find().select('name');
    res.status(200).json({
        success: true,
        insuranceCompanyNames,
        message: "InsuranceCompanyNames name and Id fetched successfully"
    });
});
// -------------- get all InsuranceCompaniesNames names & ids -----------