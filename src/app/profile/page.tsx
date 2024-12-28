'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface UserData {
    _id: string;
    [key: string]: any; // For additional user properties if needed
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [data, setData] = useState<UserData | null>(null);

    const getUserData = async () => {
        try {
            const response = await axios.post<{ data: UserData }>('/api/users/me');
            console.log(response.data);
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to fetch user data.");
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/users/logout');
            toast.success("Logout successful");
            router.push('/login');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            console.error("Error during logout:", error);
            toast.error(errorMessage || "Logout failed.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <div>Profile Page</div>
            <div>
                {data === null ? (
                    "No data"
                ) : (
                    <Link href={`/profile/${data._id}`}>
                        {data._id} here
                    </Link>
                )}
            </div>
            <button
                className="bg-blue-400 p-2 rounded-md"
                onClick={logout}
            >
                Logout
            </button>
            <button
                className="bg-green-400 p-2 rounded-md"
                onClick={getUserData}
            >
                Get User Data
            </button>
        </div>
    );
};

export default ProfilePage;
