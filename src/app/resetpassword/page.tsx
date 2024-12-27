'use client'

import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"


export default function ResetPassword(){
    const [pass1, setPass1] = useState("")
    const [pass2, setPass2] = useState("")
    const [error, setError] = useState(true)
    const [token, setToken] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

 

    useEffect(() => {
        const urlToken = searchParams.get("token")
        if(!urlToken){
         setError(true)   
        }else{
            setToken(urlToken)
            setError(false)
        }
    },[searchParams])

    useEffect(() => {
        setError(true)
        if (pass1 === pass2)
            setError(false)
    }, [pass1, pass2])


    const resetPassword = async() => {
        try {
                if (pass1 !== ""){
                    await axios.post("/api/users/resetpassword",{pass1,token})
                }
                else toast.error("password is empty")
                router.push("/profile")
        } catch (error) {
            console.log(error);
            
        }
    }
    return(
        <div className="flex flex-col justify-center items-center p-2">
            <div>
                <input
                className="rounded-md"
                type="password"
                placeholder="enter new password"
                onChange={(e) => setPass1(e.target.value)}
                />
                </div>
                <div>
                 <input
                className="rounded-md"
                type="password"
                placeholder="enter again"
                onChange={(e) => setPass2(e.target.value)}
                />
            </div>
            <button
            disabled = {error}
            onClick={resetPassword}
            className="bg-slate-400 rounded-sm">
                Reset Password
            </button>
        </div>
    )
}