import {connect} from '@/dbConfig/dbConfig'
import { NextResponse,NextRequest } from 'next/server'

connect()

export async function POST(request: NextRequest){
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
        
    } catch (error:any) {
        console.log(error);
        
        return NextResponse.json({error: error.message},{status:500})
    }
}