'use client'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function SignupPage() {
    const [loading, setloading] = useState(false)
    const router = useRouter()
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: ""
    })
    const [isDisabled, setIsDisabled] = useState(true)

    const onSignup = async() => {
        try {
            setloading(true)
            const response = await axios.post(
                '/api/users/signup',
                user
            )
            console.log(response.data);
            router.push('/login')
            setloading(false)
        } catch (error:any) {
            console.log(error);
            toast.error(error.response.data.error || "something unexpected happened")
            setloading(false)
        }
    }

    useEffect(()=>{
        if(user.username.length>0 && user.email.length>0 && user.password.length>0){
            setIsDisabled(false)
        }else{
            setIsDisabled(true)
        }
    },[user])
  return (
    <div className='flex space-y-3 flex-col justify-center items-center min-h-screen'>
      <div>
        {loading?"processing":"signup form"}
      </div>
      <input 
      id='username'
      value={user.username}
      onChange={(e) => setUser({...user, username:e.target.value})}
      placeholder='username'
      className='rounded-md text-black p-1'
      type="text" />

    <input 
      id='email'
      value={user.email}
      onChange={(e) => setUser({...user, email:e.target.value})}
      placeholder='Email'
      className='rounded-md text-black p-1'
      type="text" />

    <input 
      id='password'
      value={user.password}
      onChange={(e) => setUser({...user, password:e.target.value})}
      placeholder='password'
      className='rounded-md text-black p-1'
      type="password" />

    <button
      onClick={onSignup}
      disabled={isDisabled}
      className='rounded-md bg-slate-400 p-2 text-black'>
          {isDisabled?"Signup(disabled)":"SignUp"}
    </button>
      
    </div>
    
  )
}


