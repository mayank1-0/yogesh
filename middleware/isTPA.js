const ErrorHandler = require('./ErrorHandler')
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const TPA = require("../models/TPA");

const isTPA = asyncHandler(async (req, res, next) => {

    const { tpatoken } = req.cookies;
    console.log(tpatoken, "tpatoken")
    if (!tpatoken) {
        return res.status(401).redirect('/');
    }
    const decodedData = await jwt.verify(tpatoken, process.env.JWT_SECRET);
    const findTpa = await TPA.findById(decodedData.id).populate({
        path: 'name',
        select: 'name'
    });

    if (!findTpa) {
        return res.status(401).redirect('/')
    }
    req.tpa = findTpa;
    next();
});

module.exports = isTPA