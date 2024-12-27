import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs'

connect()

export async function POST (request: NextRequest) {
   try {
     const reqBody = await request.json()
     console.log(reqBody);
     
     const { pass1:newPassword, token } = reqBody
     
     const user:any = await  User.findOne({
        forgotPasswordToken: token,
      //  forgotPasswordTokenExpiry: {$gt: Date.now()}
     })
     if(!user){
        return NextResponse.json({error: "validation error. Cant find user"},{status:400})
     }
     console.log(user);
     
     const salt = await bcryptjs.genSalt(10);
     const hashedPassword = await bcryptjs.hash(newPassword, salt)
     console.log(hashedPassword);
     
     user.password = hashedPassword
     user.forgotPasswordToken = undefined
     user.forgotPasswordTokenExpiry = undefined

     await user.save()

     return NextResponse.json({message:"password changed successfully"},{status:201})

   } catch (error) {
    return NextResponse.json({error: "resetting password failed"},{status:500})
   }
}

