import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuth } from "@/utils/auth";

const VIDEOS_PER_PAGE = 12;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResponse = verifyAuth();

  if (authResponse) {
    return authResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const modelName = searchParams.get("model");
  const page = parseInt(searchParams.get("page") || "1", 10);

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

    const contents = response.Contents || [];

    const totalVideos = contents.length;
    const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);

    const videos = contents
      .filter((object) => object.Key && object.Key !== `${modelName}/`)
      .map((object) => {
        const key = object.Key!;
        const nameParts = key.substring(key.lastIndexOf("/") + 1).split("-");
        const username = nameParts[0].replace(/_/g, " ");
        const firstTimestamp =
          nameParts[1] +
          "-" +
          nameParts[2] +
          "-" +
          nameParts[3] +
          "_" +
          nameParts[4] +
          "-" +
          nameParts[5];
        return {
          name: `${username} ${firstTimestamp}`,
          key,
          size: object.Size,
        };
      })
      .sort((a, b) => b.name.localeCompare(a.name));

    const paginatedVideos = videos.slice(
      (page - 1) * VIDEOS_PER_PAGE,
      page * VIDEOS_PER_PAGE
    );

    const previewPresignedUrls = await Promise.all(
      paginatedVideos.map(async (video) => {
        const previewKey = `previews/${video.key.slice(
          video.key.indexOf("/") + 1,
          video.key.lastIndexOf(".")
        )}/segment_01.mp4`;
        const previewCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: previewKey,
        });
        const previewPresignedUrl = await getSignedUrl(
          s3Client,
          previewCommand,
          { expiresIn: 3600 }
        );

        const fullVideoCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: video.key,
        });
        const fullVideoPresignedUrl = await getSignedUrl(
          s3Client,
          fullVideoCommand,
          { expiresIn: 3600 }
        );

        return {
          ...video,
          previewPresignedUrl,
          fullVideoPresignedUrl,
        };
      })
    );

    return NextResponse.json({
      videos: previewPresignedUrls,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing videos:", error);
    return NextResponse.json(
      { error: "Failed to list videos" },
      { status: 500 }
    );
  }
}
