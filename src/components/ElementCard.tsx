import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loader from "./Loader";

interface ElementCardProps {
  name: string;
  videoKey?: string;
  onClick?: () => void;
}

const fetchVideoUrl = async (key: string): Promise<string> => {
  const response = await fetch(`/api/previews?key=${key}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video URL");
  }
  const data = await response.json();
  return data.url;
};

export const ElementCard: React.FC<ElementCardProps> = ({ name, videoKey, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { data: videoUrl, isLoading } = useQuery({
    queryKey: ["videoUrl", videoKey],
    queryFn: () => fetchVideoUrl(videoKey!),
    enabled: !!videoKey && isHovered,
  });

  return (
    <Card
      className="w-full mb-4 cursor-pointer hover:bg-zinc-700 transition-colors"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      {videoKey && isHovered && (
        <CardContent>
          {isLoading ? (
            <Loader />
          ) : videoUrl ? (
            <video src={videoUrl} autoPlay muted loop className="w-full h-32 object-cover" />
          ) : null}
        </CardContent>
      )}
    </Card>
  );
};
