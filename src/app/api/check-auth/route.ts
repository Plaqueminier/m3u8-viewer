import { verify, JwtPayload } from "jsonwebtoken";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest): NextResponse {
  const authToken: RequestCookie | undefined = req.cookies.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  try {
    const decoded: JwtPayload | string = verify(
      authToken.value,
      process.env.JWT_SECRET!
    );

    // If you need to check specific properties in the decoded token:
    if (typeof decoded !== "string" && decoded.authorized === true) {
      return NextResponse.json({ message: "Authenticated" }, { status: 200 });
    }
    throw new Error("Invalid token payload");
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
