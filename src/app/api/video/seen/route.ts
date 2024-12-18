import { NextResponse } from "next/server";
import { getDbConnection } from "../../utils";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const db = await getDbConnection();
    await db.run("UPDATE videos SET seen = DATETIME('now') WHERE key = ?", key);
    await db.close();

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
