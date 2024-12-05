import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VideoThumbnail from "./VideoThumbnail";
import { Star } from "lucide-react";
import PredictionBar from "./PredictionBar";

export interface Element {
  name: string;
  key: string;
}
interface ElementCardProps {
  name: string;
  date?: string;
  previewUrl?: string;
  fullVideoUrl?: string;
  href: string;
  favorite?: boolean;
  fileSize?: string;
  prediction?: string;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  name,
  date,
  previewUrl,
  fullVideoUrl,
  href,
  favorite,
  fileSize,
  prediction,
}) => {
  const handleFullVideoClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    if (fullVideoUrl) {
      window.open(fullVideoUrl, "_blank");
    }
  };

  return (
    <a href={href} className="block w-full mb-4 no-underline">
      <Card className="w-full cursor-pointer hover:bg-zinc-700 transition-colors">
        <CardHeader>
          <CardTitle>
            <p className="mb-1">{name}</p>
            {date && <p className="text-sm text-zinc-400">{date}</p>}
            {fileSize && <p className="text-sm text-zinc-400">Size: {fileSize}</p>}
            {prediction && <PredictionBar prediction={prediction} />}
            {!!favorite && (
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            )}
          </CardTitle>
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
    </a>
  );
};
