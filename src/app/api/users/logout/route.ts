import {connect} from '@/dbConfig/dbConfig'
import { NextResponse } from 'next/server'

connect()

export async function POST(){
    console.log("here");
    
    try {
        const response = NextResponse.json({
            message:"logout successfully",
            success: true
        })
        response.cookies.set("token","",{
            httpOnly: true,
            expires: new Date(0)
        })
        return response
        
    } catch (error) {
        console.log(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({error: errorMessage},{status:500})
    }
}