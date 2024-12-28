import {connect} from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import bcryptjs from 'bcryptjs'
import {NextRequest, NextResponse} from 'next/server'
import { sendEmail } from '@/helpers/mailer'

connect()

export async function POST(request: NextRequest){

    try {
       const reqBody =  await request.json() 
       const {username, email, password} = reqBody

       console.log(reqBody);

       const user = await User.findOne({email})
       if(user){
        return NextResponse.json({error: "user already exists"},{status:400})
       }

       const salt = await bcryptjs.genSalt(10);
       const hashedPassword = await bcryptjs.hash(password, salt)

       const newUser = new User({
        username,
        email,
        password: hashedPassword
       })
       const savedUser = await newUser.save()
       console.log(savedUser);

       await sendEmail({email, emailType: "VERIFY", userId: savedUser._id})

       return NextResponse.json({
        message: "user registered successfully",
        success: true,
        savedUser
       })
       
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({error: errorMessage},{status:500})
    }
}