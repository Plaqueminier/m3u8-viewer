import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/utils/auth";
import { closeDb, getDb } from "../utils";

interface VideoData {
  favorite: number;
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
    const db = getDb();
    const video = db.prepare(
      "SELECT favorite FROM videos WHERE key = ?"
    ).get(key) as VideoData | undefined;

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const newFavoriteStatus = !video.favorite;
    db.prepare(
      "UPDATE videos SET favorite = ? WHERE key = ?"
    ).run(newFavoriteStatus ? 1 : 0, key);

    closeDb();
    return NextResponse.json({ favorite: newFavoriteStatus });
  } catch (error) {
    closeDb();
    // eslint-disable-next-line no-console
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
