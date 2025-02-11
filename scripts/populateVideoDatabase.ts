import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../src/utils/s3Client";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

interface Video {
  name: string;
  key: string;
  size: number;
  lastModified: Date;
}

async function fetchAllVideoNames(): Promise<Video[]> {
  let allVideos: Video[] = [];
  let continuationToken: string | undefined;
  let startAfter: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      ContinuationToken: startAfter ? undefined : continuationToken,
      StartAfter: startAfter,
    });

    const response = await s3Client.send(command);

    const contents = response.Contents || [];

    const newVideos = contents
      .filter(
        (object) =>
          object.Key &&
          object.Key.endsWith(".mp4") &&
          !object.Key.startsWith("previews/")
      )
      .map((object) => ({
        name: object.Key!.slice(0, object.Key!.indexOf("/")),
        key: object.Key!,
        size: object.Size ?? 0,
        lastModified: object.LastModified ?? new Date(),
      }));

    allVideos = allVideos.concat(newVideos);
    continuationToken = response.NextContinuationToken;

    if (contents.some((object) => object.Key?.startsWith("previews/"))) {
      startAfter = "previewszz";
    } else if (startAfter) {
      startAfter = undefined;
    }
  } while (continuationToken);

  return allVideos;
}

async function populateDatabase(): Promise<void> {
  const db = new Database(process.env.DATABASE_PATH!);

  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      size INTEGER NOT NULL,
      lastModified INTEGER NOT NULL,
      favorite BOOLEAN DEFAULT 0,
      prediction TEXT DEFAULT '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    )
  `);

  const videos = await fetchAllVideoNames();

  const stmt = db.prepare(
    "INSERT OR REPLACE INTO videos (name, key, size, lastModified) VALUES (?, ?, ?, ?)"
  );

  db.transaction(() => {
    for (const video of videos) {
      stmt.run(video.name, video.key, video.size, video.lastModified.getTime());
    }
  })();

  db.close();

  // eslint-disable-next-line no-console
  console.log(`Populated database with ${videos.length} videos.`);
}

// eslint-disable-next-line no-console
populateDatabase().catch(console.error);
