"use client";

import Loader from "@/components/Loader";
import { Suspense } from "react";
import withAuth from "../hocs/withAuth";
import { VideoList } from "@/components/VideoList";

function RecentsPage(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Recent Videos</h1>
      <div className="flex-grow flex items-center justify-center flex-col">
        <Suspense fallback={<Loader />}>
          <VideoList />
        </Suspense>
      </div>
    </div>
  );
}

export default withAuth(RecentsPage);
