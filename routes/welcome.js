const { getAllHospitalsAndExcludedByData, getHospitalexcludedInsuranceAndTPA, getAllTPAsNameId, getAllInsuranceCompaniesNameId, getAllHospitalsNameId, getAllTPANamesData, getAllInsuranceCompanyNamesData } = require("../controllers/welcome.js");
const router = require("express").Router()

//---------- fetch all Hospitals along with excluded by data ---------
router.route("/getAllHospitalsAndExcludedByData").get(getAllHospitalsAndExcludedByData);
//---------- fetch all Hospitals along with excluded by data ---------

// -------- fetch excluded Ins. Comp. and TPA of a given hospital ------------
router.route("/excludedByInsuranceAndTPA/:hospitalId").get(getHospitalexcludedInsuranceAndTPA);
// -------- fetch excluded Ins. Comp. and TPA of a given hospital ------------

//---------- fetch all TPAs ---------
router.route("/getAllTPAsNameId").get(getAllTPAsNameId);
//---------- fetch all TPAs ----InsuranceCompanies

// ---------- fetch all InsuranceCompanies ---------
router.route("/getAllInsuranceCompaniesNameId").get(getAllInsuranceCompaniesNameId);
//---------- fetch all InsuranceCompanies ---------

// ---------- fetch all Hospitals ---------
router.route("/getAllHospitalsNameId").get(getAllHospitalsNameId);
//---------- fetch all Hospitals ---------

// ----------- get all TPANames -------------- 
router.route("/getAllTPANamesIds").get(getAllTPANamesData);
// ----------- get all TPANames --------------

// ----------- get all InsuranceCompanyNames -----------
router.route("/getAllInsuranceCompanyNamesIds").get(getAllInsuranceCompanyNamesData);
// ----------- get all InsuranceCompanyNames -----------

module.exports = router;