require("dotenv").config();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    }
  });

  const verification = (email, type, token, callback) => {
    const url = `https://lofy-backend.herokuapp.com/${type}/verify/${token}`;
    let mailOptions={
        to : email,
        subject : "Lofy: Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+url+">Click here to verify</a>"
    }
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            callback(error,null)
        }else{
            callback(error,{
                message:"Email Sent for account verification"
            })
        }
    });
}

module.exports = verification;
