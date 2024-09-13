import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface AuthRequestBody {
  password: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { password }: AuthRequestBody = body;
  if (password === process.env.AUTH_PASSWORD) {
    const token: string = sign({ authorized: true }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const cookieOptions: Record<string, string | number | boolean> = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    };

    const response = NextResponse.json(
      { message: "Authenticated successfully" },
      { status: 200 }
    );
    response.cookies.set("auth_token", token, cookieOptions);
    return response;
  }
  return NextResponse.json({ message: "Invalid password" }, { status: 401 });
}
