const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Crear un transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      servername: 'smtp.mailtrap.io',
    },
  });
  //Definir las opciones del email

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //Enviar el email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
