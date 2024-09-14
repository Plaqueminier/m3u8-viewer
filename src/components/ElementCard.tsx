import { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [_, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      {previewUrl && (
        <CardContent>
          <video
            ref={videoRef}
            src={previewUrl}
            muted
            loop
            playsInline
            className="w-full h-32 object-cover"
          />
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
