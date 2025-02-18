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

async function fetchAllVideoKeys(): Promise<Video[]> {
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

async function checkMissingVideos(): Promise<void> {
  const db = new Database(process.env.DATABASE_PATH!);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const checkVideo = db.prepare("SELECT 1 FROM videos WHERE key = ?");
  const insertVideo = db.prepare(
    "INSERT INTO videos (name, key, size, lastModified) VALUES (?, ?, ?, ?)"
  );

  try {
    const videos = await fetchAllVideoKeys();
    let missingCount = 0;
    let totalCount = 0;

    // Use a transaction for better performance
    const transaction = db.transaction(async (videos: Video[]) => {
      for (const video of videos) {
        totalCount++;
        const exists = checkVideo.get(video.key);
        if (!exists) {
          insertVideo.run(
            video.name,
            video.key,
            video.size,
            video.lastModified.getTime()
          );
          missingCount++;
          // eslint-disable-next-line no-console
          console.log(`Added missing video: ${video.key}`);
        }
      }
    });

    // Run the transaction
    transaction(videos);

    // eslint-disable-next-line no-console
    console.log(`\nScan complete:`);
    // eslint-disable-next-line no-console
    console.log(`Total videos in R2: ${totalCount}`);
    // eslint-disable-next-line no-console
    console.log(`Missing videos added: ${missingCount}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking for missing videos:", error);
    throw error;
  } finally {
    db.close();
  }
}

// eslint-disable-next-line no-console
checkMissingVideos().catch(console.error);
