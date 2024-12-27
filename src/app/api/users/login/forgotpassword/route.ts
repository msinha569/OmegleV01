import { connect } from "@/dbConfig/dbConfig"
import { sendEmail } from "@/helpers/mailer"
import { NextResponse, NextRequest } from "next/server"

connect()

export  async function POST(request:NextRequest) {
    console.log("here");
    
    try {
        console.log("here");
        const reqBody = await request.json()
        const {email} = reqBody
        
        const response = await sendEmail({email:email,emailType:"RESET"})
        return NextResponse.json({message: "success email sent"},{status:201})
    } catch (error:any) {
    return NextResponse.json({error:error.message},{status:500})        
    }
}