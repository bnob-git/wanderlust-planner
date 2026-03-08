"use client";

import { useState, useMemo } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DayCard } from "@/components/itinerary/day-card";
import {
  FilterToolbar,
  type SortOption,
} from "@/components/itinerary/filter-toolbar";
import {
  ItineraryEmptyState,
} from "@/components/itinerary/loading-skeleton";
import { cn } from "@/lib/utils";
import { formatDate, calculateDaysBetween } from "@/lib/utils";
import type { ActivityType, BookingStatus, Tag, Day } from "@/types";

const cityDotColors = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
];

export function ItineraryView() {
  const { days, cities, activities, getActivitiesForTimeBlock } =
    useTripDataStore();

  const [filterCity, setFilterCity] = useState<string>("all");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set([days[0]?.id])
  );

  // Filter/sort state
  const [filterType, setFilterType] = useState<ActivityType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">(
    "all"
  );
  const [filterTag, setFilterTag] = useState<Tag | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("time");
  const [isCompact, setIsCompact] = useState(false);

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filterType !== "all" || filterStatus !== "all" || filterTag !== "all";

  // Filter days by city
  const filteredDays = useMemo(() => {
    let result =
      filterCity === "all"
        ? [...days]
        : days.filter((d) => d.cityId === filterCity);

    // If activity-level filters are active, only show days that have matching activities
    if (hasActiveFilters) {
      result = result.filter((day) => {
        const dayActivities = day.timeBlocks.flatMap((tb) =>
          getActivitiesForTimeBlock(tb.id)
        );
        return dayActivities.some((a) => {
          if (filterType !== "all" && a.type !== filterType) return false;
          if (filterStatus !== "all" && a.status !== filterStatus) return false;
          if (filterTag !== "all" && !a.tags.includes(filterTag)) return false;
          return true;
        });
      });
    }

    return result;
  }, [
    days,
    activities,
    filterCity,
    filterType,
    filterStatus,
    filterTag,
    hasActiveFilters,
    getActivitiesForTimeBlock,
  ]);

  // Group days by city for "All Trip" mode dividers
  const dayGroups = useMemo(() => {
    if (filterCity !== "all") return null;

    const groups: { cityId: string; cityName: string; days: Day[] }[] = [];
    let currentCityId = "";

    for (const day of filteredDays) {
      if (day.cityId !== currentCityId) {
        const city = cities.find((c) => c.id === day.cityId);
        groups.push({
          cityId: day.cityId,
          cityName: city?.name || "Unknown",
          days: [day],
        });
        currentCityId = day.cityId;
      } else {
        groups[groups.length - 1].days.push(day);
      }
    }

    return groups;
  }, [filteredDays, filterCity, cities]);

  if (days.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ItineraryEmptyState />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Day-by-Day Itinerary</h1>
        <p className="text-muted-foreground">
          {days.length} days across {cities.length} cities
        </p>
      </div>

      {/* City Tabs - sticky */}
      <div className="sticky top-0 z-10 bg-background pb-2 -mx-6 px-6 border-b">
        <Tabs
          value={filterCity}
          onValueChange={setFilterCity}
          className="w-full"
        >
          <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0 overflow-x-auto md:flex-nowrap">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-muted shrink-0"
            >
              <span className="flex items-center gap-1.5">
                All Trip
                <span className="text-xs text-muted-foreground">
                  ({days.length}d)
                </span>
              </span>
            </TabsTrigger>
            {cities.map((city, index) => {
              const dotColor = cityDotColors[index % cityDotColors.length];
              const dayCount = calculateDaysBetween(
                city.dateRange.start,
                city.dateRange.end
              );
              const startLabel = formatDate(city.dateRange.start, {
                month: "short",
                day: "numeric",
              });
              const endLabel = formatDate(city.dateRange.end, {
                month: "short",
                day: "numeric",
              });

              return (
                <TabsTrigger
                  key={city.id}
                  value={city.id}
                  className="data-[state=active]:bg-muted shrink-0"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn("h-2 w-2 rounded-full shrink-0", dotColor)}
                    />
                    <span className="hidden md:inline">
                      {city.name} &middot; {startLabel}&ndash;{endLabel} &middot; {dayCount}d
                    </span>
                    <span className="md:hidden">{city.name}</span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Filter/Sort Toolbar */}
        <FilterToolbar
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterTag={filterTag}
          onFilterTagChange={setFilterTag}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact((v) => !v)}
        />
      </div>

      {/* Day Cards */}
      <div className="space-y-4 mt-4">
        {filterCity === "all" && dayGroups
          ? dayGroups.map((group, groupIndex) => {
              const dotColor =
                cityDotColors[
                  cities.findIndex((c) => c.id === group.cityId) %
                    cityDotColors.length
                ];
              return (
                <div key={group.cityId}>
                  {groupIndex > 0 && <Separator className="my-6" />}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full shrink-0",
                        dotColor
                      )}
                    />
                    <h2 className="text-lg font-semibold">{group.cityName}</h2>
                    <span className="text-sm text-muted-foreground">
                      ({group.days.length} days)
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.days.map((day) => (
                      <DayCard
                        key={day.id}
                        day={day}
                        isExpanded={expandedDays.has(day.id)}
                        onToggle={() => toggleDay(day.id)}
                        isCompact={isCompact}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          : filteredDays.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                isExpanded={expandedDays.has(day.id)}
                onToggle={() => toggleDay(day.id)}
                isCompact={isCompact}
              />
            ))}

        {filteredDays.length === 0 && hasActiveFilters && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">
              No days match the current filters. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
