const router = require("express").Router();
const isTPA = require('../middleware/isTPA');

router.route("/dashboard").get(isTPA, (req,res)=>{
    const tpa = req.tpa;
    res.render("Tpa/tpa-dashboard", {
        tpaName: tpa.name.name
    });
});

router.route("/update-password").get(isTPA, (req,res)=>{
    const tpa = req.tpa;
    res.render("Tpa/update-password", {
        tpaName: tpa.name.name
    });
});

module.exports = router