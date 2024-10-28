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
}

export const ElementCard: React.FC<ElementCardProps> = ({
  name,
  date,
  previewUrl,
  fullVideoUrl,
  href,
  favorite,
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
            <p>{name}</p>
            {date && <p className="text-sm text-zinc-400">{date}</p>}
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
