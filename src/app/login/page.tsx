'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [forgotPassword, setForgotPassword] = useState<boolean>(false);
    const router = useRouter();
    const [user, setUser] = useState<User>({
        email: "",
        password: ""
    });
    const [isDisabled, setIsDisabled] = useState<boolean>(true);

    const forgotPasswordHandler = async () => {
        try {
            console.log(user.email);
            const response = await axios.post('/api/users/login/forgotpassword', { email: user.email });
            console.log(response);
            toast.success("Check your email");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send forgot password email.");
        }
    };

    const onLogin = async () => {
        try {
            setLoading(true);
            await axios.post('/api/users/login', user);
            console.log({ email: user.email });
            router.push('/profile');
            setLoading(false);
        } catch (error: any) {
            console.error(error.response?.data?.error);
            if (error.response?.data?.error === "user not verified yet") {
                router.push('/verifyemail');
            } else if (error.response?.data?.error === "check your credentials") {
                setForgotPassword(true);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsDisabled(!(user.email.length > 0 && user.password.length > 0));
    }, [user]);

    return (
        <div className="flex space-y-3 flex-col justify-center items-center min-h-screen">
            <div>
                {loading ? "Processing..." : "Login Form"}
            </div>
            <input
                id="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Email"
                className="rounded-md text-black p-1"
                type="text"
            />
            <div>
                <input
                    id="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder="Password"
                    className="rounded-md text-black p-1"
                    type="password"
                />
                {forgotPassword && (
                    <button
                        onClick={forgotPasswordHandler}
                        className="text-red-500"
                    >
                        Forgot Password?
                    </button>
                )}
            </div>
            <button
                onClick={onLogin}
                disabled={isDisabled}
                className="rounded-md bg-slate-400 p-2 text-black"
            >
                {isDisabled ? "Login (Disabled)" : "Login"}
            </button>
        </div>
    );
};

export default LoginPage;
