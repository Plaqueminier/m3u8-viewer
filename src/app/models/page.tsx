"use client";

import { useRouter } from "next/navigation";
import { Model, ModelList } from "@/components/ModelList";
import withAuth from "../hocs/withAuth";
import { ReactNode } from "react";

function ModelsPage(): ReactNode {
  const router = useRouter();

  const handleModelClick = (model: Model): void => {
    router.push(`/model/${model.name}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-zinc-800 text-white">
      <h1 className="text-3xl font-bold mb-8">Models</h1>
      <ModelList onModelClick={handleModelClick} />
    </main>
  );
}

export default withAuth(ModelsPage);
