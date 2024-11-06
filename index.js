const express = require("express");
const path = require("path");
const welcomeRouter = require("./services/welcome");
const adminRouter = require("./services/admin");
const tpaRouter = require("./services/tpa");
const insuranceCompanyRouter = require("./services/insuranceCompany");
const welcomeApiRouter = require("./routes/welcome");
const ErrorMiddleware = require("./middleware/ErrorMiddleware");
const adminRoutes = require("./routes/admin");
const tpaApiRoutes = require("./routes/tpa");
const insuranceCompanyApiRoutes = require('./routes/insuranceCompany');
const hospitalApiRoutes = require('./routes/hospital');
const emailApiRoutes = require('./routes/email');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

app.set('view engine', 'ejs');
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/summernote')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.baseUrl = process.env.URL;
    next();
});

app.use(function (req, res, next) {
    res.set("Cache-Control", "private, no-cache, no-store, must-revalidate"); //means browser will not store data in cache(history) i.e when we press back or forward button in browser, it will not take us to previous page.
    next();
});

// ------ all welcome page rendering routes ------
app.use(welcomeRouter);
// ------ all welcome page rendering routes ------

// ------ all admin page rendering routes ------
app.use('/admin', adminRouter);
// ------ all admin page rendering routes ------

// ------ all admin page rendering routes ------
app.use('/tpa', tpaRouter);
// ------ all admin page rendering routes ------

// ------ all admin page rendering routes ------
app.use('/insurance-company', insuranceCompanyRouter);
// ------ all admin page rendering routes ------

// ----- all admin related apis -----
app.use('/api/admin', adminRoutes);
// ----- all admin related apis -----

// ------ all welcome page rendering routes ------
app.use('/api/welcome', welcomeApiRouter);
// ------ all welcome page rendering routes ------

// ----- all tpa related apis -----
app.use('/api/tpa', tpaApiRoutes);
// ----- all admin related apis -----

// ----- all insuranceCompany related apis -----
app.use('/api/insuranceCompany', insuranceCompanyApiRoutes);
// ----- all insuranceCompany related apis -----

// ----- all hospital related apis -----
app.use('/api/hospital', hospitalApiRoutes);
// ----- all hospital related apis -----

// ----- all email related apis -----
app.use('/api/email', emailApiRoutes);
// ----- all email related apis -----

app.use(ErrorMiddleware)

module.exports = app