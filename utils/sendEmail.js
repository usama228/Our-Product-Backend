const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

// Convert newlines in text to <br> for HTML
const htmlMessage = options.message.replace(/\n/g, '<br>');

const mailOptions = {
  from: `U Dev <${process.env.EMAIL_USERNAME}>`,
  to: options.email,
  subject: options.subject,
  text: options.message, // fallback plain text
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        h1 {
          color: #333333;
          font-size: 24px;
        }
        p {
          color: #555555;
          line-height: 1.6;
        }
        a.button {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        }
        a.button:hover {
          background-color: #45a049;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #999999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${options.subject}</h1>
        <p>${htmlMessage}</p>

        <!-- Login button -->
        <p>
          <a href="${process.env.URL || ''}" class="button">
            Login here for your account
          </a>
        </p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} U Dev. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `,
};

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
