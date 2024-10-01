"use client";

import { useSearchParams } from "next/navigation";
import VideoShowcase from "@/components/VideoShowcase";
import { ReactNode } from "react";
import withAuth from "../hocs/withAuth";

function VideoPage(): ReactNode {
  const searchParams = useSearchParams();
  const videoKey = searchParams.get("key");
  const isFavorite = searchParams.get("isFavorite");

  if (!videoKey) {
    return <div>No video key provided</div>;
  }

  return (
    <VideoShowcase
      videoKey={videoKey}
      backLink={isFavorite ? "/favorites" : "/recents"}
    />
  );
}

export default withAuth(VideoPage);
