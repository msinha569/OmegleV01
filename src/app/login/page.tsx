'use client'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [loading, setloading] = useState(false)
    const [forgotPassword, setForgotPassword] = useState(false)
    const router = useRouter()
    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const [isDisabled, setIsDisabled] = useState(true)

    const forgotPasswordhandler = async() => {
      try {
        console.log(user.email);  
        const response = await axios.post('/api/users/login/forgotpassword',{email: user.email})
        console.log(response);
        toast.success("check your mail")
      } catch (error:any) {
        console.log(error);
        
      }
    }

    const onLogin = async() => {
        try {
            setloading(true)
            const response = await axios.post(
                '/api/users/login',
                user
            )
            console.log({email: user.email});
            router.push('/profile')
            setloading(false)
        } catch (error:any) {
            console.log(error.response.data.error);
            if (error.response.data.error==="user not verified yet"){
              router.push('/verifyemail')
            }else if (error.response.data.error==="check your credentials"){
              setForgotPassword(true)
            }
            setloading(false)
        }
    }

    useEffect(()=>{
        if( user.email.length>0 && user.password.length>0){
            setIsDisabled(false)
        }else{
            setIsDisabled(true)
        }
    },[user])
  return (
    <div className='flex space-y-3 flex-col justify-center items-center min-h-screen'>
      <div>
        {loading?"processing":"login form"}
      </div>
     
    <input 
      id='email'
      value={user.email}
      onChange={(e) => setUser({...user, email:e.target.value})}
      placeholder='Email'
      className='rounded-md text-black p-1'
      type="text" />
    <div>
      <input 
        id='password'
        value={user.password}
        onChange={(e) => setUser({...user, password:e.target.value})}
        placeholder='username'
        className='rounded-md text-black p-1'
        type="password" />
        {
        forgotPassword && (
        <button
        onClick={forgotPasswordhandler}
        className='text-red-500'>
          forgot password
        </button>
        )
        }
    </div>
    <button
    onClick={onLogin}
    disabled={isDisabled}
    className='rounded-md bg-slate-400 p-2 text-black'>
        {isDisabled?"Login(disabled)":"LogIn"}
    </button>
      
    </div>
    
  )
}


