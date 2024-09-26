import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VideoThumbnail from "./VideoThumbnail";

export interface Element {
  name: string;
  key: string;
}
interface ElementCardProps {
  name: string;
  previewUrl?: string;
  fullVideoUrl?: string;
  href: string;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  name,
  previewUrl,
  fullVideoUrl,
  href,
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
    <a
      href={href}
      className="block w-full mb-4 no-underline"
    >
      <Card className="w-full cursor-pointer hover:bg-zinc-700 transition-colors">
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
    </a>
  );
};
