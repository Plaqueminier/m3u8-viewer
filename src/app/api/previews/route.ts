import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/utils/s3Client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const videoKey = searchParams.get("key");

  if (!videoKey) {
    return NextResponse.json(
      { error: "Video key is required" },
      { status: 400 }
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: videoKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // URL expires in 1 hour

    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error retrieving video:", error);
    return NextResponse.json(
      { error: "Failed to retrieve video" },
      { status: 500 }
    );
  }
}
