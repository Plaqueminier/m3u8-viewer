import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JwtPayload, verify } from "jsonwebtoken";

export function verifyAuth(): NextResponse | null {
  const authToken = cookies().get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded: JwtPayload | string = verify(
    authToken,
    process.env.JWT_SECRET!
  );

  if (typeof decoded !== "string" && decoded.authorized === true) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
