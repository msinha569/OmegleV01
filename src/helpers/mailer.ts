import User from '@/models/userModel';
import nodemailer, { Transporter } from 'nodemailer';
import bcryptjs from 'bcryptjs';

interface MailOptions {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId?: any;
}

export const sendEmail = async ({ email, emailType, userId }: MailOptions): Promise<nodemailer.SentMessageInfo> => {
  try {
    // Hash token for verification or reset purposes
    const hashedToken = userId
      ? await bcryptjs.hash(userId.toString(), 10)
      : await bcryptjs.hash(email, 10);

    // Update the database based on the email type
    if (emailType === "VERIFY") {
      console.log("Verification email preparation ongoing...");
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000, // 1 hour
      });
    } else if (emailType === "RESET") {
      console.log("Password reset email preparation ongoing...");
      await User.findOneAndUpdate({ email }, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000, // 1 hour
      });
    }

    // Create the transporter object
    const transporter: Transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER || "",
        pass: process.env.MAILTRAP_PASS || "",
      },
    });

    // Generate the email HTML based on the email type
    const verifyHTML = `
      <p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to verify your email
      or copy and paste the link below into your browser.<br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>
    `;

    const resetPasswordHTML = `
      <p>Click <a href="${process.env.DOMAIN}/resetpassword?token=${hashedToken}">here</a> to reset your password
      or copy and paste the link below into your browser.<br>${process.env.DOMAIN}/resetpassword?token=${hashedToken}</p>
    `;

    // Configure mail options
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'msinha569@gmail.com', // Sender address
      to: email, // Receiver email
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password", // Subject
      html: emailType === "VERIFY" ? verifyHTML : resetPasswordHTML,
    };

    // Send the email
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unexpected error occurred while sending the email.");
    }
  }
};
