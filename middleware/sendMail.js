const nodemail = require("nodemailer")

const sendMail = async(option)=>{
    const {email  , message , subject,condidate} = option;

    const transport = await nodemail.createTransport({
        host: process.env.MAIL_SERVICE,
        port: 587,               
        secure: false,
        auth: {
          user: process.env.MAIL_AUTHUSER, 
          pass: process.env.MAIL_PASS, 
        },
      });


    const mailOption = {
        from:process.env.MAIL_AUTHUSER,
        to:condidate && Array.isArray(email) ? email.map(mails => mails.email) : email,
        subject:subject,
        html:message
    }
    await transport.sendMail(mailOption,(err,success)=>{
        if(err){
            console.log("err",err)
        }
        console.log("info",success)
    })
}

module.exports = sendMail