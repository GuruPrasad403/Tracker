import nodemailer from 'nodemailer';
import {email,pass} from '../config/env.js'
async function sendEmail(to,Sub,otp,) {
    try {
        
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Replace with your SMTP host
            port: 465, // Port for secure TLS
            secure: true, // Use SSL/TLS
            auth: {
            user:email , // Your email address
            pass:pass , // Your app password
    },
    tls: {
      rejectUnauthorized: false, // Disable strict TLS verification (use only for debugging)
    },
  });
  
        let info = await transporter.sendMail({
            from: `"Tracker Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject:Sub,
            text: 'Thank you for signing up!',
            html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Toyby</title>
    <style>
        /* Global Styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f7f8fa;
            color: #333;
        }

        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }

        /* Header Section */
        .email-header {
            background: linear-gradient(135deg, #0d47a1, #42a5f5);
            padding: 20px;
            text-align: center;
            color: #fff;
        }

        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .email-header p {
            margin: 5px 0 0;
            font-size: 14px;
            letter-spacing: 0.5px;
        }

        /* Content Section */
        .email-content {
            padding: 30px;
        }

        .email-content h2 {
            margin-top: 0;
            font-size: 24px;
            color: #0d47a1;
        }

        .email-content p {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin: 10px 0;
        }

        .email-content .otp {
            display: inline-block;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #0d47a1;
            letter-spacing: 6px;
            background-color: #f0f4fc;
            padding: 10px 20px;
            border-radius: 8px;
            border: 2px dashed #0d47a1;
        }

        /* Footer Section */
        .email-footer {
            padding: 20px;
            background-color: #f7f8fa;
            text-align: center;
            font-size: 14px;
            color: #888;
            border-top: 1px solid #e5e7eb;
        }

        .email-footer a {
            color: #0d47a1;
            text-decoration: none;
            font-weight: bold;
        }

        .email-footer a:hover {
            text-decoration: underline;
        }

        /* Responsive Design */
        @media only screen and (max-width: 600px) {
            .email-content h2 {
                font-size: 20px;
            }

            .email-content .otp {
                font-size: 24px;
                padding: 8px 16px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>Welcome to Tracker!</h1>
            <p>Gain total control of your money</p>
        </div>

        <!-- Content -->
        <div class="email-content">
            <h2>Verify Your Account</h2>
            <p>Dear User,</p>
            <p>We are thrilled to have you join <strong>Tracker</strong>. To get started, please verify your account by using the OTP below:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
            <p>Thank you for choosing <strong>Tracker</strong>.</p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p>&copy; 2024 Tracker. All Rights Reserved.</p>
            <p>
                For any queries, contact us at <a href="mailto:toyby.in@gmail.com">toyby.in@gmail.com</a>
            </p>
        </div>
    </div>
</body>

</html>
`
        });
        
        console.log('Message sent successfully: %s', info.messageId);
        console.log("Message sent to mail :", to)
        return true;
    } catch (error) {
        console.error('Error while sending email:', error);
        return false
    }
}


export default sendEmail;
