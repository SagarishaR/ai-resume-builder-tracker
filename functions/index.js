const {onUserCreated} = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter using Gmail credentials stored in environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Gmail user from .env
    pass: process.env.GMAIL_PASS, // Gmail password from .env
  },
});

// Function to send a welcome email when a user is created
exports.sendWelcomeEmail = onUserCreated(
    {region: "us-central1"},
    async (event) => {
      const user = event.data;

      if (!user.email) {
        logger.error(`No email provided for user: ${user.uid}`);
        return null;
      }

      const email = user.email;
      const username = user.displayName || "User";

      const mailOptions = {
        to: email,
        from: process.env.GMAIL_USER, // Use Gmail address from .env
        subject: "Welcome to Vergonix!",
        text: `Welcome to Vergonix, ${username}! 
        We're excited to have you on board.`,
        html: `<p>Welcome to Vergonix, <strong>${username}</strong>
        !</p><p>We're excited to have you on board.</p>`,
      };

      try {
        // Send the email using Nodemailer
        await transporter.sendMail(mailOptions);
        logger.info(`Welcome email sent to: ${email}`);
      } catch (error) {
        logger.error("Error sending welcome email:", error);
      }

      return null;
    },
);
