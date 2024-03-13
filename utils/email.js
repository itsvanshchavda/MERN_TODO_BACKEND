import nodemailer from "nodemailer";

export const sendEmail = async (option) => {
  // Transporter configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  // Email options
  const emailOptions = {
    from: ``,
    to: option.email,
    subject: option.subject,
    text: option.message,
    html: option.html,
    
  };

  try {
    // Send email
    await transporter.sendMail(emailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    // Handle errors
    console.error("Error sending email:", error.message);
    throw error;
  }
};
