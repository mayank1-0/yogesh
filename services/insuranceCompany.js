const router = require("express").Router();
const isInsuranceCompany = require('../middleware/isInsuranceCompany');

router.route("/dashboard").get(isInsuranceCompany, (req,res)=>{
    const insuranceCompany = req.insuranceCompany;
    res.render("InsuranceCompany/insurance-company-dashboard", {
        insuranceCompanyName: insuranceCompany.name.name
    });
});

router.route("/update-password").get(isInsuranceCompany, (req,res)=>{
    const insuranceCompany = req.insuranceCompany;
    res.render("InsuranceCompany/update-password", {
        insuranceCompanyName: insuranceCompany.name.name
    });
});


module.exports = router