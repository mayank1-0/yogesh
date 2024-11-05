const asyncHandler = require("../middleware/asyncHandler");
const Admin = require("../models/admin");
const mongoose = require("mongoose")
require("dotenv").config()

const admininitialize = asyncHandler(async () => {
  await mongoose.connect(process.env.DB_URI).then(()=>{
    console.log("db Connected")
  }).catch((err)=>{
    console.log("db not connected")
    process.exit(1)
  })
    const findAdminByAlreadyAxist = await Admin.find({email: "admin@gmail.com"})
    if(findAdminByAlreadyAxist.length !==0) {
      console.log("Admin Already exist")
      process.exit(1)

    }
    await Admin.create({
        name:"admin",
        email:"admin@gmail.com",
        password:"12345678",
        mobile:1234567890,
        })
    console.log("admin init Successfully \n admin Infomation \n name=>admin\n email=>admin@gmail.com\npassword=>sag@123456")
    process.exit(1)
});


module.exports = admininitialize;