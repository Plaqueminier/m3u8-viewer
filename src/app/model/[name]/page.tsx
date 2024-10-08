"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { VideoList } from "@/components/VideoList";
import withAuth from "../../hocs/withAuth";

interface ModelPageProps {
  params: { name: string };
}

function ModelPage({ params: { name } }: ModelPageProps): ReactNode {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-zinc-800 text-white">
      <h1 className="text-3xl font-bold mb-8">Videos for {name}</h1>
      <button
        className="mb-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        onClick={() => router.back()}
      >
        Back
      </button>
      <VideoList modelName={name} />
    </main>
  );
}

export default withAuth(ModelPage as React.ComponentType);
