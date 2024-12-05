import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getDbConnection } from "../../setFavorite/route";
import { s3Client } from "@/utils/s3Client";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      })
    );

    // Delete from SQLite
    const db = await getDbConnection();

    await db.run("DELETE FROM videos WHERE key = ?", key);

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error to server logs without using console
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete video: ${errorMessage}` },
      { status: 500 }
    );
  }
}
