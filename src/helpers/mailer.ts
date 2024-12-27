import User from '@/models/userModel';
import  nodemailer from 'nodemailer'
import bcryptjs from 'bcryptjs'

interface mail {
    email: string,
    emailType: "VERIFY" | "RESET",
    userId?: any
}


export const sendEmail = async ({email, emailType, userId}:mail) => {
try {

    const hashedToken = userId ? await bcryptjs.hash(userId.toString(), 10) :  await bcryptjs.hash(email, 10)

    if(emailType==="VERIFY"){
        console.log("verification ongoing");
        
        await User.findByIdAndUpdate(userId,
            {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000
            }
        )
    } else if(emailType==="RESET"){
        console.log("reset ongoing");
        
        await User.findOneAndUpdate({email},
            {
                forgotPasswordToken: hashedToken,
                forgotPasswordTokenExpiry: Date.now() + 36000
            }
        )
        
    }

        
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
            }
        });
        const verifyHTML = `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to verify your email
        or copy and paste the link below in your browser.<br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>`

        const resetPassword = `<p>Click <a href="${process.env.DOMAIN}/resetpassword?token=${hashedToken}">here</a> to reset your password
        or copy and paste the link below in your browser.<br>${process.env.DOMAIN}/resetpassword?token=${hashedToken}</p>`


        const mailOptions = {
            from: 'msinha569@gmail.com', // sender address
            to: email, // list of receivers
            subject:  emailType === "VERIFY" ? "Verify your email" : "Reset your password", // Subject line
            html: emailType === "VERIFY"? verifyHTML : resetPassword,
          }

        const mailResponse = await transport.sendMail(mailOptions)
        return mailResponse
    } catch (error:any) {
        throw new Error(error.message)
    }
}