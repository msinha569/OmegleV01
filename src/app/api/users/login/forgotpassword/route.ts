import { connect } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import { NextResponse, NextRequest } from "next/server";

// Ensure the database connection is established
connect();

export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log("Received POST request");

    try {
        // Parse the request body
        const reqBody = await request.json() as { email: string };
        const { email } = reqBody;

        // Send reset email
        await sendEmail({ email, emailType: "RESET" });

        // Return success response
        return NextResponse.json({ message: "Email successfully sent" }, { status: 201 });
    } catch (error) {
        // Handle and return error response
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error in POST handler:", errorMessage);

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
