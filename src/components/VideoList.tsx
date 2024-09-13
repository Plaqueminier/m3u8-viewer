import { useQuery } from "@tanstack/react-query";
import { ElementCard } from "./ElementCard";
import Loader from "./Loader";

export interface Video extends Element {
  name: string;
  key: string;
  size: number;
  previewPresignedUrl: string;
  fullVideoPresignedUrl: string;
}

interface VideoListProps {
  modelName: string;
  onVideoClick: (video: Video) => void;
}

const fetchVideos = async (modelName: string): Promise<Video[]> => {
  const response = await fetch(`/api/videos?model=${modelName}`);
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  const data = await response.json();
  return data.videos;
};

export const VideoList: React.FC<VideoListProps> = ({
  modelName,
  onVideoClick,
}) => {
  const {
    data: videos,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["videos", modelName],
    queryFn: () => fetchVideos(modelName),
    enabled: !!modelName,
  });

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <p>Error: {(error as Error).message}</p>;
  }

  return (
    <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos?.map((video) => (
        <ElementCard
          key={video.key}
          name={video.name}
          previewUrl={video.previewPresignedUrl}
          fullVideoUrl={video.fullVideoPresignedUrl}
          onClick={() => onVideoClick(video)}
        />
      ))}
    </div>
  );
};
