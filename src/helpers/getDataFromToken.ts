import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string => {
  try {
    const token = request.cookies.get("token")?.value || "";
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined in environment variables");
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET) as JwtPayload;
    if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.id) {
      throw new Error("Invalid token");
    }

    return decodedToken.id as string;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`JWT error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while decoding the token");
  }
};
