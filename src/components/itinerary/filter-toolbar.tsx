"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ActivityType, BookingStatus, Tag } from "@/types";
import { List, LayoutGrid } from "lucide-react";

export type SortOption = "time" | "status" | "priority";

interface FilterToolbarProps {
  filterType: ActivityType | "all";
  onFilterTypeChange: (type: ActivityType | "all") => void;
  filterStatus: BookingStatus | "all";
  onFilterStatusChange: (status: BookingStatus | "all") => void;
  filterTag: Tag | "all";
  onFilterTagChange: (tag: Tag | "all") => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isCompact: boolean;
  onToggleCompact: () => void;
}

export function FilterToolbar({
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  filterTag,
  onFilterTagChange,
  sortBy,
  onSortChange,
  isCompact,
  onToggleCompact,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <Select
        className="h-8 text-xs w-auto min-w-[120px]"
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value as ActivityType | "all")}
      >
        <option value="all">All Types</option>
        <option value="sightseeing">Sightseeing</option>
        <option value="museum">Museum</option>
        <option value="restaurant">Restaurant</option>
        <option value="cafe">Cafe</option>
        <option value="bar">Bar</option>
        <option value="nightclub">Nightclub</option>
        <option value="shopping">Shopping</option>
        <option value="beach">Beach</option>
        <option value="park">Park</option>
        <option value="tour">Tour</option>
        <option value="show">Show</option>
        <option value="transport">Transport</option>
        <option value="transit">Transit</option>
        <option value="rest">Rest</option>
        <option value="free_time">Free Time</option>
        <option value="other">Other</option>
      </Select>

      <Select
        className="h-8 text-xs w-auto min-w-[120px]"
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value as BookingStatus | "all")}
      >
        <option value="all">All Statuses</option>
        <option value="idea">Idea</option>
        <option value="planned">Planned</option>
        <option value="booked">Booked</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="canceled">Canceled</option>
      </Select>

      <Select
        className="h-8 text-xs w-auto min-w-[120px]"
        value={filterTag}
        onChange={(e) => onFilterTagChange(e.target.value as Tag | "all")}
      >
        <option value="all">All Tags</option>
        <option value="food">Food</option>
        <option value="culture">Culture</option>
        <option value="nature">Nature</option>
        <option value="nightlife">Nightlife</option>
        <option value="shopping">Shopping</option>
        <option value="relaxation">Relaxation</option>
        <option value="adventure">Adventure</option>
        <option value="photography">Photography</option>
        <option value="romantic">Romantic</option>
        <option value="family_friendly">Family Friendly</option>
        <option value="must_see">Must See</option>
        <option value="hidden_gem">Hidden Gem</option>
        <option value="local_favorite">Local Favorite</option>
      </Select>

      <Select
        className="h-8 text-xs w-auto min-w-[100px]"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
      >
        <option value="time">Sort: Time</option>
        <option value="status">Sort: Status</option>
        <option value="priority">Sort: Priority</option>
      </Select>

      <div className="ml-auto">
        <Button
          variant={isCompact ? "secondary" : "outline"}
          size="sm"
          className="h-8 text-xs"
          onClick={onToggleCompact}
        >
          {isCompact ? (
            <>
              <List className="h-3.5 w-3.5 mr-1" />
              Compact
            </>
          ) : (
            <>
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Detailed
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
