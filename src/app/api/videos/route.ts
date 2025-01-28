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
  date: string;
  key: string;
  size: number;
  lastModified: Date;
  favorite: boolean;
  prediction: string;
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
  isFavorites: boolean,
  showUnseen: boolean,
  sortBy: "date" | "quality" | "size" = "date",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{ videos: Video[]; totalCount: number }> {
  const db = await getDbConnection();

  let query = "SELECT * FROM videos";
  let countQuery = "SELECT COUNT(*) as count FROM videos";
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (modelName) {
    conditions.push("key LIKE ?");
    params.push(`${modelName}/%`);
  }
  if (isFavorites) {
    conditions.push("favorite = 1");
  }
  if (showUnseen) {
    conditions.push("seen IS NULL");
  }

  if (conditions.length > 0) {
    const whereClause = conditions.join(" AND ");
    query += ` WHERE ${whereClause}`;
    countQuery += ` WHERE ${whereClause}`;
  }

  // Add ORDER BY clause based on sortBy and sortOrder
  switch (sortBy) {
  case "quality":
    // Calculate prediction quality as percentage of '1's and order by it
    query += ` ORDER BY (
        CAST(LENGTH(REPLACE(prediction, '0', '')) AS FLOAT) / 
        CAST(NULLIF(LENGTH(prediction), 0) AS FLOAT)
      ) ${sortOrder === "asc" ? "ASC" : "DESC"} NULLS LAST`;
    break;
  case "size":
    query += ` ORDER BY size ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    break;
  default: // date
    query += ` ORDER BY lastModified ${sortOrder === "asc" ? "ASC" : "DESC"}`;
  }

  // Add secondary sort by lastModified if not already sorting by date
  if (sortBy !== "date") {
    query += ", lastModified DESC";
  }

  query += " LIMIT ? OFFSET ?";
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
  const showUnseen = searchParams.get("unseen") === "true";
  const sortBy = (searchParams.get("sortBy") || "date") as
    | "date"
    | "quality"
    | "size";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  try {
    const { videos, totalCount } = await fetchVideosFromDb(
      modelName,
      page,
      isFavorites,
      showUnseen,
      sortBy,
      sortOrder
    );

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

        const dateTimeMatch = video.key.match(
          /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/
        );
        const date = dateTimeMatch
          ? dateTimeMatch[0]
              .replace(/_/, " ")
              .replace(/(?<=\s)\d{2}-\d{2}-\d{2}/g, (time) =>
                time.replace(/-/g, ":")
              )
          : format(video.lastModified, "yyyy-MM-dd HH:mm:ss");

        return {
          ...video,
          name: video.name,
          date,
          previewPresignedUrl,
          fullVideoPresignedUrl,
          favorite: video.favorite,
          prediction: video.prediction,
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
