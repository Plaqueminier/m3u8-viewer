import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuth } from "@/utils/auth";
import { closeDb, getDb } from "../utils";

interface VideoData {
  favorite: number;
  prediction: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResponse = verifyAuth();
  if (authResponse) {
    return authResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const videoKey = searchParams.get("key");

  if (!videoKey) {
    return NextResponse.json(
      { error: "Video key is required" },
      { status: 400 }
    );
  }

  try {
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: videoKey,
    });

    const headResponse = await s3Client.send(headCommand);

    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: videoKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });

    const db = getDb();
    const videoData = db.prepare(
      "SELECT favorite, prediction FROM videos WHERE key = ?"
    ).get(videoKey) as VideoData | undefined;

    const nameParts = videoKey
      .substring(videoKey.lastIndexOf("/") + 1)
      .split("-");
    const username = nameParts[0].replace(/_/g, " ");
    const firstTimestamp = `${nameParts[1]}-${nameParts[2]}-${nameParts[3]}_${nameParts[4]}-${nameParts[5]}`;

    closeDb();
    return NextResponse.json({
      key: videoKey,
      title: `${username} ${firstTimestamp}`,
      date: headResponse.LastModified?.toISOString().split("T")[0] || "Unknown",
      fileSize: formatFileSize(headResponse.ContentLength || 0),
      presignedUrl,
      favorite: videoData?.favorite === 1,
      prediction: videoData?.prediction || "0".repeat(100)
    });
  } catch (error) {
    closeDb();
    // eslint-disable-next-line no-console
    console.error("Error retrieving video data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve video data" },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
