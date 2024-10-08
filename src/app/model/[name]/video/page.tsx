"use client";

import { useSearchParams } from "next/navigation";
import VideoShowcase from "@/components/VideoShowcase";
import withAuth from "@/app/hocs/withAuth";
import { ReactNode } from "react";

function ModelVideoPage(): ReactNode {
  const searchParams = useSearchParams();
  const videoKey = searchParams.get("key");
  const name = videoKey?.slice(0, videoKey.indexOf("/"));
  if (!videoKey) {
    return <div>No video key provided</div>;
  }

  return <VideoShowcase videoKey={videoKey} backLink={`/model/${name}`} />;
}

export default withAuth(ModelVideoPage);
