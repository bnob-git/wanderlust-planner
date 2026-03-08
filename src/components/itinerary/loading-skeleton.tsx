"use client";

import { cn } from "@/lib/utils";

export function ItineraryLoadingSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-60 bg-muted animate-pulse rounded" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Day card skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <DayCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function DayCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        <div className="flex-1">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function ItineraryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={cn(
        "rounded-full p-4 bg-muted mb-4"
      )}>
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-1">No days planned yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Start building your itinerary by adding cities and days to your trip.
      </p>
    </div>
  );
}
