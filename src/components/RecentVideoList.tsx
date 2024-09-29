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
  key: string;
  size: number;
  previewPresignedUrl: string;
  fullVideoPresignedUrl: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
}

const fetchRecentVideos = async (
  page: number
): Promise<{ videos: Video[]; pagination: PaginationData }> => {
  const response = await fetch(`/api/videos?page=${page}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recent videos");
  }
  return response.json();
};

export const RecentVideoList = (): ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  const { data, error, isLoading } = useQuery({
    queryKey: ["recentVideos", page],
    queryFn: () => fetchRecentVideos(page),
  });

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    router.push(`/recents?${newSearchParams.toString()}`);
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
            previewUrl={video.previewPresignedUrl}
            fullVideoUrl={video.fullVideoPresignedUrl}
            href={`/video?key=${encodeURIComponent(video.key)}`}
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
            {pagination.totalPages > 3 && page - 2 > 1 && (
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
            {pagination.totalPages > 3 && page + 2 < pagination.totalPages && (
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
