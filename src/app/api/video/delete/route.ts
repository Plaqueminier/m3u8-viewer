import { NextResponse } from "next/server";
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";
import { closeDb, getDb } from "../../utils";

function getPreviewPrefix(key: string): string {
  // Extract the filename without the path
  const filename = key.split("/").pop() || "";
  // Remove the extension
  const nameWithoutExt = filename.replace(".mp4", "");
  return `previews/${nameWithoutExt}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Delete original video from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      })
    );

    // List and delete all preview segments
    const previewPrefix = getPreviewPrefix(key);
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      Prefix: previewPrefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (listedObjects.Contents) {
      // Delete all preview segments
      await Promise.all(
        listedObjects.Contents.map((object) => {
          if (!object.Key) {
            return Promise.resolve();
          }
          return s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET,
              Key: object.Key,
            })
          );
        })
      );
    }

    const db = getDb();
    db.prepare("DELETE FROM videos WHERE key = ?").run(key);
    closeDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    closeDb();
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete video: ${errorMessage}` },
      { status: 500 }
    );
  }
}
