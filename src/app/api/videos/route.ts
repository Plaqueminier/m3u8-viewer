import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAuth } from "@/utils/auth";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { format } from "date-fns";

const VIDEOS_PER_PAGE = 12;

interface Video {
  id: number;
  name: string;
  key: string;
  size: number;
  lastModified: Date;
  favorite: boolean;
}

function getDbConnection(): Promise<Database> {
  return open({
    filename: process.env.DATABASE_PATH!,
    driver: sqlite3.Database,
  });
}

async function fetchVideosFromDb(
  modelName: string | null,
  page: number,
  isFavorites: boolean
): Promise<{ videos: Video[]; totalCount: number }> {
  const db = await getDbConnection();

  let query = "SELECT * FROM videos";
  let countQuery = "SELECT COUNT(*) as count FROM videos";
  const params: (string | number)[] = [];

  if (modelName) {
    query += " WHERE key LIKE ?";
    countQuery += " WHERE key LIKE ?";
    params.push(`${modelName}/%`);
  }
  if (isFavorites) {
    query += " WHERE favorite = 1";
    countQuery += " WHERE favorite = 1";
  }

  query += " ORDER BY lastModified DESC LIMIT ? OFFSET ?";
  params.push(VIDEOS_PER_PAGE, (page - 1) * VIDEOS_PER_PAGE);

  const videos = await db.all(query, ...params);
  const [{ count }] = await db.all(countQuery, ...params.slice(0, -2));

  await db.close();

  return {
    videos: videos.map((v) => ({
      ...v,
      lastModified: new Date(v.lastModified),
    })),
    totalCount: count,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResponse = verifyAuth();

  if (authResponse) {
    return authResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const modelName = searchParams.get("model");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const isFavorites = searchParams.get("favorites") === "true";

  try {
    const { videos, totalCount } = await fetchVideosFromDb(modelName, page, isFavorites);

    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
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
          name: `${video.name} ${format(video.lastModified, "yyyy-MM-dd HH:mm")}`,
          previewPresignedUrl,
          fullVideoPresignedUrl,
          favorite: video.favorite,
        };
      })
    );

    return NextResponse.json({
      videos: videosWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / VIDEOS_PER_PAGE),
        totalVideos: totalCount,
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
