'use client'

import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
    const [token, setToken] = useState<string>("")
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState(false)
    const searchParams = useSearchParams() // Access query parameters

    const verifyUserEmail = async (token: string) => {
        try {
            await axios.post("/api/users/verifyemail", { token })
            setVerified(true)
            setError(false)
        } catch (err) {
            setError(true)
            console.error(err || "An error occurred during verification")
        }
    }

    useEffect(() => {
        setError(false)
        const urlToken = searchParams.get('token') // Get the `token` query parameter
        if (urlToken) {
            setToken(urlToken) // Set the token
        }
    }, [searchParams])

    useEffect(() => {
        setError(false)
        if (token) {
            verifyUserEmail(token) // Call API only if token is set
        }
    }, [token])

    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-2">
            <div className="text-3xl font-thin">Verify Email</div>
            <div>{token ? `Token: ${token}` : "No token provided"}</div>
            {verified && (
                <div>
                    Email Verified Successfully!
                    <Link href="/login" className="ml-2 text-blue-500">
                        Login
                    </Link>
                </div>
            )}
            {error && <div className="text-red-500">Error verifying email. Please try again.</div>}
        </div>
    )
}
