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
import { VideoControls } from "./VideoControls";

export interface Video {
  name: string;
  date: string;
  key: string;
  size: number;
  previewPresignedUrl: string;
  fullVideoPresignedUrl: string;
  favorite: boolean;
  prediction: string;
  seen: string | null;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
}

interface VideoListProps {
  modelName?: string;
  isFavorites?: boolean;
  sortBy?: "date" | "quality" | "size";
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
  showUnseen?: boolean,
  sortBy: "date" | "quality" | "size" = "date",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{ videos: Video[]; pagination: PaginationData }> => {
  const url = new URL("/api/videos", window.location.origin);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("sortBy", sortBy);
  url.searchParams.append("sortOrder", sortOrder);
  if (modelName) {
    url.searchParams.append("model", modelName);
  }
  if (isFavorites) {
    url.searchParams.append("favorites", "true");
  }
  if (showUnseen) {
    url.searchParams.append("unseen", "true");
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return response.json();
};

export const VideoList = ({
  modelName,
  isFavorites: defaultIsFavorites = false,
  sortBy: defaultSortBy = "date",
}: VideoListProps): ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [sortBy, setSortBy] = useState<"date" | "quality" | "size">(
    (searchParams.get("sortBy") as "date" | "quality" | "size") || defaultSortBy
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [showFavorites, setShowFavorites] = useState(
    searchParams.get("favorites") === "true" || defaultIsFavorites
  );
  const [showUnseen, setShowUnseen] = useState(
    searchParams.get("unseen") === "true"
  );

  const { data, error, isLoading } = useQuery({
    queryKey: ["videos", modelName, showFavorites, showUnseen, page, sortBy, sortOrder],
    queryFn: () =>
      fetchVideos(page, modelName, showFavorites, showUnseen, sortBy, sortOrder),
  });

  const updateUrl = (
    newPage: number,
    sortBy: "date" | "quality" | "size",
    sortOrder: "asc" | "desc"
  ): void => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    newSearchParams.set("sortBy", sortBy);
    newSearchParams.set("sortOrder", sortOrder);
    if (showFavorites) {
      newSearchParams.set("favorites", "true");
    } else {
      newSearchParams.delete("favorites");
    }
    if (showUnseen) {
      newSearchParams.set("unseen", "true");
    } else {
      newSearchParams.delete("unseen");
    }

    const basePath = modelName ? `/model/${modelName}` : "/videos";
    router.push(`${basePath}?${newSearchParams.toString()}`);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    updateUrl(newPage, sortBy, sortOrder);
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
      <VideoControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        showFavorites={showFavorites}
        showUnseen={showUnseen}
        onSortByChange={(value) => {
          setSortBy(value as "date" | "quality" | "size");
          setPage(1);
          updateUrl(1, value as "date" | "quality" | "size", sortOrder);
        }}
        onSortOrderChange={(value) => {
          setSortOrder(value);
          setPage(1);
          updateUrl(1, sortBy, sortOrder);
        }}
        onFavoritesChange={(value) => {
          setShowFavorites(value);
          setPage(1);
          updateUrl(1, sortBy, sortOrder);
        }}
        onUnseenChange={(value) => {
          setShowUnseen(value);
          setPage(1);
          updateUrl(1, sortBy, sortOrder);
        }}
      />

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
                    showFavorites ? "&isFavorite=true" : ""
                  }`
            }
            favorite={video.favorite}
            fileSize={formatFileSize(video.size)}
            prediction={video.prediction}
            seen={video.seen}
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
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Fragment>
  );
};
