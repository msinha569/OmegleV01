import {connect} from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import { NextResponse,NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/helpers/mailer'

connect()

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        console.log(reqBody);
        
        const {email, password} = reqBody
        const user = await User.findOne({email})

        if(!user){
            return NextResponse.json({error: "user does not exist"})
        }
        console.log("user exists");

        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            return NextResponse.json({error: "check your credentials"},{status:400})
        }

        if(!user?.isVerified){
            await sendEmail({email, emailType: "VERIFY", userId: user._id})

            return NextResponse.json({error: "user not verified yet"},{status:400})
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!,{expiresIn: '1h'})

        const response = NextResponse.json({
            message: "logged in success",
            success: true
        })
        response.cookies.set("token",token,{
            httpOnly:true
        })

        return response
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({error: errorMessage},{status:500})
    }
}