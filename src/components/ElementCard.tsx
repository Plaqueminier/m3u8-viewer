import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ElementCardProps {
  name: string;
  previewUrl?: string;
  onClick?: () => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  name,
  previewUrl,
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
    </Card>
  );
};
