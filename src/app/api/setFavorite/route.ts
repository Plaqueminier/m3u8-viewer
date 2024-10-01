import { NextRequest, NextResponse } from "next/server";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { verifyAuth } from "@/utils/auth";

function getDbConnection(): Promise<Database> {
  return open({
    filename: process.env.DATABASE_PATH!,
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResponse = verifyAuth();
  if (authResponse) {
    return authResponse;
  }

  const { key } = await request.json();

  if (!key) {
    return NextResponse.json(
      { error: "Video key is required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDbConnection();
    const video = await db.get(
      "SELECT favorite FROM videos WHERE key = ?",
      key
    );

    if (!video) {
      await db.close();
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const newFavoriteStatus = !video.favorite;
    await db.run(
      "UPDATE videos SET favorite = ? WHERE key = ?",
      newFavoriteStatus ? 1 : 0,
      key
    );
    await db.close();

    return NextResponse.json({ favorite: newFavoriteStatus });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
