const { createAndSendEmail, fetchSentEmails } = require("../controllers/email");
const router = require("express").Router();
const isAdmin = require('../middleware/isAdmin');


// ------------ create-and-send-email --------------
router.route("/create-and-send-email").post(isAdmin, createAndSendEmail);
// ------------ create-and-send-email --------------

// ------------ fetch-sent-emails -------------------
router.route("/fetch-sent-emails").get(isAdmin, fetchSentEmails);
// ------------ fetch-sent-emails -------------------

module.exports = router;
