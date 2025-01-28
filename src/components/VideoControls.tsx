"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StarIcon, EyeIcon } from "lucide-react";

interface VideoControlsProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  showFavorites: boolean;
  showUnseen: boolean;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onFavoritesChange: (value: boolean) => void;
  onUnseenChange: (value: boolean) => void;
}

export function VideoControls({
  sortBy,
  sortOrder,
  showFavorites,
  showUnseen,
  onSortByChange,
  onSortOrderChange,
  onFavoritesChange,
  onUnseenChange,
}: VideoControlsProps): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center">
      <div className="flex gap-2 items-center">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant={showFavorites ? "secondary" : "outline"}
          onClick={() => onFavoritesChange(!showFavorites)}
          className="flex items-center gap-2"
        >
          <StarIcon
            className={showFavorites ? "text-yellow-400" : ""}
            size={16}
          />
          {showFavorites ? "All Videos" : "Favorites Only"}
        </Button>

        <Button
          variant={showUnseen ? "secondary" : "outline"}
          onClick={() => onUnseenChange(!showUnseen)}
          className="flex items-center gap-2"
        >
          <EyeIcon
            className={showUnseen ? "text-blue-400" : ""}
            size={16}
          />
          {showUnseen ? "All Videos" : "Unseen Only"}
        </Button>
      </div>
    </div>
  );
}
