"use client";

import { ReactNode, useState } from "react";
import { Model, ModelList } from "@/components/ModelList";
import { Video, VideoList } from "@/components/VideoList";
import withAuth from "./hocs/withAuth";

function Home(): ReactNode {
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );

  const handleModelClick = (model: Model): void => {
    setSelectedModel(model);
  };

  const handleVideoClick = (video: Video): void => {
    // eslint-disable-next-line no-console
    console.log("Selected video:", video);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-zinc-800 text-white">
      <h1 className="text-3xl font-bold mb-8">
        {selectedModel ? `Videos for ${selectedModel.name}` : "Models"}
      </h1>
      {!selectedModel ? (
        <ModelList onModelClick={handleModelClick} />
      ) : (
        <>
          <button
            className="mb-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
            onClick={() => setSelectedModel(undefined)}
          >
            Back to Models
          </button>
          <VideoList
            modelName={selectedModel.name}
            onVideoClick={handleVideoClick}
          />
        </>
      )}
    </main>
  );
}

export default withAuth(Home);
