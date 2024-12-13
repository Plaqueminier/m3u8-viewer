"use client";

import { ReactNode } from "react";
import { VideoList } from "@/components/VideoList";
import withAuth from "../hocs/withAuth";

function VideosPage(): ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-zinc-800 text-white">
      <h1 className="text-3xl font-bold mb-8">Videos</h1>
      <VideoList />
    </main>
  );
}

export default withAuth(VideosPage);
