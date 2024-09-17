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
    const previewUrls = [];
    for (let i = 1; i <= 10; i++) {
      const segmentKey = `previews/${videoKey.slice(
        videoKey.indexOf("/") + 1,
        videoKey.lastIndexOf(".")
      )}/segment_${i.toString().padStart(2, "0")}.mp4`;

      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: segmentKey,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      }); // URL expires in 1 hour

      previewUrls.push(presignedUrl);
    }

    return NextResponse.json({ urls: previewUrls });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error retrieving preview videos:", error);
    return NextResponse.json(
      { error: "Failed to retrieve preview videos" },
      { status: 500 }
    );
  }
}
