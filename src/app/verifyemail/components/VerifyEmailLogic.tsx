'use client'
import { useState, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailLogic() {
    const [token, setToken] = useState<string>("")
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState(false)
    const searchParams = useSearchParams()

    // Fetch the token from the URL using `useSearchParams` and update state
    useEffect(() => {
        const urlToken = searchParams.get('token')
        if (urlToken) {
            setToken(urlToken)
        }
    }, [searchParams])

    // Verify email using the token once it's set
    useEffect(() => {
        const verifyUserEmail = async (token: string) => {
            try {
                await axios.post("/api/users/verifyemail", { token })
                setVerified(true)
                setError(false)
            } catch (err) {
                setError(true)
                if (err instanceof AxiosError) {
                    const errorMessage = err.response?.data?.error || "Something unexpected happened"
                    console.error(errorMessage)
                }
            }
        }

        if (token) {
            verifyUserEmail(token)
        }
    }, [token])

    return { token, verified, error }
}
