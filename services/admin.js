const router = require("express").Router();
const isAdmin = require('../middleware/isAdmin');

router.route("/").get((req, res) => {
    res.render("admin/signin");
});

router.route("/dashboard").get(isAdmin, (req, res) => {
    res.render("admin/index");
});

router.route("/update-password").get(isAdmin, (req, res) => {
    res.render("admin/update-password");
});
router.route("/update-profile").get(isAdmin, (req, res) => {
    res.render("admin/update-profile");
});

router.route("/hospital-request").get(isAdmin, (req, res) => {
    res.render("admin/Request/hospital-request");
});

router.route("/insurance-company-request").get(isAdmin, (req, res) => {
    res.render("admin/Request/insurance-company-request");
});

router.route("/tpa-request").get(isAdmin, (req, res) => {
    res.render("admin/Request/tpa-request");
});

router.route("/hospital-details").get(isAdmin, (req, res) => {
    res.render("admin/Details/hospital-details");
});

router.route("/insurance-co-details").get(isAdmin, (req, res) => {
    res.render("admin/Details/insurance-co-details");
});

router.route("/tpa-details").get(isAdmin, (req, res) => {
    res.render("admin/Details/tpa-details");
});

router.route("/subscriptions").get(isAdmin, (req, res) => {
    res.render("admin/subscriptions");
});
router.route("/compose").get( (req, res) => {
    res.render("admin/email/compose");
});
router.route("/email-sent").get( (req, res) => {
    res.render("admin/email/email-sent");
});

module.exports = router