"use client";
import { useQuery } from "@tanstack/react-query";
import { ElementCard } from "./ElementCard";
import Loader from "./Loader";
import { Fragment, ReactNode, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Video {
  name: string;
  date: string;
  key: string;
  size: number;
  previewPresignedUrl: string;
  fullVideoPresignedUrl: string;
  favorite: boolean;
  prediction: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
}

interface VideoListProps {
  modelName?: string;
  isFavorites?: boolean;
  sortBy?: "date" | "quality";
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const fetchVideos = async (
  page: number,
  modelName?: string,
  isFavorites?: boolean,
  sortBy: "date" | "quality" = "date"
): Promise<{ videos: Video[]; pagination: PaginationData }> => {
  const url = new URL("/api/videos", window.location.origin);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("sortBy", sortBy);
  if (modelName) {
    url.searchParams.append("model", modelName);
  }
  if (isFavorites) {
    url.searchParams.append("favorites", "true");
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return response.json();
};

export const VideoList = ({
  modelName,
  isFavorites,
  sortBy = "date",
}: VideoListProps): ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const { data, error, isLoading } = useQuery({
    queryKey: ["videos", modelName, isFavorites, page, sortBy],
    queryFn: () => fetchVideos(page, modelName, isFavorites, sortBy),
  });

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    const basePath = isFavorites
      ? "/favorites"
      : modelName
        ? `/model/${modelName}`
        : sortBy === "quality"
          ? "/quality"
          : "/recents";
    router.push(`${basePath}?${newSearchParams.toString()}`);
  };

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <p>Error: {(error as Error).message}</p>;
  }

  const videos = data?.videos || [];
  const pagination = data?.pagination;

  return (
    <Fragment>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <ElementCard
            key={video.key}
            name={video.name}
            date={video.date}
            previewUrl={video.previewPresignedUrl}
            fullVideoUrl={video.fullVideoPresignedUrl}
            href={
              modelName
                ? `/model/${modelName}/video?key=${encodeURIComponent(
                  video.key
                )}`
                : `/video?key=${encodeURIComponent(video.key)}${
                  isFavorites ? "&isFavorite=true" : ""
                }`
            }
            favorite={video.favorite}
            fileSize={formatFileSize(video.size)}
            prediction={video.prediction}
          />
        ))}
      </div>
      {pagination && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            {pagination.totalPages > 5 && page - 2 > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {[...Array(pagination.totalPages)]
              .map((_, i) => i + 1)
              .filter((_, i) => i + 1 >= page - 2 && i + 1 <= page + 2)
              .map((i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePageChange(i)}
                    disabled={page === i}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              ))}
            {pagination.totalPages > 5 && page + 2 < pagination.totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  handlePageChange(Math.min(pagination.totalPages, page + 1))
                }
                disabled={page === pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Fragment>
  );
};
