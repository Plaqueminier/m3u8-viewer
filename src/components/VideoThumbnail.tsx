"use client";
import React, { useState, useEffect } from "react";
import Loader from "./Loader";

interface VideoThumbnailProps {
  videoUrl: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = (): void => {
      video.currentTime = 1;
    };

    video.onseeked = (): void => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setThumbnailUrl(url);
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to create blob from canvas");
        }
      });
    };

    video.onerror = (e): void => {
      // eslint-disable-next-line no-console
      console.error("Error loading video", e);
    };
  }, [videoUrl]);

  return (
    <div className="w-full h-full">
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="Video thumbnail" />
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default VideoThumbnail;
