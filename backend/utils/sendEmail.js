const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️ SMTP_EMAIL or SMTP_PASSWORD is not defined. Email will not be sent. Logging OTP to console instead.');
    console.log(`\n================ SIMULATED EMAIL ================`);
    console.log(`TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE:\n${options.message}`);
    console.log(`=================================================\n`);
    return;
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'AquaSmart'} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || `<p>${options.message}</p>`,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL] Message sent: %s`, info.messageId);
};

module.exports = sendEmail;
