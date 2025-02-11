import { NextResponse } from "next/server";
import { getDb } from "../../utils";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const db = getDb();
    db.prepare("UPDATE videos SET seen = DATETIME('now') WHERE key = ?").run(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update seen timestamp: ${errorMessage}` },
      { status: 500 }
    );
  }
}
