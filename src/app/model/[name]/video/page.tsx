"use client";

import { ReactNode, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import VideoThumbnail from "@/components/VideoThumbnail";
import Loader from "@/components/Loader";

interface Props {
  params: { name: string };
}

interface VideoData {
  key: string;
  title: string;
  date: string;
  fileSize: string;
  presignedUrl: string;
}

interface PreviewData {
  urls: string[];
}

const fetchVideoData = async (key: string): Promise<VideoData> => {
  const response = await fetch(`/api/video?key=${encodeURIComponent(key)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video data");
  }
  return response.json();
};

const fetchPreviews = async (key: string): Promise<PreviewData> => {
  const response = await fetch(`/api/previews?key=${encodeURIComponent(key)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch previews");
  }
  return response.json();
};

export default function VideoShowcase({
  params: { name },
}: Props): ReactNode {
  const [currentPreview, setCurrentPreview] = useState(0);
  const searchParams = useSearchParams();
  const videoKey = searchParams.get("key");

  const {
    data: videoData,
    error: videoError,
    isLoading: isVideoLoading,
  } = useQuery<VideoData>({
    queryKey: ["video", videoKey],
    queryFn: () => fetchVideoData(videoKey!),
    enabled: !!videoKey,
  });

  const {
    data: previewData,
    error: previewError,
    isLoading: isPreviewLoading,
  } = useQuery<PreviewData>({
    queryKey: ["previews", videoKey],
    queryFn: () => fetchPreviews(videoKey!),
    enabled: !!videoKey,
  });

  const nextPreview = (): void => {
    if (previewData) {
      setCurrentPreview((prev) => (prev + 1) % previewData.urls.length);
    }
  };

  const prevPreview = (): void => {
    if (previewData) {
      setCurrentPreview(
        (prev) => (prev - 1 + previewData.urls.length) % previewData.urls.length
      );
    }
  };

  if (isVideoLoading || isPreviewLoading) {
    return <Loader />;
  }

  if (videoError || previewError) {
    return <div>Error loading video data or previews</div>;
  }

  if (!videoData) {
    return <div>No video data available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/model/${name}`}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to model
      </Link>

      <Card className="w-full mb-8 h-48">
        <div className="flex h-full max-h-full">
          <div className="flex-grow">
            <CardHeader>
              <CardTitle>{videoData.title}</CardTitle>
              <div className="text-sm text-gray-500">
                <p>Date: {videoData.date}</p>
                <p>Size: {videoData.fileSize}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a
                  href={videoData.presignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video
                </a>
              </Button>
            </CardContent>
          </div>
          <div className="w-1/3 flex items-center justify-center p-4 h-full">
            {previewData && previewData.urls.length > 0 && (
              <VideoThumbnail videoUrl={previewData.urls[0]} />
            )}
          </div>
        </div>
      </Card>

      {previewData && previewData.urls.length > 0 && (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentPreview * 100}%)` }}
            >
              {previewData.urls.map((preview, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <video
                    src={preview}
                    className="w-full h-auto object-cover rounded-lg"
                    controls
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-2 transform -translate-y-1/2"
            onClick={prevPreview}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-2 transform -translate-y-1/2"
            onClick={nextPreview}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
