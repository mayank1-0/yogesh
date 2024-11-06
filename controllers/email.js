const asyncHandler = require("../middleware/asyncHandler");
const Email = require("../models/email"); // Import the Email model
const Admin = require("../models/admin"); // Import the Admin model
const Hospital = require("../models/hospital"); // Import the Hospital model
require('dotenv').config();


// Controller method to create and send email
exports.createAndSendEmail = asyncHandler(async (req, res, next) => {
    const { recipient_email, subject, body } = req.body;
    const admin_email = process.env.EMAIL_ADMIN;
    // Step 1: Find Admin by email
    const admin = await Admin.findOne({ email: admin_email });
    if (!admin) {
        return res.status(404).json({ message: "Admin not found with this email" });
    }

    // Step 2: Find Hospital by email
    const hospital = await Hospital.findOne({ email: recipient_email });
    if (!hospital) {
        return res.status(404).json({ message: "Hospital not found with this email" });
    }

    // Step 3: Create the Email document and save to the database
    const email = new Email({
        adminId: admin._id,        // Store adminId
        recipientId: hospital._id, // Store recipientId
        subject,                   // Use the provided subject
        body,                      // Use the provided body
        status: "Draft",           // Set status to "Draft" initially
    });

    // Save the email document
    await email.save();

    // Step 4: Send the email using the model's sendEmail method
    const emailInfo = await email.sendEmail(admin.email, hospital.email);

    // Update the email status to 'Sent' and set the sentAt field
    email.status = "Sent";
    email.sentAt = Date.now();
    await email.save();

    // Respond with success and email info
    res.status(200).json({
        message: "Email sent successfully",
        emailInfo: emailInfo,
        email: email,
    });
});

// Fetch sent emails
exports.fetchSentEmails = asyncHandler(async (req, res, next) => {
    const sentEmails = await Email.getSentEmails(); // Use the method to fetch sent emails
    res.status(200).json({ success: true, sentEmails: sentEmails });
});