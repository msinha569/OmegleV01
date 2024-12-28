import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

connect();

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Parse the request body
        const reqBody = await request.json() as { pass1: string; token: string };
        console.log(reqBody);

        const { pass1: newPassword, token } = reqBody;

        // Find the user by the token and ensure token is not expired
        const user = await User.findOne({
            forgotPasswordToken: token,
             forgotPasswordTokenExpiry: { $gt: Date.now() },
        }).exec();

        if (!user) {
            return NextResponse.json(
                { error: "Validation error. Cannot find user." },
                { status: 400 }
            );
        }

        console.log(user);

        // Hash the new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        console.log(hashedPassword);

        // Update the user document
        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;

        await user.save();

        return NextResponse.json(
            { message: "Password changed successfully." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error resetting password:", error);
        const errorMessage = error instanceof Error ? error.message : "Resetting password failed.";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

