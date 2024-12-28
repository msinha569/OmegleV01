'use client'

import { Suspense } from 'react'
import VerifyEmailLogic from './components/VerifyEmailLogic'
import Link from 'next/link'

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}

function VerifyEmailContent() {
    const { token, verified, error } = VerifyEmailLogic()

    if (!token) {
        return <div>Loading...</div> // Display this until token is available
    }

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
