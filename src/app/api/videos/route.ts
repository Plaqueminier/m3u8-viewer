import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const modelName = searchParams.get("model");

  if (!modelName) {
    return NextResponse.json(
      { error: "Model name is required" },
      { status: 400 }
    );
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      Prefix: `${modelName}/`,
    });

    const response = await s3Client.send(command);

    const contents = response.Contents?.toReversed().slice(0, 50);

    const videos =
      contents
        ?.filter((object) => object.Key && object.Key !== `${modelName}/`)
        .map((object) => {
          const key = object.Key!;
          return {
            name: key.substring(key.lastIndexOf("/") + 1),
            key,
            size: object.Size,
          };
        })
        .sort((a, b) => b.name.localeCompare(a.name)) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing videos:", error);
    return NextResponse.json(
      { error: "Failed to list videos" },
      { status: 500 }
    );
  }
}
