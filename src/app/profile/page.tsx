'use client'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const router = useRouter()
    const [data, setData] = useState<any>(null)

    const getUserData = async() => {
       try {
         const response = await axios.post('/api/users/me')
         console.log(response.data);
         setData(response.data.data)
       } catch (error) {
        
       }
    }
    console.log(data);
    
    const logout = async() => {
        try {
            await axios.post('/api/users/logout')
            toast.success("logout success")
            router.push('/login')

        } catch (error:any) {
            console.log(error);
            toast.error(error.message)
        }
    }
  return (
    <div className='flex flex-col justify-center items-center min-h-screen'>
        <div>
            Profile Page
        </div>
        <div>
            {data === null ? "no data" : <Link href={`/profile/${data._id}`}>{data._id} here</Link>}
        </div>
        <button 
        className='bg-blue-400 p-2 rounded-md'
        onClick={logout}>
            logout
        </button>

        <button 
        className='bg-green-400 p-2 rounded-md'
        onClick={getUserData}>
            user data
        </button>
      
    </div>
  )
}


