import React, { useState, useEffect, useRef } from "react";
import Loader from "./Loader";

interface VideoThumbnailProps {
  videoUrl: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleLoadedData = (): void => {
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedData);
    return (): void => {
      video.removeEventListener("loadedmetadata", handleLoadedData);
    };
  }, [videoUrl]);

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <>
          <Loader />
          <video ref={videoRef} src={videoUrl} muted preload="metadata" className="hidden w-full h-full object-contain" />
        </>
      ) : (
        <video ref={videoRef} src={videoUrl} muted preload="metadata" className="w-full h-full object-contain" />
      )}
    </div>
  );
};

export default VideoThumbnail;
