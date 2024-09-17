import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VideoThumbnail from "./VideoThumbnail";

interface ElementCardProps {
  name: string;
  previewUrl?: string;
  fullVideoUrl?: string;
  onClick?: () => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  name,
  previewUrl,
  fullVideoUrl,
  onClick,
}) => {
  const handleFullVideoClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.stopPropagation();
    if (fullVideoUrl) {
      window.open(fullVideoUrl, "_blank");
    }
  };

  return (
    <Card
      className="w-full mb-4 cursor-pointer hover:bg-zinc-700 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      {previewUrl && (
        <CardContent>
          <VideoThumbnail videoUrl={previewUrl} />
        </CardContent>
      )}
      {fullVideoUrl && (
        <CardFooter>
          <Button onClick={handleFullVideoClick} className="w-full">
            Open Full Video
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
