"use client";

import withAuth from "@/app/hocs/withAuth";
import { VideoList } from "@/components/VideoList";
import { ReactNode } from "react";

function FavoritesPage(): ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-zinc-800 text-white">
      <h1 className="text-3xl font-bold mb-8">Favorite Videos</h1>
      <VideoList isFavorites={true} />
    </main>
  );
}

export default withAuth(FavoritesPage);
