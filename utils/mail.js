const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
  // 1, create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2, define the mail option
  const mailOptions = {
    from: 'Adilsha <adilsha1234567@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
    //http :
  };

  // 3, send the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
