import nodemailer from 'nodemailer';

// create a function to send verification email to the user
export const sendVerificationMail = async (userEmail, token) => {
  try {
    console.log('we here');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_SERVER_HOST,
      port: process.env.SMTP_SERVER_PORT,
      secure: false,
      auth: {
        user: process.env.AUTHENTICATION_EMAIL,
        pass: process.env.EMAIL_AUTHENTICATION_PASSWORD
      }
    });

    await transporter.verify();
    console.log('SMTP server is ready to send emails');

    const mailOptions = {
      from: process.env.AUTHENTICATION_EMAIL,
      to: userEmail,
      subject: 'Rouje Naturel Shea Verification Email',
      text: `Hello, kindly click on the following link to verify your email address: ${process.env.ENDPOINT_HOST_URL}/verifyEmail/?token=${token}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #0b1220;
      color: #e6eef6;
    }
    .wrap {
      max-width: 600px;
      margin: 28px auto;
      padding: 20px;
      background: linear-gradient(180deg, #272338ff, #0b0f14);
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(4, 10, 38, 0.7);
    }
    .header {
      text-align: center;
      color: #f7fafc;
      font-size: 22px;
      margin-bottom: 18px;
    }
    .content {
      font-size: 15px;
      line-height: 1.6;
      color: #dbebffff;
      text-align: center;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #587bc7ff; /* deeper blue to fit gradient theme */
      color: #ffffff !important;
      font-weight: 600;
      text-decoration: none;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .button:hover {
      background: #1d4ed8; /* slightly darker on hover */
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #7f98b0;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1 class="header">Verify Your Email</h1>
    <div class="content">
      <p>Hello,</p>
      <p>Please click the button below to verify your email address:</p>
      <p>
        <a class="button" href="${process.env.ENDPOINT_HOST_URL}/verifyEmail/?token=${token}">
          Verify Email
        </a>
      </p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,<br/>Rouje Team</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Rouje Naturel Shea. All rights reserved.
    </div>
  </div>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
