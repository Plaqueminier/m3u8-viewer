"use client";
import { useQuery } from "@tanstack/react-query";
import { ElementCard } from "./ElementCard";
import Loader from "./Loader";

export interface Model extends Element {
  name: string;
}

const fetchModels = async (): Promise<Model[]> => {
  const response = await fetch("/api/models");
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  const data = await response.json();
  return data.models;
};

export const ModelList: React.FC = () => {
  const {
    data: models,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
  });

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <p>Error: {(error as Error).message}</p>;
  }

  return (
    <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {models?.map((model) => (
        <ElementCard
          key={model.name}
          name={model.name}
          href={`/model/${model.name}`}
        />
      ))}
    </div>
  );
};
