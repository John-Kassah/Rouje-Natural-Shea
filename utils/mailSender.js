import nodemailer from 'nodemailer';

// create a function to send verification email to the user
export const sendVerificationMail = async (userEmail, token) => {

    try {
        // create a transporter object using the nodemailer module that will be used to send the email. transporter is able to connect to the outgoing smtp server and use it send the email.
            console.log('we here')
            const transporter = nodemailer.createTransport({
                service: 'gmail', // use the gmail service to send the email. You may ahve issues with the manaual configuration but for guearanteed gmail configuration, use the service property to set the service to gmail. host and port will be set automatically by service but i just leave them there for clarity. the override has thesame values for the gmail service configuration and the transporter should behave thesame.
                host: process.env.SMTP_SERVER_HOST,
                port: process.env.SMTP_SERVER_PORT,
                secure: false, // true for 465-TLS, false for other ports like 587-STARTTLS
                auth: {
                    user: process.env.AUTHENTICATION_EMAIL,
                    pass: process.env.EMAIL_AUTHENTICATION_PASSWORD
                }
            });
            await transporter.verify(); // verify the connection configuration
            console.log('SMTP server is ready to send emails');
        
         // create the email options that will be used to send the email. The options include the sender, receiver, subject and body of the email
         const mailOptions = {
             from: process.env.AUTHENTICATION_EMAIL,
             to: userEmail,
             subject: 'REST-API Verification Email',
             text: `Hello, kindly click on the following link to verify your email address: ${process.env.ENDPOINT_HOST_URL}/verifyEmail/?token=${token}`,
             html:  `<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color:rgb(41, 54, 71);
      margin: 30px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    .header {
      text-align: center;
      color: #333333;
    }
    .button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      color: #aaaaaa;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1 class="header">Verify Your Email</h1>
    <p>Hello,</p>
    <p>Please click on the following link to verify your email address:</p>
    <p style="text-align: center;">
      <a href="${process.env.ENDPOINT_HOST_URL}/verifyEmail/?token=${token}">Verify Email</a>
    </p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thanks,</p>
    <p>Your Team</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
        }
    
        // send the email using the transporter object and the mailOptions object. The sendMail method takes in the mailOptions object and sends the email to the user. It returns a promise that resolves to an object containing information about the sent email.
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Re-throw error so that the caller can handle it appropriately
    }  
}

