import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";

export async function GET(): Promise<NextResponse> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    const folders = new Set<string>();
    response.CommonPrefixes?.forEach((object) => {
      if (object.Prefix) {
        const parts = object.Prefix.split("/");
        if (parts.length > 1 && parts[0] !== "previews") {
          folders.add(parts[0]);
        }
      }
    });

    return NextResponse.json({
      models: Array.from(folders).map((model) => ({ name: model, key: model })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing models:", error);
    return NextResponse.json(
      { error: "Failed to list models" },
      { status: 500 }
    );
  }
}
